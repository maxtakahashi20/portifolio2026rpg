package main

import (
	"crypto/rand"
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

const maxBody = 512 * 1024

type project struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Stacks      []string `json:"stacks"`
	SiteURL     string   `json:"siteUrl,omitempty"`
	RepoURL     string   `json:"repoUrl,omitempty"`
	CreatedAt   string   `json:"createdAt"`
	UpdatedAt   string   `json:"updatedAt"`
}

type createBody struct {
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Stacks      interface{} `json:"stacks"`
	SiteURL     any         `json:"siteUrl"`
	RepoURL     any         `json:"repoUrl"`
}

type store struct {
	mu       sync.Mutex
	dataPath string
}

func main() {
	for _, p := range []string{".env", filepath.Join("src", ".env")} {
		loadDotEnv(p)
	}

	port := strings.TrimSpace(os.Getenv("PORT"))
	if port == "" {
		port = "8787"
	}

	dataPath := strings.TrimSpace(os.Getenv("PROJECTS_DATA_PATH"))
	if dataPath == "" {
		dataPath = filepath.Join("server", "data", "projects.json")
	}

	st := &store{dataPath: dataPath}
	if err := st.ensureFile(); err != nil {
		fmt.Fprintf(os.Stderr, "dados: %v\n", err)
		os.Exit(1)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/projects", st.handleProjectsCollection)
	mux.HandleFunc("/api/projects/", st.handleProjectItem)

	addr := ":" + port
	fmt.Printf("API Go em http://localhost%s\n", addr)
	if err := http.ListenAndServe(addr, withCORS(mux)); err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		os.Exit(1)
	}
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h := w.Header()
		h.Set("Access-Control-Allow-Origin", "*")
		h.Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		h.Set("Access-Control-Allow-Headers", "Content-Type, X-Admin-Secret")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (st *store) handleProjectsCollection(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		st.handleList(w)
	case http.MethodPost:
		st.handleCreate(w, r)
	default:
		http.Error(w, "", http.StatusMethodNotAllowed)
	}
}

func (st *store) handleProjectItem(w http.ResponseWriter, r *http.Request) {
	id := strings.Trim(strings.TrimPrefix(r.URL.Path, "/api/projects/"), "/")
	if id == "" {
		http.NotFound(w, r)
		return
	}
	switch r.Method {
	case http.MethodPut:
		st.handleUpdate(w, r, id)
	case http.MethodDelete:
		st.handleDelete(w, r, id)
	default:
		http.Error(w, "", http.StatusMethodNotAllowed)
	}
}

func (st *store) handleList(w http.ResponseWriter) {
	list, err := st.load()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Falha ao ler projetos"})
		return
	}
	sort.Slice(list, func(i, j int) bool {
		return list[i].UpdatedAt > list[j].UpdatedAt
	})
	writeJSON(w, http.StatusOK, list)
}

func (st *store) handleCreate(w http.ResponseWriter, r *http.Request) {
	if err := requireAdmin(r); err != nil {
		writeAuthError(w, err)
		return
	}
	body, err := readBody(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "JSON inválido"})
		return
	}
	var in createBody
	if err := json.Unmarshal(body, &in); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "JSON inválido"})
		return
	}
	name := strings.TrimSpace(in.Name)
	desc := strings.TrimSpace(in.Description)
	if name == "" || desc == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "name e description são obrigatórios"})
		return
	}
	stacks, ok := parseStacks(in.Stacks)
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "stacks deve ser lista ou texto separado por vírgula"})
		return
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	p := project{
		ID:          newUUID(),
		Name:        name,
		Description: desc,
		Stacks:      stacks,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	if s, ok := stringOrEmpty(in.SiteURL); ok && s != "" {
		p.SiteURL = s
	}
	if s, ok := stringOrEmpty(in.RepoURL); ok && s != "" {
		p.RepoURL = s
	}

	st.mu.Lock()
	defer st.mu.Unlock()
	list, err := st.loadUnlocked()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Falha ao ler projetos"})
		return
	}
	list = append(list, p)
	if err := st.saveUnlocked(list); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Falha ao criar projeto"})
		return
	}
	writeJSON(w, http.StatusCreated, p)
}

func (st *store) handleUpdate(w http.ResponseWriter, r *http.Request, id string) {
	if err := requireAdmin(r); err != nil {
		writeAuthError(w, err)
		return
	}
	body, err := readBody(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "JSON inválido"})
		return
	}

	var raw map[string]json.RawMessage
	if err := json.Unmarshal(body, &raw); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "JSON inválido"})
		return
	}

	st.mu.Lock()
	defer st.mu.Unlock()
	list, err := st.loadUnlocked()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Falha ao ler projetos"})
		return
	}
	idx := -1
	for i := range list {
		if list[i].ID == id {
			idx = i
			break
		}
	}
	if idx < 0 {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Projeto não encontrado"})
		return
	}
	next := list[idx]

	if v, ok := raw["name"]; ok {
		var s string
		_ = json.Unmarshal(v, &s)
		next.Name = strings.TrimSpace(s)
	}
	if v, ok := raw["description"]; ok {
		var s string
		_ = json.Unmarshal(v, &s)
		next.Description = strings.TrimSpace(s)
	}
	if v, ok := raw["stacks"]; ok {
		var stacks interface{}
		if err := json.Unmarshal(v, &stacks); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "stacks inválido"})
			return
		}
		parsed, ok := parseStacks(stacks)
		if !ok {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "stacks deve ser lista ou texto separado por vírgula"})
			return
		}
		next.Stacks = parsed
	}
	if v, ok := raw["siteUrl"]; ok {
		var s string
		_ = json.Unmarshal(v, &s)
		s = strings.TrimSpace(s)
		if s == "" {
			next.SiteURL = ""
		} else {
			next.SiteURL = s
		}
	}
	if v, ok := raw["repoUrl"]; ok {
		var s string
		_ = json.Unmarshal(v, &s)
		s = strings.TrimSpace(s)
		if s == "" {
			next.RepoURL = ""
		} else {
			next.RepoURL = s
		}
	}

	if next.Name == "" || next.Description == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "name e description não podem ficar vazios"})
		return
	}
	next.UpdatedAt = time.Now().UTC().Format(time.RFC3339Nano)
	list[idx] = next
	if err := st.saveUnlocked(list); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Falha ao atualizar projeto"})
		return
	}
	writeJSON(w, http.StatusOK, next)
}

func (st *store) handleDelete(w http.ResponseWriter, r *http.Request, id string) {
	if err := requireAdmin(r); err != nil {
		writeAuthError(w, err)
		return
	}

	st.mu.Lock()
	defer st.mu.Unlock()
	list, err := st.loadUnlocked()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Falha ao ler projetos"})
		return
	}
	idx := -1
	for i := range list {
		if list[i].ID == id {
			idx = i
			break
		}
	}
	if idx < 0 {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Projeto não encontrado"})
		return
	}
	list = append(list[:idx], list[idx+1:]...)
	if err := st.saveUnlocked(list); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Falha ao apagar projeto"})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func requireAdmin(r *http.Request) error {
	expected := strings.TrimSpace(os.Getenv("ADMIN_SECRET"))
	if expected == "" {
		return errNoAdminSecret
	}
	if strings.TrimSpace(r.Header.Get("X-Admin-Secret")) != expected {
		return errUnauthorized
	}
	return nil
}

var errNoAdminSecret = errors.New("no secret")
var errUnauthorized = errors.New("unauthorized")

func writeAuthError(w http.ResponseWriter, err error) {
	switch err {
	case errNoAdminSecret:
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "ADMIN_SECRET não configurado no servidor (.env)"})
	case errUnauthorized:
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Não autorizado"})
	default:
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Não autorizado"})
	}
}

func readBody(r *http.Request) ([]byte, error) {
	defer r.Body.Close()
	return io.ReadAll(io.LimitReader(r.Body, maxBody))
}

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func (st *store) ensureFile() error {
	dir := filepath.Dir(st.dataPath)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	if _, err := os.Stat(st.dataPath); os.IsNotExist(err) {
		return os.WriteFile(st.dataPath, []byte("[]\n"), 0o644)
	}
	return nil
}

func (st *store) load() ([]project, error) {
	st.mu.Lock()
	defer st.mu.Unlock()
	return st.loadUnlocked()
}

func (st *store) loadUnlocked() ([]project, error) {
	b, err := os.ReadFile(st.dataPath)
	if err != nil {
		return nil, err
	}
	var list []project
	if err := json.Unmarshal(b, &list); err != nil {
		return []project{}, nil
	}
	return list, nil
}

func (st *store) saveUnlocked(list []project) error {
	b, err := json.MarshalIndent(list, "", "  ")
	if err != nil {
		return err
	}
	b = append(b, '\n')
	return os.WriteFile(st.dataPath, b, 0o644)
}

func parseStacks(v interface{}) ([]string, bool) {
	if v == nil {
		return nil, false
	}
	switch t := v.(type) {
	case string:
		parts := strings.FieldsFunc(t, func(r rune) bool {
			return r == ',' || r == ';'
		})
		var out []string
		for _, p := range parts {
			p = strings.TrimSpace(p)
			if p != "" {
				out = append(out, p)
			}
		}
		return out, true
	case []interface{}:
		var out []string
		for _, it := range t {
			s, ok := it.(string)
			if !ok {
				s = fmt.Sprint(it)
			}
			s = strings.TrimSpace(s)
			if s != "" {
				out = append(out, s)
			}
		}
		return out, true
	default:
		return nil, false
	}
}

func stringOrEmpty(v any) (string, bool) {
	if v == nil {
		return "", false
	}
	switch t := v.(type) {
	case string:
		return strings.TrimSpace(t), true
	default:
		return strings.TrimSpace(fmt.Sprint(t)), true
	}
}

func newUUID() string {
	var buf [16]byte
	if _, err := rand.Read(buf[:]); err != nil {
		panic(err)
	}
	buf[6] = (buf[6] & 0x0f) | 0x40
	buf[8] = (buf[8] & 0x3f) | 0x80
	low := uint64(buf[10])<<40 | uint64(buf[11])<<32 | uint64(buf[12])<<24 |
		uint64(buf[13])<<16 | uint64(buf[14])<<8 | uint64(buf[15])
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		binary.BigEndian.Uint32(buf[0:4]),
		binary.BigEndian.Uint16(buf[4:6]),
		binary.BigEndian.Uint16(buf[6:8]),
		binary.BigEndian.Uint16(buf[8:10]),
		low,
	)
}

func loadDotEnv(path string) {
	b, err := os.ReadFile(path)
	if err != nil {
		return
	}
	for _, line := range strings.Split(string(b), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		i := strings.IndexByte(line, '=')
		if i <= 0 {
			continue
		}
		k := strings.TrimSpace(line[:i])
		v := strings.TrimSpace(line[i+1:])
		if os.Getenv(k) == "" {
			_ = os.Setenv(k, v)
		}
	}
}

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
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/joho/godotenv"
	supabase "github.com/supabase-community/supabase-go"
)

const maxBody = 512 * 1024

type project struct {
	ID          string   `json:"id" db:"id"`
	Name        string   `json:"name" db:"name"`
	Description string   `json:"description" db:"description"`
	Stacks      []string `json:"stacks" db:"stacks"`
	SiteURL     string   `json:"siteUrl,omitempty" db:"site_url"`
	RepoURL     string   `json:"repoUrl,omitempty" db:"repo_url"`
	CreatedAt   string   `json:"createdAt" db:"created_at"`
	UpdatedAt   string   `json:"updatedAt" db:"updated_at"`
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
	supabase *supabase.Client
}

func main() {
	_ = godotenv.Load()

	supabaseURL := strings.TrimSpace(os.Getenv("SUPABASE_URL"))
	supabaseKey := strings.TrimSpace(os.Getenv("SUPABASE_KEY"))

	if supabaseURL == "" || supabaseKey == "" {
		fmt.Fprintln(os.Stderr, "SUPABASE_URL e SUPABASE_KEY não configuradas")
		os.Exit(1)
	}

	client, err := supabase.NewClient(
		supabaseURL,
		supabaseKey,
		nil,
	)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Erro ao inicializar Supabase: %v\n", err)
		os.Exit(1)
	}

	port := strings.TrimSpace(os.Getenv("PORT"))
	if port == "" {
		port = "8787"
	}

	st := &store{
		supabase: client,
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/api/projects", st.handleProjectsCollection)
	mux.HandleFunc("/api/projects/", st.handleProjectItem)

	addr := ":" + port

	fmt.Printf("API Go à escuta na porta %s\n", port)

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
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Falha ao ler projetos",
		})
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
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "JSON inválido",
		})
		return
	}

	var in createBody

	if err := json.Unmarshal(body, &in); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "JSON inválido",
		})
		return
	}

	name := strings.TrimSpace(in.Name)
	desc := strings.TrimSpace(in.Description)

	if name == "" || desc == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "name e description são obrigatórios",
		})
		return
	}

	stacks, ok := parseStacks(in.Stacks)

	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "stacks inválido",
		})
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

	_, _, err = st.supabase.
		From("projects").
		Insert(p, false, "", "", "").
		Execute()

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
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
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "JSON inválido",
		})
		return
	}

	var raw map[string]interface{}

	if err := json.Unmarshal(body, &raw); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error": "JSON inválido",
		})
		return
	}

	updateData := map[string]interface{}{}

	if v, ok := raw["name"]; ok {
		updateData["name"] = strings.TrimSpace(fmt.Sprint(v))
	}

	if v, ok := raw["description"]; ok {
		updateData["description"] = strings.TrimSpace(fmt.Sprint(v))
	}

	if v, ok := raw["stacks"]; ok {
		stacks, ok := parseStacks(v)

		if !ok {
			writeJSON(w, http.StatusBadRequest, map[string]string{
				"error": "stacks inválido",
			})
			return
		}

		updateData["stacks"] = stacks
	}

	if v, ok := raw["siteUrl"]; ok {
		updateData["site_url"] = strings.TrimSpace(fmt.Sprint(v))
	}

	if v, ok := raw["repoUrl"]; ok {
		updateData["repo_url"] = strings.TrimSpace(fmt.Sprint(v))
	}

	updateData["updated_at"] = time.Now().UTC().Format(time.RFC3339Nano)

	_, _, err = st.supabase.
		From("projects").
		Update(updateData, "", "").
		Eq("id", id).
		Execute()

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "Projeto atualizado",
	})
}

func (st *store) handleDelete(w http.ResponseWriter, r *http.Request, id string) {
	if err := requireAdmin(r); err != nil {
		writeAuthError(w, err)
		return
	}

	_, _, err := st.supabase.
		From("projects").
		Delete("", "").
		Eq("id", id).
		Execute()

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
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
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{
			"error": "ADMIN_SECRET não configurado",
		})

	case errUnauthorized:
		writeJSON(w, http.StatusUnauthorized, map[string]string{
			"error": "Não autorizado",
		})

	default:
		writeJSON(w, http.StatusUnauthorized, map[string]string{
			"error": "Não autorizado",
		})
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

func (st *store) load() ([]project, error) {
	st.mu.Lock()
	defer st.mu.Unlock()

	return st.loadUnlocked()
}

func (st *store) loadUnlocked() ([]project, error) {
	data, _, err := st.supabase.
		From("projects").
		Select("*", "", false).
		Execute()

	if err != nil {
		return nil, err
	}

	var projects []project

	if err := json.Unmarshal(data, &projects); err != nil {
		return nil, err
	}

	return projects, nil
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
			s := strings.TrimSpace(fmt.Sprint(it))

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

	low := uint64(buf[10])<<40 |
		uint64(buf[11])<<32 |
		uint64(buf[12])<<24 |
		uint64(buf[13])<<16 |
		uint64(buf[14])<<8 |
		uint64(buf[15])

	return fmt.Sprintf(
		"%08x-%04x-%04x-%04x-%012x",
		binary.BigEndian.Uint32(buf[0:4]),
		binary.BigEndian.Uint16(buf[4:6]),
		binary.BigEndian.Uint16(buf[6:8]),
		binary.BigEndian.Uint16(buf[8:10]),
		low,
	)
}
import type { IconType } from "react-icons";
import { FaAws } from "react-icons/fa6";
import { IoCodeSlash } from "react-icons/io5";
import {
  SiAngular,
  SiDart,
  SiDjango,
  SiDocker,
  SiDotnet,
  SiElasticsearch,
  SiExpress,
  SiFastapi,
  SiFirebase,
  SiFlutter,
  SiFramer,
  SiGit,
  SiGithub,
  SiGnubash,
  SiGo,
  SiGraphql,
  SiCss,
  SiHtml5,
  SiJavascript,
  SiKubernetes,
  SiLinux,
  SiMongodb,
  SiMysql,
  SiNestjs,
  SiNextdotjs,
  SiNginx,
  SiNodedotjs,
  SiPhp,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiReact,
  SiRabbitmq,
  SiRedis,
  SiRust,
  SiSass,
  SiSpringboot,
  SiSupabase,
  SiSvelte,
  SiSwagger,
  SiSwift,
  SiTailwindcss,
  SiTerraform,
  SiTypescript,
  SiVite,
  SiVuedotjs,
  SiWebpack,
} from "react-icons/si";

const FallbackIcon = IoCodeSlash;

export interface StackCatalogEntry {
  id: string;
  label: string;
  Icon: IconType;
}

/** Lista fixa para o modal admin — pode acrescentar entradas aqui. */
export const STACK_CATALOG: StackCatalogEntry[] = [
  { id: "react", label: "React", Icon: SiReact },
  { id: "vue", label: "Vue.js", Icon: SiVuedotjs },
  { id: "angular", label: "Angular", Icon: SiAngular },
  { id: "svelte", label: "Svelte", Icon: SiSvelte },
  { id: "typescript", label: "TypeScript", Icon: SiTypescript },
  { id: "javascript", label: "JavaScript", Icon: SiJavascript },
  { id: "nodejs", label: "Node.js", Icon: SiNodedotjs },
  { id: "go", label: "Go", Icon: SiGo },
  { id: "python", label: "Python", Icon: SiPython },
  { id: "rust", label: "Rust", Icon: SiRust },
  { id: "php", label: "PHP", Icon: SiPhp },
  { id: "swift", label: "Swift", Icon: SiSwift },
  { id: "dart", label: "Dart", Icon: SiDart },
  { id: "flutter", label: "Flutter", Icon: SiFlutter },
  { id: "csharp", label: "C# / .NET", Icon: SiDotnet },
  { id: "html", label: "HTML", Icon: SiHtml5 },
  { id: "css", label: "CSS", Icon: SiCss },
  { id: "tailwind", label: "Tailwind CSS", Icon: SiTailwindcss },
  { id: "sass", label: "Sass", Icon: SiSass },
  { id: "vite", label: "Vite", Icon: SiVite },
  { id: "webpack", label: "Webpack", Icon: SiWebpack },
  { id: "nextjs", label: "Next.js", Icon: SiNextdotjs },
  { id: "express", label: "Express", Icon: SiExpress },
  { id: "nestjs", label: "NestJS", Icon: SiNestjs },
  { id: "graphql", label: "GraphQL", Icon: SiGraphql },
  { id: "springboot", label: "Spring Boot", Icon: SiSpringboot },
  { id: "fastapi", label: "FastAPI", Icon: SiFastapi },
  { id: "django", label: "Django", Icon: SiDjango },
  { id: "docker", label: "Docker", Icon: SiDocker },
  { id: "kubernetes", label: "Kubernetes", Icon: SiKubernetes },
  { id: "nginx", label: "Nginx", Icon: SiNginx },
  { id: "linux", label: "Linux", Icon: SiLinux },
  { id: "bash", label: "Bash", Icon: SiGnubash },
  { id: "git", label: "Git", Icon: SiGit },
  { id: "github", label: "GitHub", Icon: SiGithub },
  { id: "postgresql", label: "PostgreSQL", Icon: SiPostgresql },
  { id: "mysql", label: "MySQL", Icon: SiMysql },
  { id: "mongodb", label: "MongoDB", Icon: SiMongodb },
  { id: "redis", label: "Redis", Icon: SiRedis },
  { id: "elasticsearch", label: "Elasticsearch", Icon: SiElasticsearch },
  { id: "rabbitmq", label: "RabbitMQ", Icon: SiRabbitmq },
  { id: "prisma", label: "Prisma", Icon: SiPrisma },
  { id: "supabase", label: "Supabase", Icon: SiSupabase },
  { id: "firebase", label: "Firebase", Icon: SiFirebase },
  { id: "aws", label: "AWS", Icon: FaAws },
  { id: "terraform", label: "Terraform", Icon: SiTerraform },
  { id: "swagger", label: "Swagger / OpenAPI", Icon: SiSwagger },
  { id: "framer-motion", label: "Framer Motion", Icon: SiFramer },
];

function slugGuess(s: string): string {
  return s.trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, "-");
}

function catalogMatch(raw: string): StackCatalogEntry | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const lower = t.toLowerCase();
  const slug = slugGuess(t);
  return (
    STACK_CATALOG.find((e) => e.id === lower) ??
    STACK_CATALOG.find((e) => e.label.toLowerCase() === lower) ??
    STACK_CATALOG.find((e) => e.id === slug)
  );
}

/** Ícone + rótulo para exibir no portfólio (e fallback para texto livre). */
export function resolveStack(raw: string): { label: string; Icon: IconType } {
  const hit = catalogMatch(raw);
  if (hit) return { label: hit.label, Icon: hit.Icon };
  const t = raw.trim();
  if (!t) return { label: "", Icon: FallbackIcon };
  return { label: t, Icon: FallbackIcon };
}

/** Converte texto antigo ou label para id do catálogo quando existir. */
export function normalizeStackToken(raw: string): string {
  return catalogMatch(raw)?.id ?? raw.trim();
}

/** Rótulo amigável para chips no admin (id do catálogo ou texto custom). */
export function formatStackLabel(token: string): string {
  const cat = STACK_CATALOG.find((e) => e.id === token);
  return cat?.label ?? token;
}

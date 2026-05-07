import type { InventoryItem, PortfolioSection } from "../game/types";

export const HERO_INTRO = {
  authorName: "Max Takahashi",
  callToAction: "Entrar",
  hint:
    "Menu: caminha até o totem e o texto abre ao chegar · E abre se já estiver perto · WASD · clique no chão",
};

export const PORTFOLIO_SECTIONS: PortfolioSection[] = [
  {
    id: "origem",
    title: "Origem",
    subtitle: "Construção deliberada",
    rune: "✦",
    body: [
      {
        type: "paragraph",
        text: " Meu nome é Max Takahashi, tenho 20 anos.",
      },
      {
        type: "paragraph",
        text:
          "Desde cedo, fui atraído não pelo óbvio, mas pelo funcionamento das coisas. A tecnologia deixou de ser curiosidade quando percebi que código não é apenas ferramenta — é linguagem. Uma linguagem capaz de transformar ideias em sistemas vivos, escaláveis e relevantes.",
      },
      {
        type: "paragraph",
        text:
          "Programar, para mim, é criar estruturas que resolvem problemas reais com precisão. Não se trata apenas de fazer algo funcionar, mas de entender o porquê, otimizar o como e antecipar o que vem depois. Cada projeto é uma oportunidade de evoluir não só tecnicamente, mas na forma de pensar.",
      },
      {
        type: "paragraph",
        text: "Minha disciplina não começa no código — ela é construída fora dele.",
      },
      {
        type: "paragraph",
        text:
          "O treino na academia molda consistência, resiliência e clareza sob pressão. É onde desenvolvo a mentalidade que levo para cada desafio técnico: progresso contínuo, sem atalhos. Muitos dos problemas mais complexos que enfrento são resolvidos longe da tela — e executados com precisão quando volto.",
      },
      {
        type: "paragraph",
        text:
          "A música é o meu ambiente operacional. Ela sustenta o foco, organiza o pensamento e abre espaço para criatividade estruturada — aquela que não é aleatória, mas intencional.",
      },
      {
        type: "paragraph",
        text:
          "Hoje, meu objetivo é claro: construir soluções que tenham impacto. Não apenas interfaces bonitas ou códigos funcionais, mas experiências que escalam, performam e geram valor real.",
      },
      {
        type: "paragraph",
        text: "Estou no início da jornada — mas com direção definida.",
      },
      {
        type: "quote",
        text:
          "Há mais de um caminho para o topo da montanha — e cada caminho ensina algo diferente sobre a montanha.",
      },
      {
        type: "paragraph",
        text: "Eu escolhi construir o meu.",
      },
    ],
  },
  {
    id: "feitos",
    title: "Feitos",
    subtitle: "Aventuras já encerradas",
    rune: "⌬",
    body: [
      {
        type: "paragraph",
        text:
          "Navego todo  dia  entre o FrontEnd e BackEnd",
      },
      {
        type: "paragraph",
        text:
          "Atualmente trabalho na CorsiEnterprise,mais  sempre aberto pra  novos  projetos/freelancer",
      },
      {
        type: "links",
        items: [
          {
            label: "GitHub",
            url: "https://github.com/maxtakahashi20",
            glyph: "⌥",
          },
        ],
      },
    ],
  },
  {
    id: "projetos",
    title: "Projetos",
    subtitle: "Runas gravadas em repositório",
    rune: "⎔",
    body: [
      {
        type: "paragraph",
        text:
          "Seleção de trabalhos com nome, descrição, tecnologias usadas e links para site ou repositório quando existirem.",
      },
    ],
  },
  {
    id: "grimorio",
    title: "Grimório",
    subtitle: "O que o viajante já aprendeu",
    rune: "✷",
    body: [
      {
        type: "list",
        label: "Linguagens",
        items: [ "TypeScript", "JavaScript", "Node.js", "Express.js", "Tailwind CSS" , "PostgreSQL" , "NoSql" , "Golang", "MySQL"],
      },
      {
        type: "list",
        label: "Frameworks & libs",
        items: ["React", "Vue.js", "Next", "Framer Motion"],
      },
      {
        type: "list",
        label: "Ferramentas & ambiente",
        items: ["Docker", "Git", "Linux", "Vite"],
      },
      {
        type: "list",
        label: "Idiomas",
        items: ["Português (nativo)", "Inglês (intermediário/avançado)"],
      },
    ],
  },
  {
    id: "cronica",
    title: "Crônica",
    subtitle: "Como cheguei até aqui",
    rune: "❖",
    body: [
      {
        type: "paragraph",
        text:
          "Meu primeiro contato com programação foi aos 11 anos, dentro do YouTube, tentando dar forma a jogos meio tortos mas inteiramente meus.",
      },
      {
        type: "paragraph",
        text:
          "Daí em diante a curiosidade foi mudando de cor: dos pixels às APIs, das interfaces aos protocolos. Hoje circulo entre web, sistemas e segurança, sempre com a mesma pergunta: como isso funciona por dentro?",
      },
      {
        type: "quote",
        text: "Só vence o adversário quem domina antes a própria mente.",
        author: "Inspirado em Miyamoto Musashi",
      },
    ],
  },
  {
    id: "pacto",
    title: "Pacto",
    subtitle: "Pra continuar a conversa",
    rune: "✺",
    body: [
      {
        type: "paragraph",
        text:
          "Se algo aqui chamou sua atenção, é fácil seguir o fio. Costumo responder rápido em qualquer um destes canais.",
      },
      {
        type: "links",
        items: [
          {
            label: "maxwanber@gmail.com",
            url: "mailto:maxwanber@gmail.com",
            glyph: "✉",
          },
          {
            label: "GitHub",
            url: "https://github.com/maxtakahashi20",
            glyph: "⌥",
          },
          {
            label: "LinkedIn",
            url: "www.linkedin.com/in/ismaeldelimamarques",
            glyph: "⌬",
          },
          {
            label: "Instagram",
            url: "https://www.instagram.com/max_takahashi21/",
            glyph: "❍",
          }
        ],
      },
    ],
  },
];

export const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: "lantern",
    name: "Lanterna do Eco",
    glyph: "❂",
    description: "Ilumina trechos esquecidos do vale.",
  },
  {
    id: "compass",
    name: "Bússola Rúnica",
    glyph: "✺",
    description: "Aponta sempre para o totem mais próximo.",
  },
  {
    id: "quill",
    name: "Pena do Cronista",
    glyph: "✒",
    description: "Marca um totem como lido na sua jornada.",
  },
  {
    id: "sigil",
    name: "Sigilo de Contato",
    glyph: "✦",
    description: "Atalho rápido para o pacto final.",
  },
];

export const SECTION_INDEX_BY_ID = Object.fromEntries(
  PORTFOLIO_SECTIONS.map((s) => [s.id, s] as const),
);

/**
 * This file contains the configuration for the documentation
 * to be used by files like:
 * - src/components/command-menu.tsx
 * - src/components/mobile-nav.tsx
 * - src/app/[locale]/docs/layout.tsx
 * - src/lib/opendocs/components/docs/pager.tsx
 */

import type { DocsConfig } from '@/lib/opendocs/types/docs'

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      href: '/docs/the-law',
      title: {
        en: 'THE LAW',
        pt: 'A LEI',
      },
    },
    {
      href: '/docs',
      title: {
        en: 'Documentation',
        pt: 'Documentação',
      },
    },
    {
      href: '/blog',
      title: {
        en: 'Blog',
        pt: 'Blog',
      },
    },
  ],

  sidebarNav: [
    {
      title: {
        en: 'THE LAW OF OWL',
        pt: 'A LEI DO OWL',
      },
      items: [
        {
          href: '/docs/the-law',
          title: {
            en: 'The Law — Overview',
            pt: 'A Lei — Visão Geral',
          },
          items: [],
        },
        {
          href: '/docs/the-law-articles',
          title: {
            en: 'The Seven Articles',
            pt: 'Os Sete Artigos',
          },
          items: [],
        },
        {
          href: '/docs/the-law-convergences',
          title: {
            en: 'The Seven Convergences',
            pt: 'As Sete Convergências',
          },
          items: [],
        },
        {
          href: '/docs/the-law-grounding',
          title: {
            en: 'Mathematical Grounding & OWL',
            pt: 'Fundamentação Matemática & OWL',
          },
          items: [],
        },
      ],
    },
    {
      title: {
        en: 'Getting Started',
        pt: 'Getting Started',
      },
      items: [
        {
          href: '/docs',
          title: {
            en: 'Introduction',
            pt: 'Introdução',
          },
          items: [],
        },
        {
          href: '/docs/installation',
          title: {
            en: 'Installation',
            pt: 'Instalação',
          },
          items: [],
        },
        {
          href: '/docs/quick-start',
          title: {
            en: 'Quick Start',
            pt: 'Início Rápido',
          },
          items: [],
        },
      ],
    },
    {
      title: {
        en: 'Technical Implementation',
        pt: 'Implementação Técnica',
      },
      items: [
        {
          href: '/docs/technical-implementation',
          title: {
            en: 'Core Implementation',
            pt: 'Implementação Central',
          },
          items: [],
        },
        {
          href: '/docs/api-reference',
          title: {
            en: 'API Reference',
            pt: 'Referência da API',
          },
          items: [],
        },
        {
          href: '/docs/enhanced-features',
          title: {
            en: 'Enhanced Safety Features',
            pt: 'Recursos de Segurança Aprimorados',
          },
          items: [],
        },
      ],
    },
    {
      title: {
        en: 'Framework',
        pt: 'Framework',
      },
      items: [
        {
          href: '/docs/framework',
          title: {
            en: 'Framework Overview',
            pt: 'Visão Geral do Framework',
          },
          items: [],
        },
        {
          href: '/docs/atlas-mapping',
          title: {
            en: 'MITRE ATLAS Mapping',
            pt: 'Mapeamento MITRE ATLAS',
          },
          items: [],
        },
        {
          href: '/docs/null-protocol',
          title: {
            en: 'The Null Protocol',
            pt: 'O Protocolo Null',
          },
          items: [],
        },
        {
          href: '/docs/framework-compliance',
          title: {
            en: 'Compliance Standards',
            pt: 'Padrões de Conformidade',
          },
          items: [],
        },
        {
          href: '/docs/verified',
          title: {
            en: 'AlephOneNull Verified',
            pt: 'AlephOneNull Verificado',
          },
          items: [],
        },
      ],
    },
    {
      title: {
        en: 'Implementation Paths',
        pt: 'Caminhos de Implementação',
      },
      items: [
        {
          href: '/docs/developer-level-implementation',
          title: {
            en: 'Developer Implementation',
            pt: 'Implementação para Desenvolvedores',
          },
          items: [],
        },
        {
          href: '/docs/provider-implementation',
          title: {
            en: 'Provider Implementation',
            pt: 'Implementação para Provedores',
          },
          items: [],
        },
      ],
    },
    {
      title: {
        en: 'Examples & Integration',
        pt: 'Exemplos e Integração',
      },
      items: [
        {
          href: '/docs/live-demo',
          title: {
            en: 'Live Demo',
            pt: 'Demo ao Vivo',
          },
          items: [],
        },
        {
          href: '/docs/live-demo-latest',
          title: {
            en: 'Latest Models Demo',
            pt: 'Demo dos Modelos Mais Recentes',
          },
          items: [],
        },
        // TODO: Re-enable Interactive Demo when MDX components are ready
        // {
        //   href: '/docs/interactive-demo',
        //   title: {
        //     en: 'Interactive Demo',
        //     pt: 'Demo Interativo',
        //   },
        //   items: [],
        // },
        {
          href: '/docs/universal-wrapper',
          title: {
            en: 'Universal AI Wrapper',
            pt: 'Wrapper Universal de IA',
          },
          items: [],
        },
        {
          href: '/docs/guardrail-integration',
          title: {
            en: 'Behavioral Constraint Integration',
            pt: 'Integração de Restrições Comportamentais',
          },
          items: [],
        },
      ],
    },
    {
      title: {
        en: 'Resources',
        pt: 'Recursos',
      },
      items: [
        {
          href: '/docs/licensing',
          title: {
            en: 'Licensing',
            pt: 'Licenciamento',
          },
          items: [],
        },
        {
          href: '/prior-art',
          title: {
            en: 'Prior Art Timeline',
            pt: 'Cronologia de Arte Prévia',
          },
          items: [],
        },
        {
          href: '/blog/en/prior-art-timeline',
          title: {
            en: 'Prior Art (Article)',
            pt: 'Arte Prévia (Artigo)',
          },
          items: [],
        },
        {
          href: '/blog/en/theoretical-framework-academic',
          title: {
            en: 'Academic Paper',
            pt: 'Artigo Acadêmico',
          },
          items: [],
        },
        {
          href: '/blog/en/documented-evidence',
          title: {
            en: 'Evidence & Case Studies',
            pt: 'Evidências e Estudos de Caso',
          },
          items: [],
        },
      ],
    },
  ],
} as const

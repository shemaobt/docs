import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const siteUrl = process.env.DOCS_SITE_URL ?? 'https://shemaobt.github.io';
const siteBaseUrl = process.env.DOCS_BASE_URL ?? '/rfcs/';
const docsPath = process.env.RFCS_DOCS_PATH ?? '../rfcs';

const config: Config = {
  title: 'Shema RFCs',
  tagline: 'Oral-first research and architecture decisions',
  favicon: 'img/shema-icon.svg',

  future: {
    v4: true,
  },

  url: siteUrl,
  baseUrl: siteBaseUrl,
  trailingSlash: true,

  organizationName: 'shemaobt',
  projectName: 'rfcs',

  onBrokenLinks: 'throw',
  markdown: {
    format: 'md',
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: docsPath,
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/shemaobt/rfcs/tree/main/rfcs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themes: ['@docusaurus/theme-mermaid'],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Shema RFCs',
      logo: {
        alt: 'Shema RFCs Logo',
        src: 'img/shema-logo-dark.svg',
        srcDark: 'img/shema-logo-light.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'RFCs',
        },
        {
          href: 'https://github.com/shemaobt/rfcs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'All RFCs',
              to: '/docs/speech-to-speech',
            },
          ],
        },
        {
          title: 'Project',
          items: [
            {
              label: 'Repository',
              href: 'https://github.com/shemaobt/rfcs',
            },
          ],
        },
        {
          title: 'Process',
          items: [
            {
              label: 'RFC Workflow',
              href: 'https://github.com/shemaobt/rfcs/blob/main/README.md',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Shema`,
    },
    prism: {
      theme: prismThemes.vsLight,
      darkTheme: prismThemes.oneDark,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

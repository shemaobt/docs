import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const siteUrl = process.env.DOCS_SITE_URL ?? 'https://shemaobt.github.io';
const siteBaseUrl = process.env.DOCS_BASE_URL ?? '/';
const docsPath = process.env.DOCS_CONTENT_PATH ?? 'docs';
const rfcsDocsPath = process.env.RFCS_DOCS_PATH ?? '../rfcs';

const config: Config = {
  title: 'Shema Docs',
  tagline: 'Systems, architecture, process, and RFCs',
  favicon: 'img/shema-icon.svg',
  staticDirectories: ['static', '../assets'],

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
    format: 'detect',
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
            'https://github.com/shemaobt/docs-deploy/tree/main/site',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'rfcs',
        path: rfcsDocsPath,
        routeBasePath: 'rfcs',
        sidebarPath: './sidebarsRfcs.ts',
        editUrl: 'https://github.com/shemaobt/docs-deploy/tree/main/rfcs',
      },
    ],
  ],
  themes: ['@docusaurus/theme-mermaid'],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    docs: {
      sidebar: {
        hideable: false,
        autoCollapseCategories: true,
      },
    },
    navbar: {
      title: 'Shema Docs',
      logo: {
        alt: 'Shema Docs Logo',
        src: 'img/icone-preto.svg',
        srcDark: 'img/icone-branco.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/shemaobt/docs-deploy',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
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
              label: 'Docs',
              to: '/docs/intro',
            },
            {
              label: 'RFC Library',
              to: '/rfcs/speech-to-speech',
            },
          ],
        },
        {
          title: 'Project',
          items: [
            {
              label: 'Docs Repository',
              href: 'https://github.com/shemaobt/docs-deploy',
            },
            {
              label: 'RFC Repository',
              href: 'https://github.com/shemaobt/docs-deploy/tree/main/rfcs',
            },
          ],
        },
        {
          title: 'Process',
          items: [
            {
              label: 'RFC Workflow',
              to: '/docs/process/rfc-workflow',
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

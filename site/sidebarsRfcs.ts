import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebarsRfcs: SidebarsConfig = {
  rfcsSidebar: [
    {
      type: 'category',
      label: 'Knowledge Base',
      items: [
        {type: 'link', label: 'Documentation Map', href: '/docs/overview/documentation-map'},
        {type: 'link', label: 'System Landscape', href: '/docs/architecture/system-landscape'},
        {type: 'link', label: 'Systems Index', href: '/docs/systems/intro'},
        {type: 'link', label: 'RFC Workflow', href: '/docs/process/rfc-workflow'},
        {type: 'link', label: 'Content Governance', href: '/docs/process/content-governance'},
        {type: 'link', label: 'Glossary', href: '/docs/reference/glossary'},
      ],
    },
    {
      type: 'category',
      label: 'RFC Library (Creation Order)',
      items: [
        {
          type: 'category',
          label: 'Foundations',
          items: [
            {type: 'doc', id: 'speech-to-speech', label: '000 - Speech to Speech'},
            {type: 'doc', id: 'architecture-deep-dive', label: '001 - Architecture Deep Dive'},
            {type: 'doc', id: 'training-pipeline', label: '002 - Training Pipeline'},
            {type: 'doc', id: 'robotic-artifacts-analysis', label: '003 - Robotic Artifacts Analysis'},
          ],
        },
        {
          type: 'category',
          label: 'Model and Representation Strategy',
          items: [
            {type: 'doc', id: 'segmentation-strategy', label: '004 - Segmentation Strategy'},
            {type: 'doc', id: 'model-selection-analysis', label: '005 - Model Selection Analysis'},
            {type: 'doc', id: 'audiolm-integration', label: '006 - AudioLM Integration'},
            {type: 'doc', id: 'raw-acoustemes-storage', label: '007 - Raw Acoustemes Storage'},
            {type: 'doc', id: 'semantic-acoustic-mapping', label: '008 - Semantic Acoustic Mapping'},
            {type: 'doc', id: 'semantic-acoustic-linking', label: '008 - Semantic Acoustic Linking'},
          ],
        },
        {
          type: 'category',
          label: 'Translation Direction',
          items: [
            {
              type: 'doc',
              id: 'xeus-vs-mms-foundation-model-analysis',
              label: '009 - Xeus vs MMS Analysis',
            },
            {
              type: 'doc',
              id: 'parallel-acousteme-latent-translation',
              label: '010 - Parallel Acousteme Latent Translation',
            },
            {
              type: 'doc',
              id: 'oral-first-acousteme-translation-reframe',
              label: '011 - Oral-First Translation Reframe',
            },
          ],
        },
      ],
    },
  ],
};

export default sidebarsRfcs;

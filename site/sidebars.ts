import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Platform Overview',
      items: ['overview/documentation-map', 'architecture/system-landscape'],
    },
    {
      type: 'category',
      label: 'Systems',
      items: [
        'systems/intro',
        'systems/mm-poc-v2',
        'systems/obt-mentor-companion',
        'systems/translation-helper',
        'systems/tripod-studio',
      ],
    },
    {
      type: 'category',
      label: 'Research and Models',
      items: [
        'systems/meaning-map-generator',
        'systems/oral-bridge',
        'systems/proprietary-ml-models',
      ],
    },
    {
      type: 'category',
      label: 'Process',
      items: ['process/rfc-workflow', 'process/content-governance'],
    },
    {
      type: 'category',
      label: 'RFC Library (Creation Order)',
      items: [
        {
          type: 'category',
          label: 'Foundations',
          items: [
            {
              type: 'link',
              label: '000 - Speech to Speech',
              href: '/rfcs/speech-to-speech',
            },
            {
              type: 'link',
              label: '001 - Architecture Deep Dive',
              href: '/rfcs/architecture-deep-dive',
            },
            {
              type: 'link',
              label: '002 - Training Pipeline',
              href: '/rfcs/training-pipeline',
            },
            {
              type: 'link',
              label: '003 - Robotic Artifacts Analysis',
              href: '/rfcs/robotic-artifacts-analysis',
            },
          ],
        },
        {
          type: 'category',
          label: 'Model and Representation Strategy',
          items: [
            {
              type: 'link',
              label: '004 - Segmentation Strategy',
              href: '/rfcs/segmentation-strategy',
            },
            {
              type: 'link',
              label: '005 - Model Selection Analysis',
              href: '/rfcs/model-selection-analysis',
            },
            {
              type: 'link',
              label: '006 - AudioLM Integration',
              href: '/rfcs/audiolm-integration',
            },
            {
              type: 'link',
              label: '007 - Raw Acoustemes Storage',
              href: '/rfcs/raw-acoustemes-storage',
            },
            {
              type: 'link',
              label: '008 - Semantic Acoustic Mapping',
              href: '/rfcs/semantic-acoustic-mapping',
            },
            {
              type: 'link',
              label: '008 - Semantic Acoustic Linking',
              href: '/rfcs/semantic-acoustic-linking',
            },
          ],
        },
        {
          type: 'category',
          label: 'Translation Direction',
          items: [
            {
              type: 'link',
              label: '009 - Xeus vs MMS Analysis',
              href: '/rfcs/xeus-vs-mms-foundation-model-analysis',
            },
            {
              type: 'link',
              label: '010 - Parallel Acousteme Latent Translation',
              href: '/rfcs/parallel-acousteme-latent-translation',
            },
            {
              type: 'link',
              label: '011 - Oral-First Translation Reframe',
              href: '/rfcs/oral-first-acousteme-translation-reframe',
            },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: ['reference/glossary', 'reference/documentation-templates'],
    },
  ],
};

export default sidebars;

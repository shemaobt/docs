import type {CSSProperties, ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const darkLogo = useBaseUrl('/img/shema-logo-dark.svg');
  const lightLogo = useBaseUrl('/img/shema-logo-light.svg');
  const heroBackgroundImage = useBaseUrl('/background.pptx.jpg');
  const heroStyle = {
    '--hero-bg-image': `url(${heroBackgroundImage})`,
  } as CSSProperties;
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)} style={heroStyle}>
      <div className="container">
        <div className={styles.brandMarkWrap}>
          <img className={styles.brandMarkDark} src={darkLogo} alt="Shema" />
          <img className={styles.brandMarkLight} src={lightLogo} alt="Shema" />
        </div>
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--lg button--primary"
            to="/docs/intro">
            Open Docs
          </Link>
          <Link className="button button--lg button--outline" to="/rfcs/speech-to-speech">
            Open RFC Library
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description="System and RFC documentation hub">
      <HomepageHeader />
      <main>
        <section className={styles.section}>
          <div className="container">
            <Heading as="h2">Documentation Structure</Heading>
            <p className={styles.lead}>
              The site combines a full Docs for systems and architecture with a dedicated RFC library for technical decisions.
            </p>
            <div className={styles.grid}>
              <article className={styles.card}>
                <Heading as="h3">System Docs</Heading>
                <p>Detailed pages for active systems, integration points, runtime behavior, and roadmap context.</p>
                <Link to="/docs/systems/intro">Open systems section</Link>
              </article>
              <article className={styles.card}>
                <Heading as="h3">Architecture and Process</Heading>
                <p>Cross-system architecture, contribution workflow, governance, and shared reference pages.</p>
                <Link to="/docs/architecture/system-landscape">Open architecture section</Link>
              </article>
              <article className={styles.card}>
                <Heading as="h3">RFC Library</Heading>
                <p>Historical and active decision records rendered from the RFC repository under a dedicated route.</p>
                <Link to="/rfcs/speech-to-speech">Open RFCs</Link>
              </article>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

import type {ReactNode} from 'react';
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
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
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
            to="/docs/speech-to-speech">
            Browse RFCs
          </Link>
          <Link className="button button--lg button--outline" to="/docs/speech-to-speech">
            Open Latest Main
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description="RFC documentation hub">
      <HomepageHeader />
      <main>
        <section className={styles.section}>
          <div className="container">
            <Heading as="h2">Documentation Structure</Heading>
            <p className={styles.lead}>
              The site is generated from the markdown files in the <code>rfcs/</code> folder and supports MDX-ready authoring for richer future RFCs.
            </p>
            <div className={styles.grid}>
              <article className={styles.card}>
                <Heading as="h3">Foundational RFCs</Heading>
                <p>Architecture, segmentation, model selection, and storage decisions.</p>
                <Link to="/docs/speech-to-speech">Open RFC index</Link>
              </article>
              <article className={styles.card}>
                <Heading as="h3">Recent Strategy RFCs</Heading>
                <p>The site always renders from the current main branch in the RFC content repository.</p>
                <Link to="/docs/speech-to-speech">Open main branch docs</Link>
              </article>
              <article className={styles.card}>
                <Heading as="h3">Contribute</Heading>
                <p>Propose new RFCs in markdown and publish automatically through Cloud Run.</p>
                <Link href="https://github.com/shemaobt/rfcs">Open repository</Link>
              </article>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { docsApi } from '../services/api';
import { PLATFORMS } from '../data/platforms';
import Card from '../components/common/Card';
import Icon from '../components/common/Icon';
import LoadingAnimation from '../components/common/LoadingAnimation';
import styles from './Documentation.module.css';

export default function Documentation() {
  const { category, slug } = useParams();
  const [docContent, setDocContent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category && slug) {
      setLoading(true);
      docsApi.getDoc(category, slug)
        .then((data) => setDocContent(data))
        .catch((err) => setDocContent({
          title: 'Error',
          content: `Failed to load documentation: ${err.message}`,
        }))
        .finally(() => setLoading(false));
    }
  }, [category, slug]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Documentation</h1>
        <p className={styles.subtitle}>Reference guides for Meta CAPI implementations</p>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            <div className={styles.navSection}>
              <h3>Meta CAPI</h3>
              <ul>
                <DocLink to="/docs/meta-capi/overview" active={slug === 'overview'}>
                  Overview
                </DocLink>
                <DocLink to="/docs/meta-capi/requirements" active={slug === 'requirements'}>
                  Requirements
                </DocLink>
                <DocLink to="/docs/meta-capi/pixel-setup" active={slug === 'pixel-setup'}>
                  Pixel Setup
                </DocLink>
                <DocLink to="/docs/meta-capi/access-token" active={slug === 'access-token'}>
                  Access Token
                </DocLink>
                <DocLink to="/docs/meta-capi/event-parameters" active={slug === 'event-parameters'}>
                  Event Parameters
                </DocLink>
              </ul>
            </div>

            <div className={styles.navSection}>
              <h3>Data Warehouses</h3>
              <ul>
                {PLATFORMS.filter((p) => p.category === 'Data Warehouse').map((p) => (
                  <DocLink key={p.id} to={`/docs/platforms/${p.id}`}>
                    {p.name}
                  </DocLink>
                ))}
              </ul>
            </div>

            <div className={styles.navSection}>
              <h3>CRMs & CDPs</h3>
              <ul>
                {PLATFORMS.filter((p) => ['CRM', 'CDP'].includes(p.category)).map((p) => (
                  <DocLink key={p.id} to={`/docs/platforms/${p.id}`}>
                    {p.name}
                  </DocLink>
                ))}
              </ul>
            </div>

            <div className={styles.navSection}>
              <h3>Analytics</h3>
              <ul>
                {PLATFORMS.filter((p) => p.category === 'Analytics').map((p) => (
                  <DocLink key={p.id} to={`/docs/platforms/${p.id}`}>
                    {p.name}
                  </DocLink>
                ))}
              </ul>
            </div>

            <div className={styles.navSection}>
              <h3>External Links</h3>
              <ul>
                <li>
                  <a
                    href="https://developers.facebook.com/docs/marketing-api/conversions-api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.externalLink}
                  >
                    Official Meta Docs ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.facebook.com/business/help/2041148702652965"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.externalLink}
                  >
                    Business Help Center ↗
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        <main className={styles.main}>
          {!category || !slug ? (
            <WelcomeContent />
          ) : loading ? (
            <LoadingAnimation />
          ) : docContent ? (
            <Card className={styles.docCard}>
              <div className={styles.docContent}>
                <ReactMarkdown>{docContent.content}</ReactMarkdown>
              </div>
              {docContent.placeholder && (
                <div className={styles.placeholder}>
                  This documentation is a placeholder. Content will be added soon.
                </div>
              )}
            </Card>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function DocLink({ to, active, children }) {
  return (
    <li>
      <Link to={to} className={`${styles.docLink} ${active ? styles.active : ''}`}>
        {children}
      </Link>
    </li>
  );
}

DocLink.propTypes = {
  to: PropTypes.string.isRequired,
  active: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

function WelcomeContent() {
  return (
    <div className={styles.welcome}>
      <Card>
        <h2>Welcome to Documentation</h2>
        <p>
          Select a topic from the sidebar to view documentation for Meta CAPI
          and supported platform integrations.
        </p>

        <div className={styles.quickLinks}>
          <h3>Quick Links</h3>
          <div className={styles.quickLinkGrid}>
            <a
              href="https://developers.facebook.com/docs/marketing-api/conversions-api/get-started"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.quickLink}
            >
              <Icon name="rocket" size={24} className={styles.quickLinkIcon} />
              <span>Getting Started</span>
            </a>
            <a
              href="https://developers.facebook.com/docs/marketing-api/conversions-api/parameters"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.quickLink}
            >
              <Icon name="clipboard" size={24} className={styles.quickLinkIcon} />
              <span>API Parameters</span>
            </a>
            <a
              href="https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.quickLink}
            >
              <Icon name="check" size={24} className={styles.quickLinkIcon} />
              <span>Best Practices</span>
            </a>
            <a
              href="https://developers.facebook.com/docs/marketing-api/conversions-api/support"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.quickLink}
            >
              <Icon name="wrench" size={24} className={styles.quickLinkIcon} />
              <span>Troubleshooting</span>
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}

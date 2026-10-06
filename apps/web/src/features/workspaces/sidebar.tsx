import { Copy, File, FileText, House } from 'lucide-react';

import { ThemeSelect } from './theme-select';
import styles from './workspace-shell.module.css';

const SAMPLE_DOCUMENTS = ['Project Aurora', 'Research Notes', 'Untitled'];

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside
      id="workspace-sidebar"
      className={styles.sidebar}
      aria-label="Workspace sidebar"
      hidden={collapsed}
    >
      <div className={styles.workspaceIdentity}>
        <div className={styles.brand}>
          <Copy aria-hidden="true" className={styles.brandIcon} />
          <span>Relay</span>
        </div>
        <p className={styles.workspaceLabel}>Personal workspace</p>
      </div>
      <nav className={styles.navigation} aria-label="Workspace navigation">
        <button
          type="button"
          className={styles.navigationItem}
          disabled
          title="Home is not available yet"
        >
          <House aria-hidden="true" />
          <span>Home</span>
        </button>
        <a
          className={styles.navigationItem}
          href="#document"
          aria-current="page"
        >
          <FileText aria-hidden="true" />
          <span>Documents</span>
        </a>
      </nav>
      <section
        className={styles.recentDocuments}
        aria-labelledby="recent-title"
      >
        <div className={styles.sectionHeading}>
          <h2 id="recent-title">Recent</h2>
          <span>Samples</span>
        </div>
        <ul className={styles.documentList}>
          {SAMPLE_DOCUMENTS.map((title) => (
            <li key={title}>
              <button
                type="button"
                className={styles.sampleDocument}
                disabled
                title="Sample document. Document switching is not available yet."
              >
                <File aria-hidden="true" />
                <span>{title}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <div className={styles.sidebarFooter}>
        <ThemeSelect />
      </div>
    </aside>
  );
}

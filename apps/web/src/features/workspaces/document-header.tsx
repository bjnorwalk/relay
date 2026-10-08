import { PanelLeftClose, PanelLeftOpen, Upload } from 'lucide-react';

import { DocumentTitle } from '../documents/document-provider';

import styles from './workspace-shell.module.css';

type DocumentHeaderProps = {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export function DocumentHeader({
  sidebarCollapsed,
  onToggleSidebar,
}: DocumentHeaderProps) {
  const SidebarIcon = sidebarCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <header className={styles.documentHeader}>
      <button
        type="button"
        className={styles.iconButton}
        aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
        aria-controls="workspace-sidebar"
        aria-expanded={!sidebarCollapsed}
        onClick={onToggleSidebar}
      >
        <SidebarIcon aria-hidden="true" />
      </button>
      <div className={styles.headerDivider} aria-hidden="true" />
      <div className={styles.breadcrumb} aria-label="Current document">
        <span className={styles.breadcrumbParent}>Documents</span>
        <span className={styles.breadcrumbSeparator} aria-hidden="true">
          /
        </span>
        <span className={styles.breadcrumbTitle}>
          <DocumentTitle />
        </span>
      </div>
      <div className={styles.headerActions}>
        <button
          type="button"
          className={styles.shareButton}
          disabled
          title="Sharing is not available yet"
          aria-label="Share (not available yet)"
        >
          <Upload aria-hidden="true" />
          <span>Share</span>
        </button>
        <span
          className={styles.avatar}
          role="img"
          aria-label="User placeholder"
          title="User placeholder"
        >
          U
        </span>
      </div>
    </header>
  );
}

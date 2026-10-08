'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

import { DocumentHeader } from './document-header';
import { Sidebar } from './sidebar';
import { StatusBar } from './status-bar';
import styles from './workspace-shell.module.css';

type WorkspaceShellProps = {
  children: ReactNode;
};

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={styles.shell} data-sidebar-collapsed={sidebarCollapsed}>
      <a className={styles.skipLink} href="#document">
        Skip to document
      </a>
      <Sidebar collapsed={sidebarCollapsed} />
      <DocumentHeader
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((collapsed) => !collapsed)}
      />
      <main
        id="document"
        className={styles.documentArea}
        aria-labelledby="document-title"
        tabIndex={-1}
      >
        {children}
      </main>
      <StatusBar />
    </div>
  );
}

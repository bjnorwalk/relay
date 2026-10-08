import { DocumentCanvas } from '@/features/documents/document-canvas';
import { DocumentProvider } from '@/features/documents/document-provider';
import { WorkspaceShell } from '@/features/workspaces/workspace-shell';

export default function HomePage() {
  return (
    <DocumentProvider>
      <WorkspaceShell>
        <DocumentCanvas />
      </WorkspaceShell>
    </DocumentProvider>
  );
}

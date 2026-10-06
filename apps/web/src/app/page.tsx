import { DocumentCanvas } from '@/features/documents/document-canvas';
import { WorkspaceShell } from '@/features/workspaces/workspace-shell';

const DOCUMENT_TITLE = 'Untitled document';

export default function HomePage() {
  return (
    <WorkspaceShell title={DOCUMENT_TITLE}>
      <DocumentCanvas title={DOCUMENT_TITLE} />
    </WorkspaceShell>
  );
}

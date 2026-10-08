'use client';

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { LocalAutosave, SaveState } from './local-autosave';
import { DEFAULT_DOCUMENT_TITLE } from './local-document';

const StateContext = createContext<{ title: string; save: SaveState }>({
  title: DEFAULT_DOCUMENT_TITLE,
  save: { kind: 'loading' },
});
const ActionsContext = createContext<{
  setTitle: (title: string) => void;
  setSave: (state: SaveState) => void;
  register: (autosave: LocalAutosave | null) => void;
  getAutosave: () => LocalAutosave | null;
} | null>(null);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState(DEFAULT_DOCUMENT_TITLE);
  const [save, setSave] = useState<SaveState>({ kind: 'loading' });
  const autosave = useRef<LocalAutosave | null>(null);
  const actions = useMemo(
    () => ({
      setTitle,
      setSave,
      register: (value: LocalAutosave | null) => {
        autosave.current = value;
      },
      getAutosave: () => autosave.current,
    }),
    [],
  );
  return (
    <ActionsContext value={actions}>
      <StateContext value={{ title, save }}>{children}</StateContext>
    </ActionsContext>
  );
}

export function useDocumentActions() {
  const actions = useContext(ActionsContext);
  if (!actions) throw new Error('DocumentProvider is required');
  return actions;
}
export function useDocumentState() {
  return useContext(StateContext);
}
export function DocumentTitle() {
  return useDocumentState().title;
}

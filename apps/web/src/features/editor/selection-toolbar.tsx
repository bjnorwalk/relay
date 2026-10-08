'use client';

import type { Editor } from '@tiptap/core';
import type { Selection } from '@tiptap/pm/state';
import { useEditorState } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Bold, Code, Italic, Link, Strikethrough } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getFormattingState, runFormatting } from './formatting';
import { LinkEditor } from './link-editor';
import { shouldShowSelectionToolbar } from './selection-toolbar-policy';
import controlStyles from './formatting-toolbar.module.css';
import styles from './selection-toolbar.module.css';

const PLUGIN_KEY = 'slateSelectionToolbar';
const controls = [
  { action: 'bold', label: 'Bold', icon: Bold },
  { action: 'italic', label: 'Italic', icon: Italic },
  { action: 'strike', label: 'Strikethrough', icon: Strikethrough },
  { action: 'code', label: 'Inline code', icon: Code },
] as const;

export function SelectionToolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => getFormattingState(current),
  });
  const [linkOpen, setLinkOpen] = useState(false);
  const linkId = useId();
  const dismissedSelection = useRef<Selection | null>(null);
  const menu = useRef<HTMLDivElement>(null);
  const closeLink = useCallback(() => setLinkOpen(false), []);

  useEffect(() => {
    function selectionChanged() {
      closeLink();
      if (!dismissedSelection.current?.eq(editor.state.selection))
        dismissedSelection.current = null;
    }
    editor.on('selectionUpdate', selectionChanged);
    return () => {
      editor.off('selectionUpdate', selectionChanged);
    };
  }, [editor, closeLink]);

  useEffect(() => {
    function dismissFromEditor(event: KeyboardEvent) {
      if (event.key !== 'Escape' || !menu.current?.isConnected) return;
      event.preventDefault();
      dismissedSelection.current = editor.state.selection;
      editor.view.dispatch(editor.state.tr.setMeta(PLUGIN_KEY, 'hide'));
    }
    const element = editor.view.dom;
    element.addEventListener('keydown', dismissFromEditor);
    return () => element.removeEventListener('keydown', dismissFromEditor);
  }, [editor]);

  useEffect(() => {
    // Recompute the supported floating position when the link form changes size.
    editor.view.dispatch(editor.state.tr.setMeta(PLUGIN_KEY, 'updatePosition'));
  }, [editor, linkOpen]);

  const shouldShow = useCallback(
    (props: Parameters<typeof shouldShowSelectionToolbar>[0]) => {
      if (dismissedSelection.current?.eq(props.editor.state.selection))
        return false;
      dismissedSelection.current = null;
      return shouldShowSelectionToolbar(props);
    },
    [],
  );

  const options = useMemo(() => {
    // The document scrolls inside its landmark, independently of the window.
    const scroller = document.getElementById('document');
    const boundary = scroller ?? ('clippingAncestors' as const);
    return {
      strategy: 'fixed' as const,
      placement: 'top' as const,
      offset: 8,
      flip: { boundary, padding: 8 },
      shift: { boundary, padding: 8 },
      hide: { boundary },
      scrollTarget: scroller ?? window,
      onHide: closeLink,
    };
  }, [closeLink]);

  function hideMenu() {
    editor.view.dispatch(editor.state.tr.setMeta(PLUGIN_KEY, 'hide'));
  }

  return (
    <BubbleMenu
      ref={menu}
      editor={editor}
      pluginKey={PLUGIN_KEY}
      className={styles.menu}
      updateDelay={80}
      resizeDelay={30}
      options={options}
      shouldShow={shouldShow}
      onBlur={(event) => {
        const next = event.nativeEvent.relatedTarget;
        if (
          !(next instanceof Node && menu.current?.contains(next)) &&
          next !== editor.view.dom
        )
          hideMenu();
      }}
      onKeyDown={(event) => {
        if (event.nativeEvent.key !== 'Escape') return;
        event.preventDefault();
        if (!linkOpen) dismissedSelection.current = editor.state.selection;
        // Return focus before removing the currently focused menu from the DOM.
        editor.view.focus();
        if (linkOpen) closeLink();
        else hideMenu();
      }}
    >
      <div role="group" aria-label="Text formatting">
        <div className={styles.row}>
          {controls.map(({ action, label, icon: Icon }) => (
            <button
              key={action}
              type="button"
              className={controlStyles.button}
              aria-label={label}
              title={label}
              aria-pressed={state[action].active}
              disabled={!state[action].enabled}
              onClick={() => runFormatting(editor, action)}
            >
              <Icon aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            className={controlStyles.button}
            aria-label="Link"
            title={state.link.active ? 'Edit link' : 'Add link'}
            aria-pressed={state.link.active}
            aria-expanded={linkOpen}
            aria-controls={linkOpen ? linkId : undefined}
            disabled={!state.link.enabled}
            onClick={() => setLinkOpen((open) => !open)}
          >
            <Link aria-hidden="true" />
          </button>
        </div>
        {linkOpen && (
          <LinkEditor editor={editor} id={linkId} onClose={closeLink} />
        )}
      </div>
    </BubbleMenu>
  );
}

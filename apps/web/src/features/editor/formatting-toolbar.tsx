'use client';

import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import {
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  SquareCode,
  Undo2,
} from 'lucide-react';

import {
  getFormattingState,
  runFormatting,
  setTextStyle,
  type TextStyle,
} from './formatting';
import styles from './formatting-toolbar.module.css';

const groups = [
  [
    { action: 'undo', label: 'Undo', icon: Undo2 },
    { action: 'redo', label: 'Redo', icon: Redo2 },
  ],
  [
    { action: 'bulletList', label: 'Bullet list', icon: List },
    { action: 'orderedList', label: 'Ordered list', icon: ListOrdered },
    { action: 'blockquote', label: 'Blockquote', icon: Quote },
    { action: 'codeBlock', label: 'Code block', icon: SquareCode },
    { action: 'horizontalRule', label: 'Horizontal rule', icon: Minus },
  ],
] as const;

const textStyles = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
] as const;

export function FormattingToolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => getFormattingState(current),
  });

  return (
    <div
      className={styles.controls}
      role="group"
      aria-label="Document formatting"
    >
      <select
        className={styles.textStyle}
        aria-label="Text style"
        value={state.textStyle}
        disabled={!editor.isEditable}
        onChange={(event) =>
          setTextStyle(editor, event.target.value as TextStyle)
        }
      >
        {state.textStyle === 'other' && (
          <option value="other" disabled>
            {state.codeBlock.active ? 'Code block' : 'Mixed blocks'}
          </option>
        )}
        {textStyles.map(({ value, label }) => (
          <option key={value} value={value} disabled={!state.styles[value]}>
            {label}
          </option>
        ))}
      </select>
      {groups.map((group) => (
        <div className={styles.group} key={group[0].action}>
          {group.map(({ action, label, icon: Icon }) => {
            const toggle = !['undo', 'redo', 'horizontalRule'].includes(action);
            return (
              <button
                key={action}
                type="button"
                className={styles.button}
                aria-label={label}
                title={label}
                aria-pressed={toggle ? state[action].active : undefined}
                disabled={!state[action].enabled}
                onMouseDown={(event) => {
                  // Keep the text selection while a pointer activates a control.
                  event.preventDefault();
                }}
                onClick={() => runFormatting(editor, action)}
              >
                <Icon aria-hidden="true" />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

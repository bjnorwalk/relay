import type { FormattingAction } from './formatting';

const shortcuts: Partial<Record<FormattingAction, string[]>> = {
  bold: ['B'],
  italic: ['I'],
  strike: ['Shift', 'S'],
  code: ['E'],
  undo: ['Z'],
  redo: ['Shift', 'Z'],
  bulletList: ['Shift', '8'],
  orderedList: ['Shift', '7'],
  blockquote: ['Shift', 'B'],
  codeBlock: ['Alt', 'C'],
};

export function formattingShortcut(action: FormattingAction, platform: string) {
  const keys = shortcuts[action];
  if (!keys || !platform) return undefined;
  const apple = /Mac|iPhone|iPad|iPod/.test(platform);
  return {
    label: [apple ? '⌘' : 'Ctrl', ...keys].join('+'),
    aria: [apple ? 'Meta' : 'Control', ...keys].join('+'),
  };
}

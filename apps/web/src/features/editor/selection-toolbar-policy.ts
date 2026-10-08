import { isTextSelection, type Editor } from '@tiptap/core';
import { AllSelection } from '@tiptap/pm/state';

export function hasInlineSelection(editor: Editor) {
  const { doc, selection } = editor.state;
  if (
    !editor.isEditable ||
    (!isTextSelection(selection) && !(selection instanceof AllSelection)) ||
    selection.empty ||
    !doc.textBetween(selection.from, selection.to, ' ').trim()
  ) {
    return false;
  }

  let includesCodeBlock = false;
  doc.nodesBetween(selection.from, selection.to, (node) => {
    if (node.type.name === 'codeBlock') includesCodeBlock = true;
  });
  return !includesCodeBlock;
}

export function shouldShowSelectionToolbar({
  editor,
  element,
}: {
  editor: Editor;
  element: HTMLElement;
}) {
  return (
    hasInlineSelection(editor) &&
    (editor.isFocused || element.contains(document.activeElement))
  );
}

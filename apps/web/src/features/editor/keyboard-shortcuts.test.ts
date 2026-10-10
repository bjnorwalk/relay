import { describe, expect, it } from 'vitest';
import { formattingShortcut } from './keyboard-shortcuts';

describe('formatting shortcut hints', () => {
  it('uses the Apple modifier for Mac and iPad keyboards', () => {
    for (const platform of ['MacIntel', 'iPad']) {
      expect(formattingShortcut('bold', platform)).toEqual({
        label: '⌘+B',
        aria: 'Meta+B',
      });
      expect(formattingShortcut('redo', platform)?.aria).toBe('Meta+Shift+Z');
    }
  });
  it('uses Control for Windows and Linux', () => {
    for (const platform of ['Win32', 'Linux x86_64']) {
      expect(formattingShortcut('italic', platform)).toEqual({
        label: 'Ctrl+I',
        aria: 'Control+I',
      });
      expect(formattingShortcut('codeBlock', platform)?.aria).toBe(
        'Control+Alt+C',
      );
    }
  });
  it('does not advertise unbound commands or guess before hydration', () => {
    expect(formattingShortcut('horizontalRule', 'MacIntel')).toBeUndefined();
    expect(formattingShortcut('unlink', 'Win32')).toBeUndefined();
    expect(formattingShortcut('undo', '')).toBeUndefined();
  });
});

import { act, createElement, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DocumentEditor } from '../editor/editor';
import { DocumentProvider, DocumentTitle } from './document-provider';
import { DOCUMENT_STORAGE_KEY } from './local-document';
import { SaveRecovery, SaveStatus } from './save-status';

describe('document recovery interface', () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    localStorage.clear();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  async function mount() {
    await act(async () => {
      root.render(
        createElement(
          StrictMode,
          null,
          createElement(
            DocumentProvider,
            null,
            createElement('h1', null, createElement(DocumentTitle)),
            createElement(SaveStatus),
            createElement(SaveRecovery),
            createElement(DocumentEditor),
          ),
        ),
      );
    });
  }

  it('restores the editor and title after mounting under StrictMode', async () => {
    localStorage.setItem(
      DOCUMENT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        title: 'Saved notes',
        updatedAt: '2026-10-07T12:00:00.000Z',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Restored body' }],
            },
          ],
        },
      }),
    );
    await mount();
    expect(container.querySelector('h1')?.textContent).toBe('Saved notes');
    expect(container.querySelector('[role="textbox"]')?.textContent).toBe(
      'Restored body',
    );
    expect(container.querySelector('[role="status"]')?.textContent).toBe(
      'Saved locally',
    );
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it('shows recovery actions while preserving malformed saved data', async () => {
    localStorage.setItem(DOCUMENT_STORAGE_KEY, '{unreadable');
    await mount();
    expect(
      container
        .querySelector('[role="textbox"]')
        ?.getAttribute('contenteditable'),
    ).toBe('true');
    expect(container.querySelector('[role="status"]')?.textContent).toBe(
      'Couldn’t save',
    );
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      'left untouched',
    );
    const buttons = Array.from(container.querySelectorAll('button')).map(
      (button) => button.textContent,
    );
    expect(buttons).toContain('Download draft');
    expect(buttons).toContain('Download saved data');
    expect(localStorage.getItem(DOCUMENT_STORAGE_KEY)).toBe('{unreadable');
  });

  it('downloads the original saved bytes without altering storage', async () => {
    const original = '{unreadable';
    localStorage.setItem(DOCUMENT_STORAGE_KEY, original);
    await mount();
    const create = vi.fn(() => 'blob:recovery');
    vi.stubGlobal(
      'URL',
      class extends URL {
        static createObjectURL = create;
        static revokeObjectURL = vi.fn();
      },
    );
    const clicked = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    const button = Array.from(container.querySelectorAll('button')).find(
      (control) => control.textContent === 'Download saved data',
    );
    await act(async () => button?.click());
    expect(create).toHaveBeenCalledWith(expect.any(Blob));
    expect(clicked).toHaveBeenCalledOnce();
    expect(localStorage.getItem(DOCUMENT_STORAGE_KEY)).toBe(original);
  });
});

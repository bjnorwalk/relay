import type { JSONContent } from '@tiptap/core';
import type { Schema } from '@tiptap/pm/model';

export const DOCUMENT_STORAGE_KEY = 'slate.document.v1';
export const DEFAULT_DOCUMENT_TITLE = 'Untitled document';

export type LocalDocument = {
  version: 1;
  title: string;
  updatedAt: string;
  content: JSONContent;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function checkContentShape(value: unknown, schema: Schema, depth = 0): void {
  if (!isRecord(value) || typeof value.type !== 'string' || depth > 100) {
    throw new Error('Invalid document structure');
  }
  const type = schema.nodes[value.type];
  if (
    !type ||
    Object.keys(value).some(
      (key) => !['type', 'attrs', 'content', 'text', 'marks'].includes(key),
    )
  ) {
    throw new Error('Unsupported document node');
  }
  if (
    value.attrs !== undefined &&
    (!isRecord(value.attrs) ||
      Object.keys(value.attrs).some(
        (key) => !Object.hasOwn(type.spec.attrs ?? {}, key),
      ))
  ) {
    throw new Error('Unsupported node attributes');
  }
  if (value.marks !== undefined) {
    if (!Array.isArray(value.marks)) throw new Error('Invalid marks');
    for (const mark of value.marks) {
      if (!isRecord(mark) || typeof mark.type !== 'string')
        throw new Error('Invalid mark');
      const markType = schema.marks[mark.type];
      if (
        !markType ||
        Object.keys(mark).some((key) => !['type', 'attrs'].includes(key)) ||
        (mark.attrs !== undefined &&
          (!isRecord(mark.attrs) ||
            Object.keys(mark.attrs).some(
              (key) => !Object.hasOwn(markType.spec.attrs ?? {}, key),
            )))
      ) {
        throw new Error('Unsupported mark attributes');
      }
    }
  }
  if (value.content !== undefined) {
    if (!Array.isArray(value.content) || value.type === 'text')
      throw new Error('Invalid child content');
    for (const child of value.content)
      checkContentShape(child, schema, depth + 1);
  }
}

export function readLocalDocument(raw: string, schema: Schema): LocalDocument {
  const value: unknown = JSON.parse(raw);
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    typeof value.title !== 'string' ||
    !value.title.trim() ||
    value.title.length > 1000 ||
    typeof value.updatedAt !== 'string' ||
    !Number.isFinite(Date.parse(value.updatedAt)) ||
    !isRecord(value.content) ||
    value.content.type !== 'doc'
  ) {
    throw new Error('Unsupported local document record');
  }

  checkContentShape(value.content, schema);
  const doc = schema.nodeFromJSON(value.content);
  doc.check();
  doc.descendants((node) => {
    if (node.type.name === 'heading' && ![1, 2, 3].includes(node.attrs.level)) {
      throw new Error('Unsupported heading level');
    }
    for (const mark of node.marks) {
      if (mark.type.name !== 'link') continue;
      const href: unknown = mark.attrs.href;
      if (
        typeof href !== 'string' ||
        !['http:', 'https:', 'mailto:'].includes(new URL(href).protocol)
      ) {
        throw new Error('Unsupported link address');
      }
    }
  });

  return {
    version: 1,
    title: value.title,
    updatedAt: value.updatedAt,
    content: doc.toJSON(),
  };
}

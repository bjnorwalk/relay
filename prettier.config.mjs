/** @type {import('prettier').Config} */
const config = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  overrides: [{ files: '*.svg', options: { parser: 'html' } }],
};

export default config;

import { ChevronDown, Sun } from 'lucide-react';
import { useState } from 'react';

import styles from './workspace-shell.module.css';

type Theme = 'system' | 'light' | 'dark';

export function ThemeSelect() {
  const [theme, setTheme] = useState<Theme>('system');

  function changeTheme(value: string) {
    if (value !== 'system' && value !== 'light' && value !== 'dark') return;

    document.documentElement.dataset.theme = value;
    setTheme(value);
  }

  return (
    <label className={styles.themeControl}>
      <Sun aria-hidden="true" />
      <span className={styles.themeLabel}>Appearance</span>
      <select
        aria-label="Appearance"
        value={theme}
        onChange={(event) => changeTheme(event.target.value)}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <ChevronDown aria-hidden="true" className={styles.selectChevron} />
    </label>
  );
}

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getPlatform = () => navigator.platform;
const getServerPlatform = () => '';

export function useKeyboardPlatform() {
  return useSyncExternalStore(subscribe, getPlatform, getServerPlatform);
}

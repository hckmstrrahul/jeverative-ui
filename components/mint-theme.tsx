'use client';
import { createContext, useContext } from 'react';
export const MintThemeContext = createContext<'light' | 'dark'>('light');
export function useMintTheme() {
  return 'mint-theme ' + useContext(MintThemeContext);
}

'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
const MintDataContext = createContext({
  query: '',
  filter: 'all',
  tab: '',
  setQuery: (_value: string) => {},
  setFilter: (_value: string) => {},
  setTab: (_value: string) => {},
});
export function MintDataProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [tab, setTab] = useState('');
  return (
    <MintDataContext
      value={{ query, filter, tab, setQuery, setFilter, setTab }}
    >
      {children}
    </MintDataContext>
  );
}
export const useMintData = () => useContext(MintDataContext);

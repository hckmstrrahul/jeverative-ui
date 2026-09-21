'use client';
import { useState } from 'react';
import { TreeRenderer } from '@/components/tree-renderer';
import { Button } from '@/components/ui/button';
import { desktopQaFixtures } from '@/lib/tree/qa-fixtures';

export default function DesktopQa() {
  const [selected, setSelected] = useState(0);
  const [dark, setDark] = useState(false);
  return (
    <main className="p-6">
      <h1 className="text-xl font-medium">Desktop UI regression gallery</h1>
      <p className="my-2 text-sm text-muted-foreground">
        Local fixtures derived from live QA. No API calls.
      </p>
      <nav className="my-4 flex flex-wrap gap-2" aria-label="QA fixtures">
        {desktopQaFixtures.map((doc, i) => (
          <Button
            key={doc.title}
            variant={selected === i ? 'default' : 'outline'}
            onClick={() => setSelected(i)}
          >
            {doc.title}
          </Button>
        ))}
        <Button variant="outline" onClick={() => setDark(!dark)}>
          {dark ? 'Light theme' : 'Dark theme'}
        </Button>
      </nav>
      <div
        style={{
          width: 1440,
          maxWidth: '100%',
          height: 900,
          overflow: 'auto',
          border: '1px solid var(--border)',
        }}
      >
        <TreeRenderer
          key={selected}
          document={{
            ...desktopQaFixtures[selected],
            theme: dark ? 'dark' : 'light',
          }}
        />
      </div>
    </main>
  );
}

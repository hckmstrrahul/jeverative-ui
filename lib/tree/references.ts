import evidence from '../reference-evidence.json';
/** Curated observations, not copied brand styling or model training data. */
export function compositionReferences(prompt: string) {
  const names = /profile|wallet/i.test(prompt)
    ? ['Givingli', 'Phantom', 'Airwallex']
    : /settings|preference|security/i.test(prompt)
      ? ['Dovetail', 'Airwallex', 'Juicebox']
      : /dashboard|analytics|report|sales/i.test(prompt)
        ? ['Mixpanel', 'Obvious', 'Dovetail']
        : ['Airwallex', 'Mixpanel', 'Phantom'];
  return evidence
    .filter((item) => names.includes(item.app))
    .map((item) => ({ source: item.url, pattern: item.observed }));
}

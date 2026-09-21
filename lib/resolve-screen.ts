import { getBlueprint } from './ui-grammar';
import type { Screen } from './catalog';
import { componentRules } from './component-rules';
import { recipes } from './mint';
import { allowedComponents } from './screen-patterns';
/** Reconcile independent Jev decisions. Manual library selections remain unrestricted. */
export function resolveScreen(
  input: Screen,
  prompt: string,
): { screen: Screen; adjustments: string[] } {
  const screen = { ...input, components: [...input.components] };
  const adjustments: string[] = [];
  const showroom =
    /all (?:the )?components|entire (?:library|catalog)|component (?:showcase|showroom)/i.test(
      prompt,
    );
  const remove = (id: string, reason: string) => {
    if (screen.components.includes(id)) {
      screen.components = screen.components.filter((c) => c !== id);
      adjustments.push(reason);
    }
  };
  if (!showroom) {
    const blueprint = getBlueprint(screen);
    // Old saved screens remain valid; new generations carry an explicit blueprint.
    if (screen.blueprint) {
      screen.blueprint = blueprint.id;
      screen.layout = blueprint.layout;
      if (!/\b(?:blank|empty|only|remove|without|no)\b/i.test(prompt)) {
        for (const id of blueprint.required) {
          const equivalent =
            ['table', 'data-table'].includes(id) &&
            screen.components.some((c) => ['table', 'data-table'].includes(c));
          if (!equivalent && !screen.components.includes(id))
            screen.components.push(id);
        }
      }
      if (screen.recipe === 'settings' || screen.recipe === 'profile') {
        for (const id of screen.components) {
          if (
            !blueprint.required.includes(id) &&
            !new RegExp(`\\b${id.replaceAll('-', '[ -]')}\\b`, 'i').test(prompt)
          )
            remove(
              id,
              'The account blueprint owns its labelled controls and actions.',
            );
        }
        screen.primaryAction = 'none';
        screen.search = false;
      }
    }

    const allowed = allowedComponents(screen, prompt);
    for (const id of screen.components)
      if (!allowed.has(id))
        remove(
          id,
          `Removed ${id}: unrelated to the ${screen.recipe} working area.`,
        );
    const anchor = recipes[screen.recipe].primary;
    const equivalent = ['table', 'data-table'].includes(anchor)
      ? screen.components.some((id) => ['table', 'data-table'].includes(id))
      : screen.components.includes(anchor);
    if (
      !equivalent &&
      !/\b(?:blank|empty|only|remove|without|no)\b/i.test(prompt)
    ) {
      screen.components.push(anchor);
      adjustments.push(
        `Restored the ${screen.recipe} working area (${anchor}).`,
      );
    }

    if (screen.components.includes('data-table'))
      remove(
        'table',
        'Combined duplicate table selections into one data table.',
      );
    if (screen.components.includes('field')) {
      if (!/\bextra\b|\badditional\b|\bseparate\b/i.test(prompt)) {
        remove(
          'input',
          'Used the complete field group instead of a duplicate input.',
        );
        remove('label', 'Kept labels within their fields.');
      }
    }
    if (screen.components.includes('message-scroller')) {
      remove(
        'message',
        'Used the conversation history instead of duplicate messages.',
      );
      remove('bubble', 'Kept chat bubbles inside the conversation history.');
    }
    const stateRequested =
      /loading|skeleton|spinner|empty|no data|no results/i.test(prompt);
    if (!stateRequested)
      for (const id of ['skeleton', 'spinner', 'empty'])
        remove(id, 'Removed an unrequested ' + id + ' state.');
    if (
      !screen.components.some((id) =>
        ['content', 'summary', 'field', 'conversation'].includes(
          componentRules[id].role,
        ),
      ) &&
      !/blank|empty|remove all|only.*(?:button|nav|toolbar)/i.test(prompt)
    ) {
      const r = recipes[screen.recipe];
      screen.components = [...new Set([...r.components, ...screen.components])];
      adjustments.push(
        'Added the recipe’s working area so controls have content to act on.',
      );
    }
  }
  if (
    screen.search &&
    !screen.components.includes('input-group') &&
    !['order', 'form', 'settings'].includes(screen.recipe)
  ) {
    screen.components.unshift('input-group');
    adjustments.push('Added the requested search control.');
  }
  if (screen.device === 'mobile' && screen.layout !== 'stack') {
    screen.layout = 'stack';
    adjustments.push('Stacked the working areas for the phone viewport.');
  }
  if (['order', 'form', 'settings', 'conversation'].includes(screen.recipe)) {
    screen.layout = 'stack';
    if (
      ['order', 'form'].includes(screen.recipe) &&
      screen.navigation !== 'none'
    ) {
      screen.navigation = 'none';
      adjustments.push('Kept the focused flow free of persistent navigation.');
    }
  }
  if (screen.device === 'mobile' && screen.navigation === 'rail') {
    screen.navigation = 'bottom';
    adjustments.push('Adapted the application rail to mobile navigation.');
  } else if (screen.device !== 'mobile' && screen.navigation === 'bottom') {
    screen.navigation = 'rail';
    adjustments.push('Adapted bottom navigation to a wider application rail.');
  }
  if (!screen.components.includes(screen.emphasis))
    screen.emphasis = screen.components.includes(recipes[screen.recipe].primary)
      ? recipes[screen.recipe].primary
      : (screen.components.find((c) =>
          ['content', 'field', 'conversation'].includes(componentRules[c].role),
        ) ??
        screen.components[0] ??
        screen.emphasis);
  if (screen.recipe === 'order' && screen.components.includes('field')) {
    remove('button', 'The order form owns its validated submit action.');
    screen.primaryAction = screen.primaryAction === 'sell' ? 'sell' : 'buy';
  }
  return { screen, adjustments: [...new Set(adjustments)] };
}

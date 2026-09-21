/** Prepared workflow contracts. Amounts, recipients and outcomes are local demo data. */
export const workflowKinds = [
  'trade',
  'fund',
  'deposit',
  'transfer',
  'card',
  'loan',
  'insurance',
  'invoice',
  'verification',
  'expense',
] as const;
export type WorkflowKind = (typeof workflowKinds)[number];
export const flowStates = [
  'details',
  'input',
  'review',
  'loading',
  'empty',
  'failed',
  'pending',
  'success',
] as const;
export type FlowStage = (typeof flowStates)[number];
export type Field = {
  key: string;
  label: string;
  type: 'text' | 'money' | 'quantity' | 'email' | 'choice';
  initial: string;
  options?: readonly string[];
};
type Workflow = {
  title: string;
  description: string;
  action: string;
  fields: Field[];
  fee: number;
  balance?: number;
  match: RegExp;
  domains: readonly string[];
};
const amount: Field = {
  key: 'amount',
  label: 'Amount',
  type: 'money',
  initial: '1000.00',
};
export const workflows: Record<WorkflowKind, Workflow> = {
  trade: {
    title: 'Trade order',
    description: 'Set the side, quantity and price before reviewing the order.',
    action: 'Place demo order',
    fee: 20,
    balance: 100000,
    match:
      /\b(stock|stocks|equity|trade|trading|crypto|bitcoin|ethereum|order ticket)\b/i,
    domains: ['stock', 'crypto'],
    fields: [
      {
        key: 'side',
        label: 'Side',
        type: 'choice',
        initial: 'Buy',
        options: ['Buy', 'Sell'],
      },
      { key: 'instrument', label: 'Instrument', type: 'text', initial: 'NOVA' },
      { key: 'quantity', label: 'Quantity', type: 'quantity', initial: '1' },
      {
        key: 'price',
        label: 'Price per unit',
        type: 'money',
        initial: '1538.00',
      },
    ],
  },
  fund: {
    title: 'Fund investment',
    description: 'Choose a one-time investment or recurring SIP.',
    action: 'Confirm demo investment',
    fee: 0,
    balance: 100000,
    match: /\b(mutual fund|sip|fund investment)\b/i,
    domains: ['fund'],
    fields: [
      {
        key: 'fund',
        label: 'Fund',
        type: 'text',
        initial: 'Sample index fund',
      },
      amount,
      {
        key: 'frequency',
        label: 'Frequency',
        type: 'choice',
        initial: 'Monthly SIP',
        options: ['One-time', 'Monthly SIP'],
      },
    ],
  },
  deposit: {
    title: 'Add money',
    description: 'Choose the source account and review the deposit.',
    action: 'Confirm demo deposit',
    fee: 0,
    match: /\b(deposit|add money|top.?up)\b/i,
    domains: ['bank'],
    fields: [
      {
        key: 'source',
        label: 'Source account',
        type: 'choice',
        initial: 'Savings •• 2048',
        options: ['Savings •• 2048', 'Current •• 7051'],
      },
      amount,
    ],
  },
  transfer: {
    title: 'Send money',
    description: 'Check the recipient, amount and fees before confirming.',
    action: 'Send demo transfer',
    fee: 5,
    balance: 84250,
    match: /\b(transfer|send money|upi|remittance|beneficiary)\b/i,
    domains: ['bank'],
    fields: [
      {
        key: 'recipient',
        label: 'Recipient',
        type: 'text',
        initial: 'Alex Morgan',
      },
      {
        key: 'account',
        label: 'Account or UPI ID',
        type: 'text',
        initial: 'alex@example',
      },
      amount,
      {
        key: 'reference',
        label: 'Reference',
        type: 'text',
        initial: 'Shared expenses',
      },
    ],
  },
  card: {
    title: 'Card controls',
    description: 'Change the status and spending limit of your sample card.',
    action: 'Apply demo changes',
    fee: 0,
    match: /\b(cards?|freeze|spending limit)\b/i,
    domains: ['card'],
    fields: [
      {
        key: 'card',
        label: 'Card',
        type: 'choice',
        initial: 'Everyday •• 4242',
        options: ['Everyday •• 4242', 'Travel •• 8080'],
      },
      {
        key: 'status',
        label: 'Card status',
        type: 'choice',
        initial: 'Active',
        options: ['Active', 'Frozen'],
      },
      {
        key: 'limit',
        label: 'Monthly spending limit',
        type: 'money',
        initial: '25000.00',
      },
    ],
  },
  loan: {
    title: 'Loan repayment',
    description: 'Review the repayment amount and payment account.',
    action: 'Confirm demo repayment',
    fee: 0,
    balance: 84250,
    match: /\b(loan|emi|mortgage|repayment)\b/i,
    domains: ['credit'],
    fields: [
      {
        key: 'loan',
        label: 'Loan account',
        type: 'text',
        initial: 'Personal loan •• 1024',
      },
      { ...amount, initial: '12500.00' },
      {
        key: 'source',
        label: 'Payment account',
        type: 'choice',
        initial: 'Savings •• 2048',
        options: ['Savings •• 2048', 'Current •• 7051'],
      },
    ],
  },
  insurance: {
    title: 'Insurance claim',
    description: 'Provide sample incident details and review your claim.',
    action: 'Submit demo claim',
    fee: 0,
    match: /\b(insurance|claims?|policy)\b/i,
    domains: ['insurance'],
    fields: [
      {
        key: 'policy',
        label: 'Policy number',
        type: 'text',
        initial: 'DEMO-2048',
      },
      {
        key: 'incident',
        label: 'Incident summary',
        type: 'text',
        initial: 'Sample covered incident',
      },
      { ...amount, label: 'Claim amount', initial: '5000.00' },
    ],
  },
  invoice: {
    title: 'Create invoice',
    description: 'Review the customer, description and amount before issuing.',
    action: 'Issue demo invoice',
    fee: 0,
    match: /\b(invoice|merchant|settlement|receivables)\b/i,
    domains: ['merchant'],
    fields: [
      {
        key: 'customer',
        label: 'Customer email',
        type: 'email',
        initial: 'alex@example.com',
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text',
        initial: 'Design services',
      },
      { ...amount, initial: '18500.00' },
    ],
  },
  verification: {
    title: 'Identity verification',
    description:
      'Use fictional details. This preview does not upload identity documents.',
    action: 'Submit demo verification',
    fee: 0,
    match: /\b(kyc|identity verification|verify identity)\b/i,
    domains: ['kyc'],
    fields: [
      {
        key: 'name',
        label: 'Legal name',
        type: 'text',
        initial: 'Alex Morgan',
      },
      {
        key: 'residence',
        label: 'Country of residence',
        type: 'choice',
        initial: 'India',
        options: ['India', 'United States', 'United Kingdom'],
      },
      {
        key: 'document',
        label: 'Document type',
        type: 'choice',
        initial: 'Passport',
        options: ['Passport', 'National ID'],
      },
    ],
  },
  expense: {
    title: 'Record expense',
    description: 'Review the amount and category before saving.',
    action: 'Save demo expense',
    fee: 0,
    match: /\b(budget|expenses?|spending)\b/i,
    domains: ['budget'],
    fields: [
      {
        key: 'description',
        label: 'Description',
        type: 'text',
        initial: 'Groceries',
      },
      amount,
      {
        key: 'category',
        label: 'Category',
        type: 'choice',
        initial: 'Food',
        options: ['Food', 'Transport', 'Housing', 'Other'],
      },
    ],
  },
};
export type FlowState = {
  stage: FlowStage;
  values: Record<string, string>;
  errors: Record<string, string>;
  outcome: 'success' | 'pending' | 'failed';
};
export type FlowEvent =
  | { type: 'change'; key: string; value: string }
  | {
      type:
        | 'start'
        | 'review'
        | 'edit'
        | 'confirm'
        | 'resolve'
        | 'retry'
        | 'reset';
    };
export function initialFlow(
  kind: WorkflowKind,
  stage: FlowStage = 'details',
  outcome: FlowState['outcome'] = 'success',
): FlowState {
  return {
    stage,
    outcome,
    values: Object.fromEntries(
      workflows[kind].fields.map((f) => [f.key, f.initial]),
    ),
    errors: {},
  };
}
export function moneyMinor(value: string): number | null {
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ''] = value.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}
export function flowTotals(kind: WorkflowKind, values: Record<string, string>) {
  const base =
    kind === 'trade'
      ? (moneyMinor(values.price ?? '') ?? 0) * Number(values.quantity || 0)
      : (moneyMinor(values.amount ?? values.limit ?? '') ?? 0);
  const fee = workflows[kind].fee * 100;
  return {
    base,
    fee,
    total: kind === 'trade' && values.side === 'Sell' ? base - fee : base + fee,
  };
}
export function validateFlow(
  kind: WorkflowKind,
  values: Record<string, string>,
) {
  const errors: Record<string, string> = {};
  const workflow = workflows[kind];
  for (const field of workflow.fields) {
    const v = values[field.key]?.trim() ?? '';
    if (!v || v.length > 160)
      errors[field.key] = 'Enter a value of 1–160 characters.';
    else if (
      field.type === 'money' &&
      (moneyMinor(v) === null || moneyMinor(v)! <= 0)
    )
      errors[field.key] = 'Enter a positive amount with up to two decimals.';
    else if (
      field.type === 'quantity' &&
      (!/^\d{1,5}$/.test(v) || Number(v) < 1)
    )
      errors[field.key] = 'Enter a whole quantity from 1 to 99,999.';
    else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
      errors[field.key] = 'Enter a valid email address.';
    else if (field.options && !field.options.includes(v))
      errors[field.key] = 'Choose an available option.';
  }
  const total = flowTotals(kind, values).total;
  if (
    kind === 'trade' &&
    values.side === 'Sell' &&
    Number(values.quantity) > 12
  )
    errors.quantity = 'This demo position contains 12 units.';
  if (
    workflow.balance &&
    !(kind === 'trade' && values.side === 'Sell') &&
    total > workflow.balance * 100
  )
    errors.amount = 'Amount and fees exceed the demo available balance.';
  if (kind === 'trade' && values.side === 'Sell' && total <= 0)
    errors.price = 'Proceeds must exceed the illustrative fee.';
  return errors;
}
/** No network, hidden retries or confirmation without validation. */
export function transitionFlow(
  kind: WorkflowKind,
  state: FlowState,
  event: FlowEvent,
): FlowState {
  if (event.type === 'reset')
    return initialFlow(kind, 'details', state.outcome);
  if (event.type === 'change') {
    if (
      state.stage !== 'input' ||
      !workflows[kind].fields.some((f) => f.key === event.key)
    )
      return state;
    return {
      ...state,
      values: { ...state.values, [event.key]: event.value },
      errors: {},
    };
  }
  if (event.type === 'start' && ['details', 'empty'].includes(state.stage))
    return { ...state, stage: 'input' };
  if (event.type === 'edit' && ['review', 'failed'].includes(state.stage))
    return { ...state, stage: 'input', errors: {} };
  if (event.type === 'review' && state.stage === 'input') {
    const errors = validateFlow(kind, state.values);
    return {
      ...state,
      errors,
      stage: Object.keys(errors).length ? 'input' : 'review',
    };
  }
  if (event.type === 'confirm' && state.stage === 'review') {
    const errors = validateFlow(kind, state.values);
    return {
      ...state,
      errors,
      stage: Object.keys(errors).length ? 'input' : 'loading',
    };
  }
  if (event.type === 'resolve' && state.stage === 'loading')
    return { ...state, stage: state.outcome };
  if (event.type === 'retry' && state.stage === 'failed')
    return { ...state, stage: 'review', errors: {} };
  return state;
}
export function formatMoney(minor: number, currency = 'INR') {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(minor / 100);
}
export function stageForPrompt(prompt: string): FlowStage {
  if (/\binput state\b/i.test(prompt)) return 'input';
  if (/\b(empty|no transactions|no activity)\b/i.test(prompt)) return 'empty';
  if (/\b(failed|failure|error state)\b/i.test(prompt)) return 'failed';
  if (/\b(pending|processing)\b/i.test(prompt)) return 'pending';
  if (/\b(loading|skeleton)\b/i.test(prompt)) return 'loading';
  if (/\b(success|confirmation|receipt)\b/i.test(prompt)) return 'success';
  if (/\breview\b/i.test(prompt)) return 'review';
  return 'details';
}

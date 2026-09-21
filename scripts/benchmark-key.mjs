import { emitKeypressEvents } from 'node:readline';

/** Memory-only terminal input; never echo or persist the credential. */
export function readSecret(input = process.stdin, output = process.stderr) {
  if (!input.isTTY || !output.isTTY)
    throw new Error(
      'Run npm run benchmark in an interactive terminal, or set OPENROUTER_API_KEY for this process.',
    );
  output.write('OpenRouter API key (hidden; session only): ');
  emitKeypressEvents(input);
  const wasRaw = Boolean(input.isRaw);
  input.setRawMode(true);
  input.resume();
  return new Promise((resolve, reject) => {
    let value = '';
    const finish = (error) => {
      input.removeListener('keypress', onKey);
      input.removeListener('end', onEnd);
      input.setRawMode(wasRaw);
      input.pause();
      output.write('\n');
      const secret = value.trim();
      value = '';
      if (error) reject(error);
      else if (!secret || secret.length > 512)
        reject(new Error('Enter a valid API key.'));
      else resolve(secret);
    };
    const onEnd = () => finish(new Error('Key entry cancelled.'));
    const onKey = (text, key = {}) => {
      if (key.ctrl && ['c', 'd'].includes(key.name)) return onEnd();
      if (key.name === 'return' || key.name === 'enter') return finish();
      if (key.name === 'backspace') {
        value = value.slice(0, -1);
        return;
      }
      if (key.ctrl && key.name === 'u') {
        value = '';
        return;
      }
      if (!key.ctrl && !key.meta && text && !/[\x00-\x1f\x7f]/.test(text))
        value += text;
    };
    input.on('keypress', onKey);
    input.once('end', onEnd);
  });
}

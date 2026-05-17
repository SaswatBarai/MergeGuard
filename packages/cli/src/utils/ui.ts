import pc from 'picocolors';

export const ui = {
  title:   (text: string) => console.log('\n' + pc.bold(pc.cyan(text))),
  success: (text: string) => console.log(pc.green('✔ ') + pc.bold(text)),
  info:    (text: string) => console.log(pc.cyan('ℹ ') + text),
  warn:    (text: string) => console.log(pc.yellow('⚠ ') + pc.bold(text)),
  error:   (text: string) => console.log(pc.red('✖ ') + pc.bold(text)),
  dim:     (text: string) => console.log(pc.gray('  ' + text)),
  divider: () => console.log('\n' + pc.gray('─'.repeat(50)) + '\n'),
  step:    (n: number, total: number, text: string) =>
    console.log(pc.bold(pc.cyan(`[${n}/${total}]`)) + ' ' + text),
  kv:      (key: string, value: string) =>
    console.log('  ' + pc.gray(key.padEnd(16)) + pc.white(value)),
};

import pc from 'picocolors';

export const ui = {
  title: (text: string) => console.log(pc.cyan(pc.bold(text))),
  success: (text: string) => console.log(pc.green(pc.bold(text))),
  info: (text: string) => console.log(pc.cyan(text)),
  warn: (text: string) => console.log(pc.yellow(pc.bold(text))),
  error: (text: string) => console.log(pc.red(pc.bold(text))),
  dim: (text: string) => console.log(pc.gray(text)),
  divider: () => console.log(pc.bold('\n------------------------------\n')),
};

import * as vscode from 'vscode';
import { logger } from '../../global/log';

export function CreateTaskLikeInteractiveTerminal(title: string,commands: string[]): vscode.Terminal {
  let term = vscode.window.createTerminal({
    name: title,
    isTransient: true,
    iconPath: new vscode.ThemeIcon("terminal"),
    location: vscode.TerminalLocation.Editor,
  });
  term.sendText(commands.join(" "));
  logger.info("creating a task like terminal: commands " + commands);
  term.processId.then((pid) => {
    logger.info(`msfvenom terminal started with PID: ${pid}`);
  });
  term.show();
  return term;
};
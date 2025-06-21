import * as vscode from 'vscode';
import { CommandCodeLensProvider } from './commandCodeLensProvider';
import * as cp from 'child_process';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('markdown.run.command', (args) => {
			var term = vscode.window.activeTerminal || vscode.window.createTerminal();
			// check if there's a running command in the active terminal, if there is one
			// create a new term
			term.processId.then(pid => {
				cp.exec('ps -o state= -p ' + pid, (error, stdout, stderr) => {
					if (error) {
						// if we can't check just send to the current one...
						term.show();
						term.sendText(args.command);
						return;
					}

					// a + in the state indicates a process running in foreground
					if (!stdout.includes('+')) {
						term = vscode.window.createTerminal();
					}
					term.show();
					term.sendText(args.command);
				});
			});
		})
	);

	context.subscriptions.push(
		vscode.languages.registerCodeLensProvider({ language: 'markdown', scheme: 'file' },
			new CommandCodeLensProvider())
	);
}

export function deactivate() { }

import * as vscode from 'vscode';
import { callback } from '../utils';

export const copyCommand: callback = async (args) => {
    if (!args || !args.command) {
        vscode.window.showErrorMessage('No command provided to copy.');
        return;
    }
    const command = args.command;
    await vscode.env.clipboard.writeText(command);
    vscode.window.showInformationMessage('Command copied to clipboard: ' + command);
};
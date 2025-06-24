import * as vscode from 'vscode';

export const WeaponTaskProvider = class implements vscode.TaskProvider {
  provideTasks(token: vscode.CancellationToken): vscode.ProviderResult<vscode.Task[]> {
    throw new Error('Method not implemented.');
  }
  resolveTask(task: vscode.Task, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Task> {
    throw new Error('Method not implemented.');
  }
};
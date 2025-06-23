import * as vscode from "vscode";
import { targetFilePattern } from "../global/const";
import {
  ProcessMarkdownFileToWorkspaceState,
  ProcessWorkspaceStateToEnvironmentCollects,
} from "./syncHostMarkdown";
import { logger } from "../global/log";

export async function registerVariablesWatcher(
  context: vscode.ExtensionContext
) {
  // clean update the extension's workspace state
  context.workspaceState.update("users", [] as any);
  context.workspaceState.update("hosts", [] as any);

  let files = await vscode.workspace.findFiles(targetFilePattern);
  for (const file of files) {
    logger.info(`Processing file: ${file.fsPath}`);
    await ProcessMarkdownFileToWorkspaceState(file);
  }
  context.workspaceState.keys().forEach((key) => {
    logger.info(
      `Workspace state key: ${key} => ${JSON.stringify(
        context.workspaceState.get(key)
      )}`
    );
  });
  let wksp = vscode.workspace.workspaceFolders?.[0];
  if (wksp) {
    logger.info(`Processing workspace: ${wksp.name}`);
    await ProcessWorkspaceStateToEnvironmentCollects(wksp);
  } else {
    logger.warn("No workspace found, skipping workspace state processing.");
  }

  let filewatcher = vscode.workspace.createFileSystemWatcher(targetFilePattern);
  context.subscriptions.push(
    filewatcher.onDidChange(async (file) => {
      logger.info(`Watched file changed: ${file.fsPath}`);
      await ProcessMarkdownFileToWorkspaceState(file);
      let wksp = vscode.workspace.getWorkspaceFolder(file);
      if (wksp) {
        await ProcessWorkspaceStateToEnvironmentCollects(wksp);
      }
    })
  );
}

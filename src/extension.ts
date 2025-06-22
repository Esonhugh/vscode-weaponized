import * as vscode from "vscode";
import { logger } from "./global/log";
import { ProcessMarkdownFileToWorkspaceState } from "./global/syncHostMarkdown";
import {
  runCommand,
  CommandCodeLensProvider,
  DumpProvider,
  displayVirtualContent,
  ReadOnlyProvider,
  dumpetchosts,
  dumpalluser,
} from "./commands";
import { Extension } from "./global/context";

const targetFilePattern = "**/{users,hosts,services}/*/*.md";

export async function activate(context: vscode.ExtensionContext) {
  Extension.context = context;
  console.log(
    'Congratulations, your extension "vscode weaponized" is now active!'
  );
  if (
    !vscode.workspace.workspaceFolders ||
    vscode.workspace.workspaceFolders.length === 0
  ) {
    vscode.window.showErrorMessage(
      "Please open a workspace folder to use this extension."
    );
    return;
  }
  logger.info("Activating vscode weaponized extension...");

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

  let filewatcher = vscode.workspace.createFileSystemWatcher(targetFilePattern);

  context.subscriptions.push(
    filewatcher.onDidChange(async (file) => {
      logger.info(`Watched file changed: ${file.fsPath}`);
      await ProcessMarkdownFileToWorkspaceState(file);
    }),
    vscode.commands.registerCommand("weapon.dump_hosts", dumpetchosts),
    vscode.commands.registerCommand("weapon.dump_users", dumpalluser),
    vscode.commands.registerCommand("weapon.run_command", runCommand),
    vscode.commands.registerCommand(
      "weapon.display_virtual_content",
      displayVirtualContent
    ),
    vscode.languages.registerCodeLensProvider(
      { language: "markdown", scheme: "file", pattern: targetFilePattern },
      new CommandCodeLensProvider()
    ),
    vscode.languages.registerCodeLensProvider(
      { language: "markdown", scheme: "file", pattern: targetFilePattern },
      new DumpProvider()
    ),
    vscode.workspace.registerTextDocumentContentProvider(
      "weaponized-editor",
      new ReadOnlyProvider()
    )
  );
}

export function deactivate() {}

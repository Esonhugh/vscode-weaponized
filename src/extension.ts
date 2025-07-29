import * as vscode from "vscode";
import { logger } from "./global/log";
import { Context } from "./global/context";
import { registerCommandsPackage } from "./commands";
import { registerVariablesWatcher } from "./variableProcessor";
import { registerCodeLensProviders } from "./codelens";
import { registerTerminalUtils } from "./terminal";

export async function activate(context: vscode.ExtensionContext) {
  Context.context = context;
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
  registerVariablesWatcher(context);
  registerCommandsPackage(context);
  registerCodeLensProviders(context);
  registerTerminalUtils(context);
  logger.info("vscode weaponized extension activated successfully.");
}

export function deactivate() {}

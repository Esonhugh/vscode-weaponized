import * as vscode from "vscode";
import { logger } from "./global/log";
import { Context } from "./global/context";
import { registerCommandsPackage } from "./commands";
import { registerVariablesWatcher } from "./variableProcessor";
import { registerCodeLensProviders } from "./codelens";
import { registerTerminalUtils } from "./terminal";
import { registerDefinitionProvider } from "./definition";

function dependencyCheck(context: vscode.ExtensionContext): boolean {
  const foamExtension = vscode.extensions.getExtension("foam.foam-vscode");
  if (!foamExtension) {
    logger.warn("Foam extension is not installed.");
    vscode.window.showErrorMessage("Foam extension is not installed. please install foam.foam-vscode extension");
    return false;
  }
  logger.info("Foam extension is installed.");
  if (
    !vscode.workspace.workspaceFolders ||
    vscode.workspace.workspaceFolders.length === 0
  ) {
    vscode.window.showErrorMessage(
      "Please open a workspace folder to use this extension."
    );
    return false;
  }
  logger.info("Workspace folder is available.");
  return true;
}

export async function activate(context: vscode.ExtensionContext) {
  Context.context = context;
  if (!dependencyCheck(context)) {
    return;
  }
  logger.info("Activating vscode weaponized extension...");
  registerVariablesWatcher(context);
  registerCommandsPackage(context);
  registerCodeLensProviders(context);
  registerTerminalUtils(context);
  registerDefinitionProvider(context);
  logger.info("vscode weaponized extension activated successfully.");
}

export function deactivate() {}

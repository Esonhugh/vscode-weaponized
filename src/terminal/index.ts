import * as vscode from "vscode";
import {
  registerTerminalForCapture,
  startTempTerminalRecord,
  unregisterTerminalForCapture,
} from "./record_append";
import { logger } from "../global/log";

export function registerTerminal(context: vscode.ExtensionContext) {
  if (
    vscode.workspace
      .getConfiguration("weaponized")
      .get<boolean>("terminal-log.enabled", false)
  ) {
    logger.info("Registering terminal for capture...");
    if (!vscode.workspace.workspaceFolders) {
      logger.error(
        "No workspace folders found. Cannot register terminal for capture."
      );
      return;
    }
    let fp = vscode.workspace
      .getConfiguration("weaponized")
      .get<string>(
        "terminal-log.path",
        "${workspaceFolder}/.vscode/.terminal.log"
      );
    if (fp.includes("${workspaceFolder}")) {
      let workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
      fp = fp.replace("${workspaceFolder}", workspaceFolder);
    }
    const loglevel = vscode.workspace
      .getConfiguration("weaponized")
      .get<string>("terminal-log.level", "command-only");
    registerTerminalForCapture(fp, loglevel);
  } else {
    logger.info("Terminal logging is disabled in settings.");
  }
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "weaponized.terminal-logger.register",
      startTempTerminalRecord
    ),
    vscode.commands.registerCommand(
      "weaponized.terminal-logger.unregister",
      unregisterTerminalForCapture
    )
  );
}

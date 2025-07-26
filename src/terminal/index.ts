import * as vscode from "vscode";
import {
  activate,
  startTempTerminalRecord,
  stopTempTerminalForCapture,
} from "./record_append";

export function registerTerminal(context: vscode.ExtensionContext) {
  activate();
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "weaponized.terminal-logger.register",
      startTempTerminalRecord
    ),
    vscode.commands.registerCommand(
      "weaponized.terminal-logger.unregister",
      stopTempTerminalForCapture,
    )
  );
}

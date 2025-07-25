import * as vscode from "vscode";
import { registerTerminalForCapture } from "./record_append";
import { logger } from "../global/log";

export function registerTerminal(context: vscode.ExtensionContext) {
  if(vscode.workspace.getConfiguration("weaponized").get<boolean>("terminal-log.enabled", false)) {
    logger.info("Registering terminal for capture...");
    registerTerminalForCapture();
  } else {
    logger.info("Terminal logging is disabled.");
  }
}

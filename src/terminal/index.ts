import * as vscode from "vscode";
import { registerTerminalForCapture } from "./record_append";

export function registerTerminal(context: vscode.ExtensionContext) {
  registerTerminalForCapture();
}

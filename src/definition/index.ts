import * as vscode from "vscode";
import { BloodhoundDefinitionProvider } from "./provider";
import { logger } from "../global/log";

export function registerDefinitionProvider(context: vscode.ExtensionContext) {
    BloodhoundDefinitionProvider.registerSelf(context);
    
}

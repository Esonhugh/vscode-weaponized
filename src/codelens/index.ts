import * as vscode from "vscode";
import { targetFilePattern } from "../global/const";
import { markdownCodelens } from "./markdown";

export function registerCodeLensProviders(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { language: "markdown", scheme: "file", pattern: targetFilePattern },
      markdownCodelens
    )
  );
}

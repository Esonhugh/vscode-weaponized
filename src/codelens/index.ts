import * as vscode from "vscode";
import { targetFilePattern } from "../global/const";
import { markdownCodelens } from "./yamlconfig";
import { CommandCodeLensProvider } from "./command/commandProvider";
import { NoteCreationProvider } from "./newnote/noteProvider";

export function registerCodeLensProviders(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { language: "markdown", scheme: "file", pattern: targetFilePattern },
      markdownCodelens
    ),
    vscode.languages.registerCodeLensProvider(
      { language: "markdown", scheme: "file", pattern: targetFilePattern },
      new CommandCodeLensProvider()
    ),
    vscode.languages.registerCodeLensProvider(
      { language: "markdown", scheme: "file", pattern: targetFilePattern },
      new NoteCreationProvider()
    ),
  );
}

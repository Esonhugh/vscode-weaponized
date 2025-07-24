import * as vscode from "vscode";
import { callback } from "../utils";
import { logger } from "../../global/log";



const cyberchefURL = "https://gchq.github.io/CyberChef";
const magicRecipe = "Magic(5,false,false,'')";

function constructCyberChefURL(input: string): string {
  const encodedInput = btoa(input);
  return `${cyberchefURL}/?recipe=${encodeURIComponent(magicRecipe)}&input=${encodeURIComponent(encodedInput)}`;
}

export const cyberChefMagicDecoder: callback = async (args) => {
  let selectedText: string | undefined = args?.selectedText;
  if (!selectedText) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No active editor found");
      return;
    }

    const document = editor.document;
    const selection = editor.selection;
    selectedText = document.getText(selection);
  }
  if (!selectedText) {
    vscode.window.showErrorMessage("No text selected");
    return;
  }
  const url = constructCyberChefURL(selectedText);
  logger.info(`Opening CyberChef with URL: ${url}`);
  vscode.commands.executeCommand("simpleBrowser.show", url);
};

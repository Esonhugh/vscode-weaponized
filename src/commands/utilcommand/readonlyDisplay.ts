import * as vscode from "vscode";
import { type callback } from "./utils";

export const ReadOnlyProvider = class
  implements vscode.TextDocumentContentProvider
{
  provideTextDocumentContent(uri: vscode.Uri): string {
    return uri.query;
  }
};

export const displayVirtualContent: callback = async (args) => {
  let content = "Here is the example content";
  if (args && args.content) {
    content = args.content;
  }
  let title = "Virtual Content";
  if (args && args.title) {
    title = encodeURIComponent(args.title);
  }
  let uri = vscode.Uri.parse("weaponized-editor:" + title + "?" + encodeURIComponent(content));
  // let uri = vscode.Uri.parse("weaponized-editor:" + content);
  let doc = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(doc, { preview: false });
  if (args && args.copyToClipboard) {
    await vscode.env.clipboard.writeText(content);
  }
};

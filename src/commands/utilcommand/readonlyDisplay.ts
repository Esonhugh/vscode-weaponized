import * as vscode from "vscode";

type callback = (...args: any[]) => any;

export const ReadOnlyProvider = class
  implements vscode.TextDocumentContentProvider
{
  provideTextDocumentContent(uri: vscode.Uri): string {
    return uri.path;
  }
};

export const displayVirtualContent: callback = async (args) => {
  let content = "";
  if (!args || !args.content) {
    content = "testcontent";
  } else {
    content =  args.content;
  }
  let uri = vscode.Uri.parse("weaponized-editor:" + content);
  let doc = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(doc, { preview: false });
};

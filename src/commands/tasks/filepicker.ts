import { callback } from "../utilcommand/utils";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { logger } from "../../global/log";

interface FileOptionItem {
  fullpath: string;
  label: string;
  description: string;
}

export const filedirpicker: callback = async (
  getFile: boolean
): Promise<string | undefined> => {
  // The code you place here will be executed every time your command is executed

  let dirs =
    vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ?? [];

  let files = [] as FileOptionItem[];

  dirs.forEach((element) => {
    let directory = element;
    if (!path.isAbsolute(directory)) {
      directory = path.join(vscode.workspace.rootPath ?? "", directory);
    }

    fs.readdirSync(directory).forEach((file) => {
      if (file) {
        files.push({
          label: file,
          description: element,
          fullpath: path.join(directory!, file),
        } as FileOptionItem);
      }
    });
  });

  // sort the files
  files.sort((a, b) => {
    let aLower = a.label.toLocaleLowerCase();
    let bLower = b.label.toLocaleLowerCase();

    if (aLower > bLower) {
      return 1;
    }

    if (bLower > aLower) {
      return -1;
    }

    return 0;
  });

  // Display a message box to the user
  var fileItem = await vscode.window.showQuickPick(files).then((item) => {
    // vscode.window.showInformationMessage(item?.fullpath ?? "No file chosen!");
    return item;
  });

  return fileItem?.fullpath;
};

export const filepicker = async (arg: any) => {
  if (!vscode.workspace.workspaceFolders?.length) {
    return;
  }

  let dir: vscode.Uri | undefined = arg?.dir;
  if (!dir) {
    if (vscode.workspace.workspaceFolders.length > 0) {
      dir = vscode.workspace.workspaceFolders[0].uri;
    } else {
      logger.warn("workspace is empty");
      return;
    }
  }

  while (true) {
    // @ts-ignore
    const { type, uri } = await chooseFile(dir!);
    if (!uri) {
      return;
    }

    if (type !== vscode.FileType.Directory) {
      return uri.fsPath;
    } else {
      dir = uri;
    }
  }
};

async function chooseFile(
  dir: vscode.Uri
): Promise<{ uri?: vscode.Uri; type: vscode.FileType }> {
  const { name, type } = (await vscode.window.showQuickPick(
    (async () => {
      const entries = await vscode.workspace.fs.readDirectory(dir);
      const items = entries.map(([name, type]) => {
        const label = type === vscode.FileType.Directory ? `${name}/` : name;
        return { label, name, type };
      });
      items.unshift({
        label: "../",
        name: "..",
        type: vscode.FileType.Directory,
      });
      return items;
    })(),
    { title: "Select File" }
  )) || { type: vscode.FileType.Unknown };
  if (!name) {
    return { type };
  }

  const uri = vscode.Uri.joinPath(dir, name);
  return { uri, type };
}

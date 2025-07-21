import { type callback } from "../utilcommand/utils";
import * as vscode from "vscode";
import { logger } from "../../global/log";
import { fs } from "./assets";

export const setupCommand: callback = async (args: any) => {
  logger.debug(`Setting up environment with args: ${JSON.stringify(args)}`);
  let dir: vscode.Uri | undefined = args?.dir;
  if (!dir) {
    if (
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
    ) {
      dir = vscode.workspace.workspaceFolders[0].uri;
    } else {
      logger.warn("No workspace folder found. Please open a workspace first.");
      vscode.window.showErrorMessage(
        "No workspace folder found. Please open a workspace first."
      );
      return;
    }
  }
  logger.debug(`Workspace directory: ${dir}`);
  for (const [filePath, content] of Object.entries(fs)) {
    const fullPath = vscode.Uri.joinPath(dir, filePath);
    var fileExists = await vscode.workspace.fs.stat(fullPath).then(
      () => true,
      () => false
    );
    if (fileExists) {
      logger.debug(`File ${fullPath} already exists, skipping creation.`);
      continue;
    }
    logger.trace(`Creating file: ${fullPath}`);
    await vscode.workspace.fs.writeFile(fullPath, Buffer.from(content));
  }
  logger.info("Setup completed successfully.");
  vscode.window.showInformationMessage("Weaponized setup completed successfully.");  
};

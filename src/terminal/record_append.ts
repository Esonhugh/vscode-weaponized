import * as vscode from "vscode";
import { logger } from "../global/log";
import "fs";
import { appendFileSync } from "fs";
import { callback } from "../commands/utils";

export let tempEnabled = true;

async function ForceFileExist(file: vscode.Uri) {
  try {
    let stat = await vscode.workspace.fs.stat(file);
    if (stat) {
      logger.info(`File ${file.fsPath} already exists.`);
      return stat;
    }
  } catch (error) {
    logger.info(`File ${file.fsPath} does not exist, creating it...`);
    await vscode.workspace.fs.writeFile(file, Buffer.from(""));
  }
}

export const startTempTerminalRecord: callback = async (args: any) => {
  if (!vscode.workspace.workspaceFolders) {
    logger.error(
      "No workspace folders found. Cannot start temporary terminal record."
    );
    vscode.window.showErrorMessage(
      "No workspace folders found. Cannot start temporary terminal record."
    );
    return;
  }
  let fp = args?.file;
  if (!fp) {
    fp = await vscode.window.showInputBox({
      prompt: "Enter the file path to save terminal log",
      value: "${workspaceFolder}/.vscode/.terminal.log",
    });
    if (!fp) {
      logger.error("No file path provided for terminal log.");
      vscode.window.showErrorMessage("No file path provided for terminal log.");
      return;
    }
  }
  if (fp.includes("${workspaceFolder}")) {
    let workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    fp = fp.replace("${workspaceFolder}", workspaceFolder);
  }
  let loglevel = args?.loglevel;
  if (!loglevel) {
    loglevel = await vscode.window.showQuickPick(
      ["command-only", "command-and-output"],
      {
        placeHolder: "Select log level for terminal capture",
      }
    );
  }
  if (!loglevel) {
    logger.error("No log level provided for terminal capture.");
    vscode.window.showErrorMessage(
      "No log level provided for terminal capture."
    );
    return;
  }
  tempEnabled = true; // Enable temporary terminal logging
  registerTerminalForCapture(fp, loglevel);
  logger.info(`Starting terminal logging at ${fp} with log level: ${loglevel}`);
  vscode.window.showInformationMessage(
    `Terminal logging started. Logs will be saved to ${fp} with log level: ${loglevel}`
  );
};

export const unregisterTerminalForCapture: callback = () => {
  // empty the listener
  tempEnabled = false; // Disable temporary terminal logging
  logger.info("Unregistering terminal for capture.");
  vscode.window.showInformationMessage(
    "Terminal logging has been unregistered. No further logs will be captured."
  );
};

export function registerTerminalForCapture(fp: string, loglevel: string) {
  logger.info(
    `Registering terminal for capture at ${fp}, with log level: ${loglevel}`
  );
  let logFile = vscode.Uri.parse(fp);

  vscode.window.onDidStartTerminalShellExecution(
    async (event: vscode.TerminalShellExecutionStartEvent) => {
      if (!tempEnabled) {
        logger.info("Temporary terminal logging is disabled.");
        return; // If temporary logging is disabled, do not proceed
      }
      await ForceFileExist(logFile);
      const terminal = event.terminal;
      logger.debug(`Terminal started: ${terminal.name}`);
      let startTime = new Date();
      let cmd = event.execution.commandLine.value;
      let cwd =
        event.execution.cwd?.fsPath || event.shellIntegration?.cwd || "unknown";
      let logMessage = `weaponized-terminal-logging:[${startTime.getTime()}][${startTime.toJSON()}] user@${cwd}$ ${cmd}\n`;
      logger.debug(logMessage);
      appendFileSync(logFile.fsPath, logMessage);

      if (loglevel === "command-only") {
        return; // Only log the command, no further action needed
      }

      let stream = await event.execution.read();
      for await (const streamPart of stream) {
        appendFileSync(logFile.fsPath, `${streamPart}\n`);
      }
    }
  );
}

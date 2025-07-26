import * as vscode from "vscode";
import { logger } from "../global/log";
import "fs";
import { appendFileSync } from "fs";
import { callback } from "../commands/utils";
import { basename, dirname } from "path";

type EventListener = (
  event: vscode.TerminalShellExecutionStartEvent
) => Promise<void>;

interface TerminalCapture {
  filePath: string;
  logLevel: string;
  listener: EventListener;
}

let TerminalCaptures: TerminalCapture[] = [];

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
  registerTerminalForCapture(fp, loglevel);
  logger.info(`Starting terminal logging at ${fp} with log level: ${loglevel}`);
  vscode.window.showInformationMessage(
    `Terminal logging started. Logs will be saved to ${fp} with log level: ${loglevel}`
  );
};

export const stopTempTerminalForCapture: callback = async (args: any) => {
  // empty the listener
  logger.info("Unregistering terminal for capture.");
  let fp = args?.file;
  if (!fp) {
    let options: string[] = [];
    for (const capture of TerminalCaptures) {
      options.push(`${capture.logLevel} - ${basename(capture.filePath)} - ${dirname(capture.filePath)}`); // Use the first registered file path
    }
    let choice = await vscode.window.showQuickPick(options, {
      placeHolder: "Select the terminal log file to unregister",
    });
    if (!choice) {
      logger.error("No file path selected for terminal log unregistration.");
      vscode.window.showErrorMessage(
        "No file path selected for terminal log unregistration."
      );
      return;
    }
    for (const capture of TerminalCaptures) {
      if (choice === `${capture.logLevel} - ${basename(capture.filePath)} - ${dirname(capture.filePath)}`) {
        fp = capture.filePath; // Get the file path from the selected option
        break;
      }
    }
  }
  if (fp) {
    unregisterTerminalForCapture(fp);
  }
  vscode.window.showInformationMessage(
    "Terminal logging has been unregistered. No further logs will be captured."
  );
};

function registerTerminalForCapture(fp: string, loglevel: string) {
  logger.info(
    `Registering terminal for capture at ${fp}, with log level: ${loglevel}`
  );
  let logFile = vscode.Uri.parse(fp);
  let newCapture: TerminalCapture = {
    filePath: logFile.fsPath,
    logLevel: loglevel,
    listener: async (event: vscode.TerminalShellExecutionStartEvent) => {
      await ForceFileExist(logFile);
      const terminal = event.terminal;
      const terminalid = await event.terminal.processId;
      logger.debug(`Terminal started: ${terminal.name}`);
      let startTime = new Date();
      let cmd = event.execution.commandLine.value;
      let cwd =
        event.execution.cwd?.fsPath || event.shellIntegration?.cwd || "unknown";
      let logMessage = `weaponized-terminal-logging:[${startTime.getTime()}][terminalid: ${terminalid}] user@${cwd}$ ${cmd}\n`;
      logger.debug(logMessage);
      appendFileSync(logFile.fsPath, logMessage);

      if (loglevel === "command-only") {
        return; // Only log the command, no further action needed
      }

      let stream = await event.execution.read();
      for await (const streamPart of stream) {
        appendFileSync(logFile.fsPath, `${streamPart}\n`);
      }
    },
  };
  TerminalCaptures.push(newCapture);
}

function unregisterTerminalForCapture(fp: string) {
  for (let i = 0; i < TerminalCaptures.length; i++) {
    if (TerminalCaptures[i].filePath === fp) {
      TerminalCaptures.splice(i, 1);
      logger.info(`Unregistered terminal capture for file: ${fp}`);
      return;
    }
  }
  logger.warn(`No terminal capture found for file: ${fp}`);
  vscode.window.showWarningMessage(
    `No terminal capture found for file: ${fp}. Nothing to unregister.`
  );
  return;
}

export function activate() {
  if (
    vscode.workspace
      .getConfiguration("weaponized")
      .get<boolean>("terminal-log.enabled", false)
  ) {
    logger.info("Registering terminal for capture...");
    if (!vscode.workspace.workspaceFolders) {
      logger.error(
        "No workspace folders found. Cannot register terminal for capture."
      );
      return;
    }
    let fp = vscode.workspace
      .getConfiguration("weaponized")
      .get<string>(
        "terminal-log.path",
        "${workspaceFolder}/.vscode/.terminal.log"
      );
    if (fp.includes("${workspaceFolder}")) {
      let workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
      fp = fp.replace("${workspaceFolder}", workspaceFolder);
    }
    const loglevel = vscode.workspace
      .getConfiguration("weaponized")
      .get<string>("terminal-log.level", "command-only");
    registerTerminalForCapture(fp, loglevel);
  } else {
    logger.info("Terminal logging is disabled in settings.");
  }

  vscode.window.onDidStartTerminalShellExecution(
    async (event: vscode.TerminalShellExecutionStartEvent) => {
      for (const capture of TerminalCaptures) {
        await capture.listener(event);
      }
    }
  );
}

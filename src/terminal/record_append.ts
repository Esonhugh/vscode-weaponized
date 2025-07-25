import * as vscode from "vscode";
import { logger } from "../global/log";
import "fs";
import { appendFileSync } from "fs";

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

export function registerTerminalForCapture() {
  if (!vscode.workspace.workspaceFolders) {
    logger.error(
      "No workspace folders found. Cannot register terminal for capture."
    );
    return;
  }
  let fp = vscode.workspace
    .getConfiguration("weaponized")
    .get<string>("terminal-log.path", "<default_logfile>");
  if (fp === "<default_logfile>") {
    let workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    fp = `${workspaceFolder}/.vscode/.terminal.log`;
  }
  if (fp.includes("${workspaceFolder}")) {
    let workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    fp = fp.replace("${workspaceFolder}", workspaceFolder);
  }
  let logFile = vscode.Uri.parse(fp);

  const loglevel = vscode.workspace
    .getConfiguration("weaponized")
    .get<string>("terminal-log.level", "command-only");
  logger.info("Registering terminal for capture with log level: " + loglevel);

  vscode.window.onDidStartTerminalShellExecution(
    async (event: vscode.TerminalShellExecutionStartEvent) => {
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

      const loglevel = vscode.workspace
        .getConfiguration("weaponized")
        .get<string>("terminal-log.level", "command-only");
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

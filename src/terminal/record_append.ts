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
  let logFile = vscode.Uri.parse(fp);

  vscode.window.onDidStartTerminalShellExecution(
    async (event: vscode.TerminalShellExecutionStartEvent) => {
      await ForceFileExist(logFile);
      const terminal = event.terminal;
      logger.debug(`Terminal started: ${terminal.name}`);
      let startTime = Date.now();
      let cmd = event.execution.commandLine.value;
      let cwd =
        event.execution.cwd?.fsPath || event.shellIntegration?.cwd || "unknown";
      logger.debug(`user@${cwd} [${startTime.toString()}] > ${cmd}\n`);
      appendFileSync(
        logFile.fsPath,
        `user@${cwd} [${startTime.toString()}] > ${cmd}\n`
      );

      const loglevel = vscode.workspace
        .getConfiguration("weaponized")
        .get<string>("terminal-log.level", "command-only");
      if (loglevel === "command-only") {
        return; // Only log the command, no further action needed
      }

      let stream = await event.execution.read();
      let old: string = "";
      for await (const streamPart of stream) {
        appendFileSync(logFile.fsPath, `${old}\n`);
        old = streamPart;
      }
    }
  );
}

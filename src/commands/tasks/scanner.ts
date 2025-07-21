import * as vscode from "vscode";
import { callback } from "../utilcommand/utils";
import { logger } from "../../global/log";
import { CreateTaskLikeInteractiveTerminal } from "./taskTermial";
import { Context } from "../../global/context";
import { Collects } from "../../model";

export const scanCommand: callback = async (args: any) => {
  let target: string | undefined = args?.target;
  if (!target) {
    let selectTargets = Context.HostState;
    if (!selectTargets || selectTargets.length === 0) {
      vscode.window.showErrorMessage("No hosts found to scan.");
      return;
    }
    let list: string[] = [];
    selectTargets.forEach((host) => {
      list.push(`${host.hostname} (${host.ip})`);
    });
    target = await vscode.window.showQuickPick(list, {
      placeHolder: "Select a host to scan",
    });
    if (!target) {
      vscode.window.showErrorMessage(
        "No target selected. Operation cancelled."
      );
      return;
    }
    let selected = selectTargets.find(
      (host) => `${host.hostname} (${host.ip})` === target
    );
    if (!selected) {
      vscode.window.showErrorMessage("Selected target not found in host list.");
      return;
    }
    let options: string[] = [selected.hostname, selected.ip, ...selected.alias];

    target = await vscode.window.showQuickPick(options, {
      placeHolder: "Select an option to scan",
    });
  }
  if (!target) {
    vscode.window.showErrorMessage("No target selected. Operation cancelled.");
    return;
  }

  let scannerConfig = vscode.workspace
    .getConfiguration("weaponized")
    .get<Collects>("scanners");
  if (!scannerConfig || Object.keys(scannerConfig).length === 0) {
    vscode.window.showErrorMessage("No scanners configured in settings.");
    return;
  }

  let scanner: string | undefined = args?.scanner;
  if (!scanner) {
    let options: string[] = Object.keys(scannerConfig);
    scanner = await vscode.window.showQuickPick(options, {
      placeHolder: "Select a scanner",
    });
    if (!scanner) {
      vscode.window.showErrorMessage(
        "No scanner selected. Operation cancelled."
      );
      return;
    }
  }
  logger.debug(`Selected scanner: ${scanner}`);
  let scannerCommand = scannerConfig[scanner];
  if (!scannerCommand) {
    vscode.window.showErrorMessage(`Scanner command for ${scanner} not found.`);
    return;
  }

  CreateTaskLikeInteractiveTerminal(
    `${scanner} scanning ${target}`,
    [scannerCommand.replace("$TARGET", target)],
    vscode.TerminalLocation.Editor
  );
};

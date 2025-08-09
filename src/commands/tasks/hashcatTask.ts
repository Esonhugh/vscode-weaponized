import * as vscode from "vscode";
import { callback } from "../utils";
import { logger } from "../../global/log";
import { CreateTaskLikeInteractiveTerminal } from "./taskTermial";
import { filepicker } from "./filepicker";

import {
  hash_type_collects,
  hash_device_collects,
  hash_mode_collects,
} from "../../variableProcessor/environmentCollects";
import { variables } from "../../variableProcessor/resovler";

export let hashcatCracker: callback = async (args) => {
  let hashcat = vscode.workspace
    .getConfiguration("weaponized")
    .get("hashcat", "hashcat");

  let file: string | undefined = args?.file;
  if (!args || !args.file) {
    file = await filepicker();
  }
  if (!file) {
    logger.error("No file provided for hashcat cracker.");
    return;
  }

  let hashmode = args?.hashmode;
  if (!hashmode) {
    hashmode = await vscode.window.showQuickPick(
      Object.keys(hash_mode_collects),
      {
        placeHolder: "Select a hash mode",
      }
    );
  }
  hashmode = hash_mode_collects[hashmode];

  let hashtype: string | undefined = args?.hashtype;
  if (!hashtype) {
    hashtype = await vscode.window.showQuickPick(
      Object.keys(hash_type_collects),
      {
        placeHolder: "Select a hash type",
      }
    );
  }
  hashtype = hash_type_collects[hashtype!];

  let hashdevice = args?.hashdevice;
  if (!hashdevice) {
    hashdevice = await vscode.window.showQuickPick(
      Object.keys(hash_device_collects),
      {
        placeHolder: "Select a hash device",
      }
    );
  }
  hashdevice = hash_device_collects[hashdevice!];

  let wordlist_extra: string | undefined = args?.wordlist || args?.extra;
  if (!args || !args.wordlist || !args.extra) {
    wordlist_extra = await vscode.window.showInputBox({
      placeHolder: "Enter wordlist or extra options",
      value: "$ROCKYOU",
    });
  }
  wordlist_extra = variables(wordlist_extra || "$ROCKYOU");
  let argsArray: string[] = [
    hashcat,
    "--force",
    `-a ${hashmode}`,
    `-m ${hashtype}`,
    `-D ${hashdevice}`,
    `${file}`,
    `${wordlist_extra}`,
  ];
  CreateTaskLikeInteractiveTerminal(`hash cracker`, argsArray, vscode.TerminalLocation.Editor);
};

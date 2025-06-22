import * as vscode from "vscode";
import { dumpHosts, Host } from "../../model";

import { Extension } from "../../global/context";

type callback = (...args: any[]) => any;

export const dumpetchosts:callback = async () => {
  let store = Extension.context.globalState;
  let hosts = store.get<Host[]>("hosts");
  if (!hosts) {
    return;
  }
  await vscode.commands.executeCommand("weapon.display_virtual_content", {
    content: dumpHosts(hosts, "file"),
  });
};

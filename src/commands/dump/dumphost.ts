import * as vscode from "vscode";
import { dumpHosts, Host } from "../../model";

import { Context } from "../../global/context";

type callback = (...args: any[]) => any;

export const dumpetchosts:callback = async () => {
  let hosts = Context.HostState;
  if (!hosts) {
    return;
  }
  await vscode.commands.executeCommand("weapon.display_virtual_content", {
    title: "/etc/hosts",
    content: dumpHosts(hosts, "file").trim(),
    copyToClipboard: true,
  });
};

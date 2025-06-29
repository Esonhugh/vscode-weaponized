import * as vscode from "vscode";
import { dumpUserCredentials, UserCredential } from "../../model";

import { Extension } from "../../global/context";
import { title } from "process";

type callback = (...args: any[]) => any;

export const dumpalluser:callback = async () => {
  let hosts = Extension.UserState;
  if (!hosts) {
    return;
  }
  await vscode.commands.executeCommand("weapon.display_virtual_content", {
    title: "All User Credentials",
    content: `### Dump User Credentials like Impacket
${dumpUserCredentials(hosts, "impacket")}
### Dump User Credentials netexec favor
${dumpUserCredentials(hosts, "nxc")}
### Dump User Credentials env format
${dumpUserCredentials(hosts, "env")}
`,
  });
};

import * as vscode from "vscode";
import { dumpUserCredentials, UserCredential } from "../../model";

import { Context } from "../../global/context";

type callback = (...args: any[]) => any;

export const dumpalluser:callback = async () => {
  let users = Context.UserState;
  if (!users) {
    return;
  }

  let content =   `
## Table View
${dumpUserCredentials(users, "table")}  

### Dump User Credentials like Impacket
${dumpUserCredentials(users, "impacket")}
### Dump User Credentials netexec favor
${dumpUserCredentials(users, "nxc")}
### Dump User Credentials env format
${dumpUserCredentials(users, "env")}
`;
  await vscode.commands.executeCommand("weapon.display_virtual_content", {
    title: "All User Credentials",
    content: content,
  });
};

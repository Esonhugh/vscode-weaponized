import * as vscode from "vscode";
import { targetFilePattern } from "../global/const";
import {
  getCodeblock,
  ProcessMarkdownFileToWorkspaceState,
  ProcessWorkspaceStateToEnvironmentCollects,
} from "./syncHostMarkdown";
import { logger } from "../global/log";
import { parseHostsYaml, parseUserCredentialsYaml } from "../model";
import { Context } from "../global/context";

export async function registerVariablesWatcher(
  context: vscode.ExtensionContext
) {
  // clean update the extension's workspace state
  Context.HostState = [];
  Context.UserState = [];

  let files = await vscode.workspace.findFiles(targetFilePattern);
  for (const file of files) {
    logger.info(`Processing file: ${file.fsPath}`);
    await ProcessMarkdownFileToWorkspaceState(file);
  }
  context.workspaceState.keys().forEach((key) => {
    logger.info(
      `Workspace state key: ${key} => ${JSON.stringify(
        context.workspaceState.get(key)
      )}`
    );
  });

  let wksp = vscode.workspace.workspaceFolders?.[0];
  if (wksp) {
    logger.info(`Processing workspace: ${wksp.name}`);
    await ProcessWorkspaceStateToEnvironmentCollects(wksp);
  } else {
    logger.warn("No workspace found, skipping workspace state processing.");
  }

  let filewatcher = vscode.workspace.createFileSystemWatcher(targetFilePattern);
  context.subscriptions.push(
    filewatcher.onDidChange(async (file) => {
      logger.info(`Watched file changed: ${file.fsPath}`);
      await ProcessMarkdownFileToWorkspaceState(file);
      let wksp = vscode.workspace.getWorkspaceFolder(file);
      if (wksp) {
        await ProcessWorkspaceStateToEnvironmentCollects(wksp);
      }
    }),
    filewatcher.onDidDelete(async (file) => {
      logger.info(`Watched file deleted: ${file.fsPath}`);
      /*
      let wksp = vscode.workspace.getWorkspaceFolder(file);
      if (wksp) {
        logger.debug(`Processing workspace: ${wksp.name}`);
        logger.trace(`Removing hosts from workspace state for file: ${file.fsPath}`);
        const content = (await vscode.workspace.fs.readFile(file)).toString();
        let hostCodes = await getCodeblock(content, "host")
        for (const code of hostCodes) {
          let hosts = parseHostsYaml(code)
          if (hosts.length > 0) {
            logger.info(`Removing hosts from workspace state: ${hosts.map(h => h.hostname).join(", ")}`);
            let oldHostList = Context.HostState || [];
            oldHostList = oldHostList.filter(h => !hosts.some(host => host.hostname === h.hostname));
            Context.HostState = oldHostList;
            logger.debug(`Updated hosts in workspace state: ${Context.HostState.map(h => h.hostname).join(", ")}`);
          }
        }

        logger.trace(`Removing users from workspace state for file: ${file.fsPath}`);
        let userCodes = await getCodeblock(content, "credentials")
        for (const code of userCodes) {
          let users = parseUserCredentialsYaml(code)
          if (users.length > 0) {
            logger.info(`Removing users from workspace state: ${users.map(u => u.user).join(", ")}`);
            let oldUserList = Context.UserState || [];
            oldUserList = oldUserList.filter(u => !users.some(user => `${user.login}/${user.user}` === `${u.login}/${u.user}`));
            Context.UserState = oldUserList;
            logger.debug(`Updated users in workspace state: ${Context.UserState.map(u => `${u.login}/${u.user}`).join(", ")}`);
          }
        }
        await ProcessWorkspaceStateToEnvironmentCollects(wksp);
      } 
        */
    }),
  );
}

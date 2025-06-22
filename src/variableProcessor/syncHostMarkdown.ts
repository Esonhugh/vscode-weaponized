import * as vscode from "vscode";
import {
  Host,
  parseHostsYaml,
  parseUserCredentialsYaml,
  UserCredential,
} from "../model";
import { logger } from "../global/log";
import { Extension } from "../global/context";

export function getCodeblock(content: string, identity: string): string[] {
  let lines = content.split("\n");

  var inYaml = false;
  var currentYaml = "";
  let ret: string[] = [];

  for (var line of lines) {
    if (inYaml) {
      if (line.startsWith("```")) {
        logger.debug(`Found end of the yaml block`);
        inYaml = false;
        ret.push(currentYaml);
        logger.trace(`Pushed yaml block for config type: ${identity}`);
      }
      currentYaml += line + "\n";
    }
    if (line.startsWith("```yaml")) {
      if (line.includes(identity)) {
        inYaml = true;
        logger.debug(`Found start of yaml block for config type: ${identity}`);
      }
      continue;
    }
  }
  return ret;
}

function uniqueHosts(old_host: Host[]): Host[] {
  let uniqmap = new Map<string, number>();
  let newHost: Host[] = [];
  for (let h of old_host) {
    if (uniqmap.has(h.hostname)) {
      continue;
    }
    newHost.push(h);
    uniqmap.set(h.hostname, 1);
  }
  return newHost;
}

function uniqueUsers(old_user: UserCredential[]): UserCredential[] {
  let uniqmap = new Map<string, number>();
  let newUser: UserCredential[] = [];
  for (let u of old_user) {
    if (uniqmap.has(`${u.login}/${u.user}`)) {
      continue;
    }
    newUser.push(u);
    uniqmap.set(`${u.login}/${u.user}`, 1);
  }
  return newUser;
}

export function mergeUserCredFromFile(
  content: string,
  old_user_list: UserCredential[]
): UserCredential[] {
  let blocks = getCodeblock(content, "credentials");
  for (let b of blocks) {
    try {
      let users: UserCredential[] = parseUserCredentialsYaml(b);
      old_user_list.push(...users);
    } catch (e) {
      logger.error(`parse failed, content: ${b}`);
    }
  }
  return uniqueUsers(old_user_list.reverse()); // let new changes on top
}

export function mergeHostFromFile(
  content: string,
  old_host_list: Host[]
): Host[] {
  let blocks = getCodeblock(content, "host");
  for (let b of blocks) {
    try {
      let hosts: Host[] = parseHostsYaml(b);
      old_host_list.push(...hosts);
    } catch (e) {
      logger.error(`parse failed, content: ${b}`);
    }
  }
  return uniqueHosts(old_host_list.reverse());
}

export async function ProcessMarkdownFileToWorkspaceState(file: vscode.Uri) {
  let store = Extension.context.workspaceState;
  let collection = Extension.context.environmentVariableCollection.getScoped({
    workspaceFolder: vscode.workspace.getWorkspaceFolder(file),
  });
  collection.persistent = true;
  collection.description =
    "This is a scoped environment variable collection for the workspace";
  collection.prepend(`WEAPON_EXTENSION_ENABLED`, "true");
  collection.prepend(`PROJECT_FOLDER`, vscode.workspace.getWorkspaceFolder(file)?.uri.fsPath || "");

  const content = await vscode.workspace.fs.readFile(file);

  let old_user_list = store.get<UserCredential[]>("users");
  if (!old_user_list) {
    store.update("users", [] as UserCredential[]);
  } else {
    old_user_list = mergeUserCredFromFile(content.toString(), old_user_list);
    logger.trace(`Merged user credentials from file: ${file.fsPath} `);
    store.update("users", old_user_list);
    for (let user of old_user_list) {
      let u = new UserCredential().init(user);
      u.setEnvironmentCollection(collection);
    }
  }

  let old_host_list = store.get<Host[]>("hosts");
  if (!old_host_list) {
    store.update("hosts", [] as Host[]);
  } else {
    old_host_list = mergeHostFromFile(content.toString(), old_host_list);
    logger.trace(`Merged hosts from file: ${file.fsPath} `);
    store.update("hosts", old_host_list);
    for (let host of old_host_list) {
      let h = new Host().init(host);
      h.setEnvironmentCollection(collection);
    }
  }
  
}

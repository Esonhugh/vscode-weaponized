import * as vscode from "vscode";
import {
  Host,
  parseHostsYaml,
  parseUserCredentialsYaml,
  UserCredential,
  Collects,
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

function mergeCollects(...cs: Collects[]): Collects {
  let ret: Collects = {};
  for (let c of cs) {
    for (let key in c) {
      if (ret[key]) {
        continue;
      }
      ret[key] = c[key];
    }
  }
  return ret;
}

const hash_collects: Collects = {
  HASHCAT_MODE_WORDLIST: "0",
  HASHCAT_MODE_COMBINATION: "1",
  HASHCAT_MODE_TOGGLE_CASE: "2",
  HASHCAT_MODE_MASK_BRUTE_FORCE: "3",
  HASHCAT_MODE_WORDLIST_MASK: "6",
  HASHCAT_MODE_MASK_WORDLIST: "7",
  HASHCAT_DEVICE_CPU: "1",
  HASHCAT_DEVICE_GPU: "2",
  HASHCAT_DEVICE_FPGA: "3",
  HASH_MD5: "0",
  HASH_SHA1: "100",
  HASH_MD5CYPT: "500",
  HASH_MD4: "900",
  HASH_NTLM: "1000",
  HASH_SHA256: "1400",
  HASH_APRMD5: "1600",
  HASH_SHA512: "1800",
  HASH_BCRYPT: "3200",
  HASH_NETNTLMv2: "5600",
  HASH_SHA256CRYPT: "7400",
  HASH_KRB5_PA_23: "7500",
  HASH_KRB5_PA_17: "19800",
  HASH_KRB5_PA_18: "19900",
  HASH_DJANGO_PBKDF2_SHA256: "10000",
  HASH_PBKDF2_HMAC_SHA256: "10900",
  HASH_KRB5_TGS_23: "13100",
  HASH_KRB5_TGS_17: "19600",
  HASH_KRB5_TGS_18: "19700",
  HASH_JWT: "16500",
  HASH_KRB5_AS_REP_23: "18200",
  HASH_KRB5_AS_REP_17: "19500",
  HASH_KRB5_AS_REP_18: "19700",
};

let default_collects: Collects = mergeCollects(hash_collects);

export async function ProcessWorkspaceStateToEnvironmentCollects(
  workspace: vscode.WorkspaceFolder
) {
  let collection = Extension.context.environmentVariableCollection.getScoped({
    workspaceFolder: workspace,
  });
  logger.info(`Processing workspaceState on workspace: ${workspace.name}`);
  collection.forEach((value, key) => {
    logger.debug(`Clearing environment variable: ${key} => ${value}`);
  });

  collection.clear();
  default_collects["PROJECT_FOLDER"] = workspace.uri.fsPath;

  let ul: Collects = {};
  let old_user_list = Extension.UserState;
  if (old_user_list) {
    for (let user of old_user_list) {
      let u = new UserCredential().init(user);
      var uc = u.exportEnvironmentCollects();
      ul = mergeCollects(ul, uc);
    }
  }

  let hl: Collects = {};
  let old_host_list = Extension.HostState;
  if (old_host_list) {
    for (let host of old_host_list) {
      let h = new Host().init(host);
      hl = mergeCollects(hl, h.exportEnvironmentCollects());
    }
  }

  let collects = mergeCollects(ul, hl, default_collects);
  for (let key in collects) {
    logger.trace(
      `Setting environment variable into collections: ${key} => ${collects[key]}`
    );
    collection.replace(key, collects[key]);
  }
}

export async function ProcessMarkdownFileToWorkspaceState(file: vscode.Uri) {
  const content = await vscode.workspace.fs.readFile(file);

  let old_user_list = Extension.UserState;
  if (!old_user_list) {
    Extension.UserState = [];
  } else {
    old_user_list = mergeUserCredFromFile(content.toString(), old_user_list);
    logger.trace(`Merged user credentials from file: ${file.fsPath} `);
    Extension.UserState = old_user_list;
  }

  let old_host_list = Extension.HostState;
  if (!old_host_list) {
    Extension.HostState = [];
  } else {
    old_host_list = mergeHostFromFile(content.toString(), old_host_list);
    logger.trace(`Merged hosts from file: ${file.fsPath} `);
    Extension.HostState = old_host_list;
  }
}

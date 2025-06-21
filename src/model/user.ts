import { parse as yamlParse } from "yaml";

import { envVarSafer } from "./util";

const default_bad_nt_hash = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";

interface innerUserCredential {
  username: string;
  password: string;
  nt_hash: string;
  login: string;
  is_current: boolean;
  props: { [key: string]: string };
}

export function parseUserCredentialsYaml(content: string): UserCredential[] {
  let userContent = yamlParse(content) as innerUserCredential[];
  let ret: UserCredential[] = [];
  for (let user of userContent) {
    let newUser = new UserCredential();
    newUser.init(user.login, user.username, user.password, user.nt_hash, user.props);
    if (user.is_current) {
      newUser.setAsCurrent();
    }
    ret.push(newUser);
  }
  return ret;
}

export class UserCredential {
  username: string = "";
  password: string = "";
  nt_hash: string = default_bad_nt_hash;
  login: string = "";
  is_current: boolean = false;
  props: { [key: string]: string } = {};

  init(
    login: string,
    username: string,
    password?: string,
    nt_hash?: string,
    props: { [key: string]: string } = {}
  ) {
    this.username = username;
    if (password) {
      this.password = password;
    }
    if (nt_hash) {
      this.nt_hash = nt_hash;
    }
    this.login = login;
    this.props = props;
  }

  dumpUser(format?: "env" | "impacket" | "nxc"): string {
    let ret = "";
    switch (format) {
      default:
      case "env":
        let safename = envVarSafer(this.username);
        if (safename.length > 10) {
          safename = safename.substring(0, 10);
        }
        ret = `USER_${safename}="${this.username}"`;
        if (this.is_current) {
          ret = `${ret} USER=${this.username} USERNAME='${this.username}'`;
        }
        if (this.nt_hash === default_bad_nt_hash) {
          ret = `${ret} PASS_${safename}='${this.password}'`;
          if (this.is_current) {
            ret = `${ret} PASS='${this.password}' PASSWORD='${this.password}'`;
          }
        } else {
          ret = `${ret} NT_HASH_${safename}="${this.nt_hash}"`;
          if (this.is_current) {
            ret = `${ret} NT_HASH="${this.nt_hash}"`;
          }
        }
        break;
      case "impacket":
        if (this.login !== "" || this.login !== this.username) {
          // if login is empty or same as username
          ret = `${this.login}/`;
        }
        if (this.nt_hash === default_bad_nt_hash) {
          ret = `${ret}${this.username}:${this.password}`;
        } else {
          ret = `${ret}${this.username} -hashes :${this.nt_hash}`;
        }
        break;
      case "nxc":
        ret = `${this.login} -u ${this.username}`;
        if (this.nt_hash === default_bad_nt_hash) {
          ret = `${ret} -p ${this.password}`;
        } else {
          ret = `${ret} -H :${this.nt_hash}`;
        }
        break
    }
    return ret;
  }

  setAsCurrent() {
    this.is_current = true
  }
}

export function dumpUserCredentials(users: UserCredential[], format: "env"|"impacket"|"nxc"): string {
  let ret = "";
  for (let user of users) {
    ret += `${user.dumpUser(format)}\n`;
  }
  return ret;
}

function test() {
  let usera = new UserCredential();
  usera.init("github.com", "usera", "password")
  usera.setAsCurrent()
  console.log(  usera.dumpUser())
  let content = `
- login: github.com
  username: usera
  password: password
- login: data.github.com
  username: userax
  nt_hash: 0123456789ABCDEF0123456789ABCDEF
  is_current: true
`
  let users = parseUserCredentialsYaml(content);
  console.log(dumpUserCredentials(users, "nxc"));
}


(()=> { test() })();

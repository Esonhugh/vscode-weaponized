import { parse as yamlParse } from "yaml";

import { envVarSafer } from "./util";

const default_bad_nt_hash = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";

interface innerUserCredential {
  username?: string;
  password?: string;
  nt_hash?: string;
  login?: string;
  is_current?: boolean;
  props?: { [key: string]: string };
}

export function parseUserCredentialsYaml(content: string): UserCredential[] {
  let userContent = yamlParse(content) as innerUserCredential[];
  let ret: UserCredential[] = [];
  for (let user of userContent) {
    let newUser = new UserCredential().init(user);
    ret.push(newUser);
  }
  return ret;
}

export type UserDumpFormat = "env" | "impacket" | "nxc";

export class UserCredential {
  username: string = "";
  password: string = "";
  nt_hash: string = default_bad_nt_hash;
  login: string = "";
  is_current: boolean = false;
  props: { [key: string]: string } = {};

  init(iuser: innerUserCredential):UserCredential {
    this.username = iuser.username? iuser.username : ""
    if (iuser.password) {
      this.password = iuser.password;
    }
    if (iuser.nt_hash) {
      this.nt_hash = iuser.nt_hash;
    }
    this.login = iuser.login ? iuser.login : ""
    this.props = iuser.props ? iuser.props : {}
    this.is_current = iuser.is_current ? iuser.is_current : false
    return this
  }

  dumpUser(format?: UserDumpFormat): string {
    let ret = "";
    switch (format) {
      default:
      case "env":
        let safename = envVarSafer(this.username);
        if (safename.length > 10) {
          safename = safename.substring(0, 10);
        }
        ret = `export USER_${safename}="${this.username}"`;
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
        if (this.login && (this.login !== "" || this.login !== this.username )) {
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
        if (this.login && (this.login != "" || this.login !== this.username)) {
          ret = `${this.login} -u ${this.username}`;
        } else {
          ret = `-u ${this.username}`
        }
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

export function dumpUserCredentials(users: UserCredential[], format: UserDumpFormat): string {
  let ret = "";
  for (let u of users) {
    let user = new UserCredential().init(u)
    ret += `${user.dumpUser(format)}\n`;
  }
  return ret;
}

function test() {
  let usera = new UserCredential();
  usera.init({
    login:"github.com"
  })
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


// (()=> { test() })();

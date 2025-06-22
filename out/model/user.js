"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dumpUserCredentials = exports.UserCredential = exports.parseUserCredentialsYaml = void 0;
const yaml_1 = require("yaml");
const util_1 = require("./util");
const default_bad_nt_hash = "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
function parseUserCredentialsYaml(content) {
    let userContent = yaml_1.parse(content);
    let ret = [];
    for (let user of userContent) {
        let newUser = new UserCredential().init(user);
        ret.push(newUser);
    }
    return ret;
}
exports.parseUserCredentialsYaml = parseUserCredentialsYaml;
class UserCredential {
    constructor() {
        this.username = "";
        this.password = "";
        this.nt_hash = default_bad_nt_hash;
        this.login = "";
        this.is_current = false;
        this.props = {};
    }
    init(iuser) {
        this.username = iuser.username ? iuser.username : "";
        if (iuser.password) {
            this.password = iuser.password;
        }
        if (iuser.nt_hash) {
            this.nt_hash = iuser.nt_hash;
        }
        this.login = iuser.login ? iuser.login : "";
        this.props = iuser.props ? iuser.props : {};
        this.is_current = iuser.is_current ? iuser.is_current : false;
        return this;
    }
    dumpUser(format) {
        let ret = "";
        switch (format) {
            default:
            case "env":
                let safename = util_1.envVarSafer(this.username);
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
                }
                else {
                    ret = `${ret} NT_HASH_${safename}="${this.nt_hash}"`;
                    if (this.is_current) {
                        ret = `${ret} NT_HASH="${this.nt_hash}"`;
                    }
                }
                break;
            case "impacket":
                if (this.login && (this.login !== "" || this.login !== this.username)) {
                    // if login is empty or same as username
                    ret = `${this.login}/`;
                }
                if (this.nt_hash === default_bad_nt_hash) {
                    ret = `${ret}${this.username}:${this.password}`;
                }
                else {
                    ret = `${ret}${this.username} -hashes :${this.nt_hash}`;
                }
                break;
            case "nxc":
                if (this.login && (this.login != "" || this.login !== this.username)) {
                    ret = `${this.login} -u ${this.username}`;
                }
                else {
                    ret = `-u ${this.username}`;
                }
                if (this.nt_hash === default_bad_nt_hash) {
                    ret = `${ret} -p ${this.password}`;
                }
                else {
                    ret = `${ret} -H :${this.nt_hash}`;
                }
                break;
        }
        return ret;
    }
    setAsCurrent() {
        this.is_current = true;
    }
}
exports.UserCredential = UserCredential;
function dumpUserCredentials(users, format) {
    let ret = "";
    for (let u of users) {
        let user = new UserCredential().init(u);
        ret += `${user.dumpUser(format)}\n`;
    }
    return ret;
}
exports.dumpUserCredentials = dumpUserCredentials;
function test() {
    let usera = new UserCredential();
    usera.init({
        login: "github.com"
    });
    usera.setAsCurrent();
    console.log(usera.dumpUser());
    let content = `
- login: github.com
  username: usera
  password: password
- login: data.github.com
  username: userax
  nt_hash: 0123456789ABCDEF0123456789ABCDEF
  is_current: true
`;
    let users = parseUserCredentialsYaml(content);
    console.log(dumpUserCredentials(users, "nxc"));
}
// (()=> { test() })();
//# sourceMappingURL=user.js.map
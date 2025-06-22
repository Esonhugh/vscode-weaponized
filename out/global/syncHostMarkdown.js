"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessMarkdownFileToWorkspaceState = void 0;
const vscode = require("vscode");
const model_1 = require("../model");
const log_1 = require("./log");
function getCodeblock(content, identity) {
    let lines = content.split("\n");
    var inYaml = false;
    var currentYaml = "";
    let ret = [];
    for (var line of lines) {
        if (inYaml) {
            if (line.startsWith("```")) {
                log_1.logger.debug(`Found end of the yaml block`);
                inYaml = false;
                ret.push(currentYaml);
            }
            currentYaml += line + "\n";
        }
        if (line.startsWith("```yaml")) {
            if (line.includes(identity)) {
                inYaml = true;
                log_1.logger.debug(`Found start of yaml block for config type: ${identity}`);
            }
            continue;
        }
    }
    return ret;
}
function uniqueHosts(old_host) {
    let uniqmap = new Map();
    let newHost = [];
    for (let h of old_host) {
        if (uniqmap.has(h.hostname)) {
            continue;
        }
        newHost.push(h);
        uniqmap.set(h.hostname, 1);
    }
    return newHost;
}
function uniqueUsers(old_user) {
    let uniqmap = new Map();
    let newUser = [];
    for (let u of old_user) {
        if (uniqmap.has(`${u.login}/${u.username}`)) {
            continue;
        }
        newUser.push(u);
        uniqmap.set(`${u.login}/${u.username}`, 1);
    }
    return newUser;
}
function parseUserCredYamlCodeBlock(content, old_user_list) {
    let blocks = getCodeblock(content, "user");
    for (let b of blocks) {
        try {
            let users = model_1.parseUserCredentialsYaml(b);
            old_user_list.push(...users);
        }
        catch (e) {
            log_1.logger.error(`parse failed, content: ${b}`);
        }
    }
    return uniqueUsers(old_user_list);
}
function parseHostYamlCodeBlock(content, old_host_list) {
    let blocks = getCodeblock(content, "host");
    for (let b of blocks) {
        try {
            let hosts = model_1.parseHostsYaml(b);
            old_host_list.push(...hosts);
        }
        catch (e) {
            log_1.logger.error(`parse failed, content: ${b}`);
        }
    }
    return uniqueHosts(old_host_list);
}
function ProcessMarkdownFileToWorkspaceState(store, file) {
    return __awaiter(this, void 0, void 0, function* () {
        const content = yield vscode.workspace.fs.readFile(file);
        let old_user_list = store.get("users");
        if (!old_user_list) {
            store.update("users", []);
        }
        else {
            store.update("users", parseUserCredYamlCodeBlock(content.toString(), old_user_list));
        }
        let old_host_list = store.get("hosts");
        if (!old_host_list) {
            store.update("hosts", []);
        }
        else {
            store.update("hosts", parseHostYamlCodeBlock(content.toString(), old_host_list));
        }
    });
}
exports.ProcessMarkdownFileToWorkspaceState = ProcessMarkdownFileToWorkspaceState;
//# sourceMappingURL=syncHostMarkdown.js.map
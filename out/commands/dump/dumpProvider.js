"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DumpProvider = void 0;
const vscode = require("vscode");
const model_1 = require("../../model");
const log_1 = require("../../global/log");
function GenerateEnvExportCodeLens(configtype, config, yamlStartLine) {
    log_1.logger.debug(`Generating code lens for config type: ${configtype} with content: ${config}`);
    let codeLenses = [];
    let configs = "";
    try {
        if (configtype === "user") {
            configs = model_1.dumpUserCredentials(model_1.parseUserCredentialsYaml(config), "env");
        }
        else if (configtype === "host") {
            configs = model_1.dumpHosts(model_1.parseHostsYaml(config), "env");
        }
        else {
            new Error(`Unknown config type: ${configtype}. Expected 'user' or 'host'.`);
        }
    }
    catch (error) {
        log_1.logger.error(`Error parsing config: ${error}`);
        return codeLenses;
    }
    const cmd = {
        title: `export ${configtype} in terminal`,
        command: "weapon.run_command",
        arguments: [{ command: `${configs}` }],
    };
    codeLenses.push(new vscode.CodeLens(new vscode.Range(new vscode.Position(yamlStartLine, 0), new vscode.Position(yamlStartLine + 1, 0)), cmd));
    return codeLenses;
}
function GenerateUserCredCodeLens(config, format, yamlStartLine) {
    log_1.logger.debug(`Generating code lens for user credentials with content: ${config}`);
    let codeLenses = [];
    const Users = model_1.parseUserCredentialsYaml(config);
    if (Users.length === 0) {
        log_1.logger.warn("No user credentials found in the provided YAML.");
        return codeLenses;
    }
    const cmd = {
        title: `show as ${format} param`,
        command: "weapon.display_virtual_content",
        arguments: [{ content: model_1.dumpUserCredentials(Users, format) }],
    };
    codeLenses.push(new vscode.CodeLens(new vscode.Range(new vscode.Position(yamlStartLine, 0), new vscode.Position(yamlStartLine + 1, 0)), cmd));
    return codeLenses;
}
class DumpProvider {
    provideCodeLenses(document, token) {
        var codeLenses = [];
        const lines = document.getText().split("\n");
        var inYaml = false;
        var configtype = undefined;
        var currentYaml = "";
        var yamlStartLine = 0;
        for (var i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (inYaml && configtype) {
                if (line === "```") {
                    log_1.logger.debug(`Found end of yaml block at line ${i}`);
                    codeLenses.push(...GenerateEnvExportCodeLens(configtype, currentYaml, yamlStartLine));
                    if (configtype == "user") {
                        for (let fmt of ["impacket", "nxc"]) {
                            var format = fmt;
                            codeLenses.push(...GenerateUserCredCodeLens(currentYaml, format, yamlStartLine));
                        }
                    }
                    inYaml = false;
                    currentYaml = "";
                    continue;
                }
                currentYaml += line + "\n";
                continue;
            }
            if (line.startsWith("```yaml")) {
                inYaml = true;
                yamlStartLine = i;
                if (line.includes("user")) {
                    configtype = "user";
                }
                else if (line.includes("host")) {
                    configtype = "host";
                }
                else {
                    configtype = undefined;
                    inYaml = false;
                }
                log_1.logger.debug(`Found start of yaml block at line ${i} for config type: ${configtype}`);
                continue;
            }
        }
        return codeLenses;
    }
}
exports.DumpProvider = DumpProvider;
//# sourceMappingURL=dumpProvider.js.map
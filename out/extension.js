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
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const log_1 = require("./global/log");
const syncHostMarkdown_1 = require("./global/syncHostMarkdown");
const commands_1 = require("./commands");
const dumpProvider_1 = require("./commands/dump/dumpProvider");
const readonlyDisplay_1 = require("./commands/utilcommand/readonlyDisplay");
const dumphost_1 = require("./commands/dumphosts/dumphost");
const targetFilePattern = "**/{users,hosts,services}/*/*.md";
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Congratulations, your extension "vscode weaponized" is now active!');
        if (!vscode.workspace.workspaceFolders ||
            vscode.workspace.workspaceFolders.length === 0) {
            vscode.window.showErrorMessage("Please open a workspace folder to use this extension.");
            return;
        }
        log_1.logger.info("Activating vscode weaponized extension...");
        let filewatcher = vscode.workspace.createFileSystemWatcher(targetFilePattern);
        filewatcher.onDidChange((e) => { });
        let files = yield vscode.workspace.findFiles(targetFilePattern);
        for (const file of files) {
            log_1.logger.info(`Processing file: ${file.fsPath}`);
            yield syncHostMarkdown_1.ProcessMarkdownFileToWorkspaceState(context.workspaceState, file);
        }
        context.subscriptions.push(vscode.commands.registerCommand("weapon.dump_hosts", dumphost_1.dumpetchosts(context.workspaceState)), vscode.commands.registerCommand("weapon.run_command", commands_1.runCommand), vscode.commands.registerCommand("weapon.display_virtual_content", readonlyDisplay_1.displayVirtualContent), vscode.languages.registerCodeLensProvider({ language: "markdown", scheme: "file", pattern: targetFilePattern }, new commands_1.CommandCodeLensProvider()), vscode.languages.registerCodeLensProvider({ language: "markdown", scheme: "file", pattern: targetFilePattern }, new dumpProvider_1.DumpProvider()), vscode.workspace.registerTextDocumentContentProvider("weaponized-editor", new readonlyDisplay_1.ReadOnlyProvider()));
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
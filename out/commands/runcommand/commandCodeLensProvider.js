"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandCodeLensProvider = void 0;
const vscode = require("vscode");
class CommandCodeLensProvider {
    provideCodeLenses(document, token) {
        var codeLenses = [];
        const lines = document.getText().split('\n');
        var inCommand = false;
        var currentCommand = '';
        var commandStartLine = 0;
        for (var i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (inCommand) {
                if (line === '```') {
                    const cmd = {
                        title: 'Run command in terminal',
                        command: 'weapon.run_command',
                        arguments: [{ command: currentCommand }]
                    };
                    codeLenses.push(new vscode.CodeLens(new vscode.Range(new vscode.Position(commandStartLine, 0), new vscode.Position(commandStartLine + 1, 0)), cmd));
                    inCommand = false;
                    currentCommand = '';
                    continue;
                }
                currentCommand += line + '\n';
                continue;
            }
            if (line.startsWith('```zsh') || line.startsWith('```bash') || line.startsWith('```sh')) {
                inCommand = true;
                commandStartLine = i;
                continue;
            }
        }
        return codeLenses;
    }
    resolveCodeLens(codeLens, token) {
        return null;
    }
}
exports.CommandCodeLensProvider = CommandCodeLensProvider;
//# sourceMappingURL=commandCodeLensProvider.js.map
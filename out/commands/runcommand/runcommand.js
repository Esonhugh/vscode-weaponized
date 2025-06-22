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
exports.runCommand = void 0;
const vscode = require("vscode");
const cp = require("child_process");
exports.runCommand = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var term = vscode.window.activeTerminal || vscode.window.createTerminal();
    // check if there's a running command in the active terminal, if there is one
    // create a new term
    term.processId.then((pid) => {
        cp.exec("ps -o state= -p " + pid, (error, stdout, stderr) => {
            if (error) {
                // if we can't check just send to the current one...
                term.show();
                term.sendText(args.command);
                return;
            }
            // a + in the state indicates a process running in foreground
            if (!stdout.includes("+")) {
                term = vscode.window.createTerminal();
            }
            term.show();
            term.sendText(args.command);
        });
    });
});
//# sourceMappingURL=runcommand.js.map
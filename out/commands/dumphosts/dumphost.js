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
exports.dumpetchosts = void 0;
const vscode = require("vscode");
const model_1 = require("../../model");
exports.dumpetchosts = (store) => {
    return () => __awaiter(void 0, void 0, void 0, function* () {
        let hosts = store.get('hosts');
        if (!hosts) {
            return;
        }
        yield vscode.commands.executeCommand("weapon.display_virtual_content", {
            content: model_1.dumpHosts(hosts, "file")
        });
    });
};
//# sourceMappingURL=dumphost.js.map
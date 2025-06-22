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
exports.displayVirtualContent = exports.ReadOnlyProvider = void 0;
const vscode = require("vscode");
exports.ReadOnlyProvider = class {
    provideTextDocumentContent(uri) {
        return uri.path;
    }
};
exports.displayVirtualContent = (args) => __awaiter(void 0, void 0, void 0, function* () {
    let content = "";
    if (!args || !args.content) {
        content = "testcontent";
    }
    else {
        content = args.content;
    }
    let uri = vscode.Uri.parse("weaponized-editor:" + content);
    let doc = yield vscode.workspace.openTextDocument(uri);
    yield vscode.window.showTextDocument(doc, { preview: false });
});
//# sourceMappingURL=readonlyDisplay.js.map
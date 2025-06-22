"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envVarSafer = void 0;
exports.envVarSafer = (variable) => {
    // Replace any non-alphanumeric characters with underscores
    return variable.replace(/[^a-zA-Z0-9_]/g, '_');
};
//# sourceMappingURL=util.js.map
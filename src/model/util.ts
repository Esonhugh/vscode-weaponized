export const envVarSafer = (variable: string): string => {
    // Replace any non-alphanumeric characters with underscores
    return variable.replace(/[^a-zA-Z0-9_]/g, '_');
};

export type Collects = { [key: string]: string };

export type ConfigType = "host" | "user";

import * as vscode from "vscode";

export function setEnvironment(collection: vscode.EnvironmentVariableCollection,variable: string, value: string): void {
    // Set the environment variable in the collection
    if (collection === undefined) {
        throw new Error("Environment variable collection is undefined");
    }
    collection.append(variable, value, { applyAtShellIntegration: true });
}
export const envVarSafer = (variable: string): string => {
    // Replace any non-alphanumeric characters with underscores
    return variable.replace(/[^a-zA-Z0-9_]/g, '_');
}

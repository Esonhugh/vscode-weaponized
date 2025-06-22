import * as vscode from "vscode";
import {
  parseHostsYaml,
  parseUserCredentialsYaml,
  dumpHosts,
  dumpUserCredentials,
  UserDumpFormat,
} from "../../model";
import { logger } from "../../global/log";
import { ConfigType } from "../../model";

function GenerateEnvExportCodeLens(
  configtype: ConfigType,
  config: string,
  yamlStartLine: number
): vscode.CodeLens[] {
  logger.debug(
    `Generating code lens for config type: ${configtype} with content: ${config}`
  );
  let codeLenses: vscode.CodeLens[] = [];

  let configs: string = "";
  try {
    if (configtype === "user") {
      configs = dumpUserCredentials(parseUserCredentialsYaml(config), "env");
    } else if (configtype === "host") {
      configs = dumpHosts(parseHostsYaml(config), "env");
    } else {
      new Error(
        `Unknown config type: ${configtype}. Expected 'user' or 'host'.`
      );
    }
  } catch (error) {
    logger.error(`Error parsing config: ${error}`);
    return codeLenses;
  }

  const cmd: vscode.Command = {
    title: `export ${configtype} in terminal`,
    command: "weapon.run_command",
    arguments: [{ command: `${configs}` }],
  };

  codeLenses.push(
    new vscode.CodeLens(
      new vscode.Range(
        new vscode.Position(yamlStartLine, 0),
        new vscode.Position(yamlStartLine + 1, 0)
      ),
      cmd
    )
  );

  return codeLenses;
}

function GenerateUserCredCodeLens(
  config: string,
  format: UserDumpFormat,
  yamlStartLine: number
): vscode.CodeLens[] {
  logger.debug(`Generating code lens for user credentials with content: ${config}`);
  let codeLenses: vscode.CodeLens[] = [];
  const Users = parseUserCredentialsYaml(config);
  if (Users.length === 0) {
    logger.warn("No user credentials found in the provided YAML.");
    return codeLenses;
  }

  const cmd: vscode.Command = {
    title: `show as ${format} param`,
    command: "weapon.display_virtual_content",
    arguments: [{ content: dumpUserCredentials(Users, format) }],
  };

  codeLenses.push(
    new vscode.CodeLens(
      new vscode.Range(
        new vscode.Position(yamlStartLine, 0),
        new vscode.Position(yamlStartLine + 1, 0)
      ),
      cmd
    )
  );

  return codeLenses;
}

export class DumpProvider implements vscode.CodeLensProvider {
  provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    var codeLenses = [];
    const lines = document.getText().split("\n");

    var inYaml = false;
    var configtype: ConfigType | undefined = undefined;

    var currentYaml = "";
    var yamlStartLine = 0;

    for (var i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (inYaml && configtype) {
        if (line === "```") {
          logger.debug(`Found end of yaml block at line ${i}`);

          codeLenses.push(
            ...GenerateEnvExportCodeLens(configtype, currentYaml, yamlStartLine),
          );
          if (configtype == "user") {
            for (let fmt of ["impacket", "nxc"]) {
              var format = fmt as UserDumpFormat
              codeLenses.push(...GenerateUserCredCodeLens(currentYaml, format, yamlStartLine))
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
        } else if (line.includes("host")) {
          configtype = "host";
        } else {
          configtype = undefined;
          inYaml = false;
        }
        logger.debug(
          `Found start of yaml block at line ${i} for config type: ${configtype}`
        );
        continue;
      }
    }
    return codeLenses;
  }
}

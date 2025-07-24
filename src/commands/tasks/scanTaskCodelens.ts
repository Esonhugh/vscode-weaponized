import * as vscode from 'vscode';
import { MarkdownCodeLensGenerator } from '../utils';
import { parseHostsYaml } from '../../model';

export const GenerateScanTaskCodeLens: MarkdownCodeLensGenerator = (
  configtype,
  config,
  startLine
) => {
  let codeLenses: vscode.CodeLens[] = [];
  if (configtype !== 'host') {
    return codeLenses; // Only generate for host type
  }

  let Hosts = parseHostsYaml(config);

  const cmd: vscode.Command = {
    title: `Scan host`,
    command: 'weapon.task.scan',
    arguments: [{ hosts: Hosts }],
  };

  codeLenses.push(
    new vscode.CodeLens(
      new vscode.Range(
        new vscode.Position(startLine, 0),
        new vscode.Position(startLine + 1, 0)
      ),
      cmd
    )
  );

  return codeLenses;
};


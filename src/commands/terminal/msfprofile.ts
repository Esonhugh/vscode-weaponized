import * as vscode from 'vscode';
import { logger } from '../../global/log';

export class MeterpreterWeaponizedTerminalProvider implements vscode.TerminalProfileProvider {
  provideTerminalProfile(token: vscode.CancellationToken): vscode.ProviderResult<vscode.TerminalProfile> {
    let msfconsolePath = vscode.workspace.getConfiguration("weaponized").get<string>("msf.console");
    if (!msfconsolePath) {
      vscode.window.showErrorMessage("Please set the 'weaponized.msfconsolePath' configuration in settings.");
      return undefined;
    }
    let args: string[] = [
      "-q", // quiet mode
    ];
    let resourceFile = vscode.workspace.getConfiguration("weaponized").get<string>("msf.resourcefile");
    if (resourceFile) {
      args.push(`-r`);
      args.push(resourceFile);
    }
    args.push("-x");
    args.push(`setg LHOST=${vscode.workspace.getConfiguration("weaponized").get("lhost", "$LHOST")};` + `setg LPORT=${vscode.workspace.getConfiguration("weaponized").get("lport", "$LPORT")};`);
    logger.debug(`Starting Meterpreter session with args: ${JSON.stringify(args)}`);
    return {
      options: {
        "name": "Meterpreter",
        "shellPath": msfconsolePath,
        "shellArgs": args,
        "hideFromUser": false
      }
    };
  }
}
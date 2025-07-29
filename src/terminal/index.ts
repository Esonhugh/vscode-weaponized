import {
  MeterpreterWeaponizedTerminalProvider,
  NetcatWeaponizedTerminalProvider,
  WebDeliveryWeaponizedTerminalProvider,
} from "./profiles";
import {
  activate,
  startTempTerminalRecord,
  stopTempTerminalForCapture,
} from "./recorder";
import * as vscode from "vscode";

export function registerTerminalUtils(context: vscode.ExtensionContext) {
  activate();
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "weaponized.terminal-logger.register",
      startTempTerminalRecord
    ),
    vscode.commands.registerCommand(
      "weaponized.terminal-logger.unregister",
      stopTempTerminalForCapture
    ),
    vscode.window.registerTerminalProfileProvider(
      "weaponized.meterpreter-handler",
      new MeterpreterWeaponizedTerminalProvider()
    ),
    vscode.window.registerTerminalProfileProvider(
      "weaponized.netcat-handler",
      new NetcatWeaponizedTerminalProvider()
    ),
    vscode.window.registerTerminalProfileProvider(
      "weaponized.web-delivery",
      new WebDeliveryWeaponizedTerminalProvider()
    )
  );
}

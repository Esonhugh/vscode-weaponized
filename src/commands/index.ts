import * as vscode from "vscode";
import { dumpetchosts } from "./dump/dumphost";
import { dumpalluser } from "./dump/dumpuser";
import { runCommand } from "./runcommand/runcommand";
import { displayVirtualContent } from "./utilcommand/readonlyDisplay";
import { CommandCodeLensProvider } from "./runcommand/commandCodeLensProvider";
import { ReadOnlyProvider } from "./utilcommand/readonlyDisplay";
import { targetFilePattern } from "../global/const";
import { replacer } from "./utilcommand/replacer";
import { NoteCreationProvider } from "./newnote/noteProvider";
import {
  MeterpreterWeaponizedTerminalProvider,
  NetcatWeaponizedTerminalProvider,
  WebDeliveryWeaponizedTerminalProvider,
} from "./terminal";
import { hashcatCracker, msfvenomPayloadCreation, scanCommand } from "./tasks";
import { setupCommand } from "./setup/setup";
import { switchActiveHost } from "./switch/host";
import { switchActiveUser } from "./switch/user";
import { MarkdownCodeLensProvider } from "./utils";
import { GenerateScanTaskCodeLens } from "./tasks/scanTaskCodelens";
import { GenerateEnvExportCodeLens, GenerateDumpUserCredCodeLens, GenerateSetAsCurrentCodeLens } from "./dump/dumpProvider";

export function registerCommandsPackage(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("weapon.dump_hosts", dumpetchosts),
    vscode.commands.registerCommand("weapon.dump_users", dumpalluser),
    vscode.commands.registerCommand("weapon.switch_host", switchActiveHost),
    vscode.commands.registerCommand("weapon.switch_user", switchActiveUser),
    vscode.commands.registerCommand(
      "weapon.display_virtual_content",
      displayVirtualContent
    ),
    vscode.commands.registerCommand("weapon.run_command", runCommand),
    vscode.commands.registerCommand("weapon.replace_document", replacer),
    vscode.commands.registerCommand("weapon.task.msfvenom_creation", msfvenomPayloadCreation),
    vscode.commands.registerCommand("weapon.task.hashcat_cracker", hashcatCracker),
    vscode.commands.registerCommand("weapon.task.scan", scanCommand),
    vscode.commands.registerCommand("weapon.setup", setupCommand),
    vscode.languages.registerCodeLensProvider(
      { language: "markdown", scheme: "file", pattern: targetFilePattern },
      new CommandCodeLensProvider()
    ),
    vscode.languages.registerCodeLensProvider(
      { language: "markdown", scheme: "file", pattern: targetFilePattern },
      new MarkdownCodeLensProvider(
        GenerateEnvExportCodeLens,
        GenerateDumpUserCredCodeLens,
        GenerateScanTaskCodeLens,
        GenerateSetAsCurrentCodeLens
      )
    ),
    vscode.languages.registerCodeLensProvider(
      { language: "markdown", scheme: "file", pattern: targetFilePattern },
      new NoteCreationProvider()
    ),
    vscode.workspace.registerTextDocumentContentProvider(
      "weaponized-editor",
      new ReadOnlyProvider()
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

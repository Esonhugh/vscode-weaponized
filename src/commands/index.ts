import * as vscode from "vscode";
import { dumpetchosts } from "./dump/dumphost";
import { dumpalluser } from "./dump/dumpuser";
import { runCommand } from "./runcommand/runcommand";
import { displayVirtualContent } from "./utilcommand/readonlyDisplay";
import { ReadOnlyProvider } from "./utilcommand/readonlyDisplay";
import { replacer } from "./utilcommand/replacer";
import { hashcatCracker, msfvenomPayloadCreation, scanCommand } from "./tasks";
import { setupCommand } from "./setup/setup";
import { switchActiveHost } from "./switch/host";
import { switchActiveUser } from "./switch/user";
import { cyberChefMagicDecoder } from "./decoder/cyberchef";
import { copyCommand } from "./copy/copy";

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
    vscode.commands.registerCommand(
      "weapon.magic_decoder",
      cyberChefMagicDecoder
    ),
    vscode.commands.registerCommand("weapon.run_command", runCommand),
    vscode.commands.registerCommand("weapon.copy", copyCommand), // Reusing runCommand for copy functionality
    vscode.commands.registerCommand("weapon.replace_document", replacer),
    vscode.commands.registerCommand(
      "weapon.task.msfvenom_creation",
      msfvenomPayloadCreation
    ),
    vscode.commands.registerCommand(
      "weapon.task.hashcat_cracker",
      hashcatCracker
    ),
    vscode.commands.registerCommand("weapon.task.scan", scanCommand),
    vscode.commands.registerCommand("weapon.setup", setupCommand),
    vscode.workspace.registerTextDocumentContentProvider(
      "weaponized-editor",
      new ReadOnlyProvider()
    )
  );
}

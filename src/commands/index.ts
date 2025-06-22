import * as vscode from "vscode";
import { dumpetchosts } from "./dump/dumphost";
import { dumpalluser } from "./dump/dumpuser";
import { runCommand } from "./runcommand/runcommand";
import { displayVirtualContent } from "./utilcommand/readonlyDisplay";
import { WeaponTaskProvider } from "./tasks/task";
import { CommandCodeLensProvider } from "./runcommand/commandCodeLensProvider";
import { DumpProvider } from "./dump/dumpProvider";
import { ReadOnlyProvider } from "./utilcommand/readonlyDisplay";
import { targetFilePattern } from "../global/const";

export function registerCommandsPackage(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.tasks.registerTaskProvider("weapon", new WeaponTaskProvider()),
    vscode.commands.registerCommand("weapon.dump_hosts", dumpetchosts),
    vscode.commands.registerCommand("weapon.dump_users", dumpalluser),
    vscode.commands.registerCommand("weapon.run_command", runCommand),
    vscode.commands.registerCommand(
      "weapon.display_virtual_content",
      displayVirtualContent
    ),
    vscode.languages.registerCodeLensProvider(
      { language: "markdown", scheme: "file", pattern: targetFilePattern },
      new CommandCodeLensProvider()
    ),
    vscode.languages.registerCodeLensProvider(
      { language: "markdown", scheme: "file", pattern: targetFilePattern },
      new DumpProvider()
    ),
    vscode.workspace.registerTextDocumentContentProvider(
      "weaponized-editor",
      new ReadOnlyProvider()
    )
  );
}

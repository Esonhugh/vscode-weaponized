import * as vscode from "vscode";
import * as cp from "child_process";
import { logger } from "../../global/log";
import { callback } from "../utilcommand/utils";
import { Context } from "../../global/context";
import {
  dumpUserCredentials,
  parseUserCredentialsYaml,
  UserCredential,
} from "../../model";
import { getCodeblock } from "../../variableProcessor/syncHostMarkdown";

export const switchActiveUser: callback = async (args) => {
  let user: UserCredential | undefined = args?.user;
  if (!user) {
    let userList = Context.UserState;
    if (!userList || userList.length === 0) {
      vscode.window.showErrorMessage("No users found to switch.");
      return;
    }

    let userOptions = userList.map((u) => `${u.login}/${u.user}`);
    var userString = await vscode.window.showQuickPick(userOptions, {
      placeHolder: "Select a user to switch",
    });
    if (!userString) {
      vscode.window.showErrorMessage("No user selected. Operation cancelled.");
      return;
    }
    user = userList.find((u) => `${u.login}/${u.user}` === userString);
    if (!user) {
      vscode.window.showErrorMessage("Selected user not found in user list.");
      return;
    }
  }

  let files = await vscode.workspace.findFiles(`**/*.md`);
  if (files.length === 0) {
    vscode.window.showInformationMessage("No markdown files found.");
    return;
  }

  for (const file of files) {
    try {
      logger.info(`trying to set user active in file: ${file.fsPath}`);
      await setUserActive(file, user);
    } catch (error) {
      logger.error(`Error setting user active in file: ${file.fsPath}`, error);
      vscode.window.showErrorMessage(
        `Failed to set user active in file: ${file.fsPath}`
      );
    }
  }
};

async function setUserActive(file: vscode.Uri, user: UserCredential) {
  let content = await vscode.workspace.fs.readFile(file);
  let contentString = content.toString();
  let userBlock = getCodeblock(contentString, "credentials");
  if (!userBlock) {
    logger.error(`No user block found in file: ${file.fsPath}`);
    logger.info(`Updated user block in file: ${file.fsPath}`);
    return;
  }
  try {
    for (let block of userBlock) {
      let userCreds = parseUserCredentialsYaml(block);
      for (let i in userCreds) {
        if (userCreds[i].login === user.login && userCreds[i].user === user.user) {
          // Set this user as active
          userCreds[i].is_current = true;
          logger.info(
            `Set user ${userCreds[i].login}/${userCreds[i].user} as active in file: ${file.fsPath}`
          );
        } else {
          // Set other users as inactive
          userCreds[i].is_current = false;
          logger.info(
            `Set user ${userCreds[i].login}/${userCreds[i].user} as inactive in file: ${file.fsPath}`
          );
        }
      }
      // Write back the updated user block to the file
      contentString = contentString.replace(
        block,
        dumpUserCredentials(userCreds, "yaml")
      );
      logger.info(`Updated user block in file: ${file.fsPath}`);
    }
    logger.info(`Writing updated content to file: ${file.fsPath}`);
    await vscode.workspace.fs.writeFile(file, Buffer.from(contentString));
  } catch (error) {
    logger.error(`Error setting user active in file: ${file.fsPath}`, error);
  }
}

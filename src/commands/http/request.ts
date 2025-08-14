import { callback } from "../utils";
import { parseRequest, ParseRequestResult } from "http-string-parser";
import * as vscode from "vscode";
import { logger } from "../../global/log";

export const rawHTTPRequest: callback = async (args) => {
  let request: string | undefined = args.request ? args.request : undefined;
  if (!request) {
    vscode.window.showErrorMessage("No request provided");
    return;
  }
  let isHTTPS = args.isHTTPS ? args.isHTTPS : false;

  let res: ParseRequestResult;
  try {
    res = parseRequest(request);
    if (!res) {
      logger.error("Failed to parse request", request);
      vscode.window.showErrorMessage("Invalid request format");
      return;
    }
  } catch (e: any) {
    logger.error("raise Error parsing request", e);
    vscode.window.showErrorMessage(`Error parsing request: ${e.message}`);
    return;
  }
  try {
    const { method, uri, headers, body } = res;
    var url = headers["Host"]
      ? `${isHTTPS ? "https" : "http"}://${headers["Host"]}${uri}`
      : uri;
    logger.debug(
      `sending request: ${method} ${url}, headers: ${JSON.stringify(
        headers
      )}, body: ${body ? body : "none"}`
    );
    let response: Response | undefined = undefined;
    if (method === "GET" || method === "HEAD") {
      // For GET and HEAD requests, we should not send a body
      response = await fetch(url, {
        method,
        headers,
      });
    } else {
      response = await fetch(url, {
        method,
        headers,
        body,
      });
    }
    let responseText: string = `HTTP/1.1 ${response.status} ${response.statusText}\n`;
    for (const [key, value] of response.headers.entries()) {
      responseText += `${key}: ${value}\n`;
    }
    responseText += "\n" + (await response.text());

    await vscode.window.showTextDocument(
      vscode.Uri.parse(
        "weaponized-editor:response.http?" + encodeURIComponent(responseText)
      ),
      {
        preview: false,
        viewColumn: vscode.ViewColumn.Beside,
      }
    );
  } catch (e: any) {
    logger.error("raise Error fetching request", e);
    vscode.window.showErrorMessage(`Error fetching request: ${e.message}`);
    return;
  }
};

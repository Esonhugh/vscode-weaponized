import * as vscode from 'vscode';
import { dumpHosts, Host } from '../../model';

type callback = (...args: any[]) => any

export const dumpetchosts = (store: vscode.Memento): callback => {
  return async () => {
    let hosts  = store.get<Host[]>('hosts')
    if (!hosts){
      return 
    }
    await vscode.commands.executeCommand("weapon.display_virtual_content", {
      content: dumpHosts(hosts, "file")
    })
  }
}
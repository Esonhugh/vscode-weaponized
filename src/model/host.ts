import * as vscode from "vscode";

import { parse as yamlParse } from "yaml";

import { envVarSafer, setEnvironment } from "./util";

interface innerHost {
  hostname?: string;
  ip?: string;
  alias?: string[];
  is_dc?: boolean;
  is_current?: boolean;
  is_current_dc?: boolean;
  props?: { [key: string]: string };
}

export function parseHostsYaml(content: string): Host[] {
  let hostContent = yamlParse(content) as innerHost[];
  let ret: Host[] = [];
  for (let host of hostContent) {
    let newHost = new Host().init(host);
    ret.push(newHost);
  }
  return ret;
}

export type HostDumpFormat = "env" | "file";

export class Host {
  hostname: string = "";
  ip: string = "";
  alias: string[] = [this.hostname];
  is_dc: boolean = false;
  is_current: boolean = false;
  is_current_dc: boolean = false;
  props: { [key: string]: string } = {};

  init(ihost: innerHost):Host {
    this.hostname = ihost.hostname ? ihost.hostname : "";
    this.ip = ihost.ip ? ihost.ip : "";
    if (ihost.alias) {
      this.alias = [...new Set(ihost.alias?.concat(this.hostname))];
    } else {
      this.alias = [this.hostname];
    }
    this.is_dc = ihost.is_dc ? ihost.is_dc : false;
    this.props = ihost.props ? ihost.props : {};
    this.is_current = ihost.is_current ? ihost.is_current : false;
    this.is_current_dc = ihost.is_current_dc ? ihost.is_current_dc : false;
    this.is_dc = ihost.is_dc ? ihost.is_dc : false;
    return this
  }

  setEnvironmentCollection(collection: vscode.EnvironmentVariableCollection): void {
    let safename = envVarSafer(this.hostname);
    
    setEnvironment(collection, `HOST_${safename}`, this.hostname);
    setEnvironment(collection, `IP_${safename}`, this.ip);
    if (this.is_dc) {
      setEnvironment(collection, `DC_HOST_${safename}`, this.alias[0]);
      setEnvironment(collection, `DC_IP_${safename}`, this.ip);
    }
    if (this.is_current_dc) {
      setEnvironment(collection, `DC_HOST`, this.alias[0]);
      setEnvironment(collection, `DC_IP`, this.ip);
    }
    if (this.is_current) {
      setEnvironment(collection, `HOST`, this.hostname);
      setEnvironment(collection, `DOMAIN`, this.hostname);
      setEnvironment(collection, `RHOST`, this.ip);
      setEnvironment(collection, `IP`, this.ip);
      setEnvironment(collection, `TARGET`, this.hostname);
    }
    for (let key in this.props) {
      setEnvironment(collection, `${envVarSafer(key)}`, this.props[key]);
    }
  };

  dump(format: HostDumpFormat): string {
    let ret = "";
    switch (format) {
      default:
      case "env":
        let safename = envVarSafer(this.hostname);
        ret = `export HOST_${safename}=${this.hostname} IP_${safename}=${this.ip}`;
        if (this.is_dc) {
          ret = `${ret} DC_HOST_${safename}=${this.alias[0]} DC_IP_${safename}=${this.ip}`;
        }

        if (this.is_current_dc) {
          ret = `${ret} DC_HOST=${this.alias[0]} DC_IP=${this.ip}`;
        }
        if (this.is_current) {
          ret = `${ret} HOST=${this.hostname} DOMAIN=${this.hostname} RHOST=${this.ip} IP=${this.ip} TARGET=${this.hostname}`;
        }

        break;
      case "file":
        ret = `${this.ip}\t${this.alias.join(" ")}`;
        break;
    }
    return ret;
  }

  setAsCurrent(): Host {
    this.is_current = true;
    return this
  }

  setAsCurrentDC():Host{
    this.is_current_dc = true;
    return this
  }
}

export function dumpHosts(hosts: Host[], format: HostDumpFormat): string {
  let ret = "";
  for (let h of hosts) {
    var host = new Host();
    host.init(h);
    ret += `${host.dump(format)}\n`;
  }
  return ret;
}

function test() {
  let hosta = new Host();
  hosta.init({
    hostname: "github.com",
  });
  hosta.setAsCurrent();
  hosta.setAsCurrentDC();
  console.log(hosta.alias);
  console.log(hosta.dump("env"));
  let content = `
- hostname: github.com
  ip: 10.10.10.1
  aliases:
  - dc01.github.com
  - dc02.github.com
  is_dc: true
  is_current: true
  is_current_dc: true
- hostname: data.github.com
  ip: 10.10.10.2
  aliases:
    - data1.github.com
    - data2.github.com
    - test-data.github.com
  `;
  let hosts = parseHostsYaml(content);
  console.log(dumpHosts(hosts, "env"));
}

//(() => {
//  test();
//})();

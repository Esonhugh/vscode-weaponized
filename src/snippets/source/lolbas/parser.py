# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "pyyaml",
# ]
# ///

import os
import sys
import yaml 
import json


def walk_over_yml_file(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.yml'):
                yield os.path.join(root, file)

def generate_snippet(command, script, usecase, description):
    note_desc = description.split("\n")
    
    return {
        f"{command} {usecase} (lolbas)": {
            "prefix": command + " " + usecase,
            "body": [
                *note_desc,
                "",
                "```sh",
                f"{script}${{0}}",
                "```"
            ],
            "description": description,
        }
    }

def main() -> None:
    output = open('./lolbas.json', 'w')
    output_json = {}
    for file in walk_over_yml_file('./docs/yml'):
        print(f"Processing file: {file}")
        with open(file, 'r') as f:
            content = f.read()
            yaml_data = yaml.load(content, Loader=yaml.FullLoader)
            print(yaml_data)
            bin = yaml_data.get('Name', '')
            bin_desc = yaml_data.get('Description', '')
            for command in yaml_data.get('Commands', []):
                code = command.get('Command', '')
                desc = command.get('Description', '')
                usecase = command.get('Usecase', '')
                priv = command.get('Privilege', '')
                category = command.get('Category', '')

                final_desc = f"{bin} is {bin_desc}. it can {desc}, requires {priv} privilege, category: {category}, it can be used for {usecase}."
                output_json |= generate_snippet(
                    bin,
                    code,
                    usecase,
                    final_desc
                )
    output.write(json.dumps(output_json, indent=4))
    output.close()
    print(f"Generated lolbas.json with {len(output_json)} entries.")

if __name__ == "__main__":
    main()

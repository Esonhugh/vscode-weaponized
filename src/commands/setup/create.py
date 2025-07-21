import os
import json
import base64

def read_file_return_base64ed_content(filename):
    data = ""
    with open(filename, 'r') as f:
        data = f.read()
    return base64.b64encode(data.encode('utf-8')).decode('utf-8')

def create_value_map(filepath:str):
    variable_file_content_map = {}
    files = os.listdir(filepath)
    for file in files:
        if file in ["create.py", "setup.ts", "assets.ts"]:
            continue
        curr_file = os.path.join(filepath, file)
        if os.path.isfile(curr_file):
            variable_file_content_map[curr_file] = read_file_return_base64ed_content(curr_file)
        if os.path.isdir(curr_file):
            variable_file_content_map.update(create_value_map(curr_file))
    return variable_file_content_map

def main():
    filepath = "."
    value_map = create_value_map(filepath)
    print("export let fs = {")
    for key, value in value_map.items():
        print(f'\t"{key}": atob("{value}"),')
    print("};")


if __name__ == "__main__":
    main()
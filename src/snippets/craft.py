# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///

import os
import json



def main():
    output = open('./markdown.code-snippets', 'w')
    output_json = {}
    for dir in os.listdir('./source'):
        if dir == '.gitignore' or dir == 'README.md':
            continue
        file = os.path.join('./source', dir, dir + ".json")
        print(f"Processing file: {file}")
        with open(file, 'r') as f:
            data = json.load(f)
            print(f"Loaded {len(data)} entries from {file}")
            output_json |= data
    output.write(json.dumps(output_json, indent=4))
    output.close()
    print(f"Generated markdown.code-snippets with {len(output_json)} entries.")

    
if __name__ == "__main__":
    main()
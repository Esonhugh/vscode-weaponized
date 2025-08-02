# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///

import os
import json
import sys



def get_html_like_content(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.readlines()
        start = 0
        end = 0
        for i in range(len(content)):
            line = content[i]
            if "return (" in line:
                start = i + 1
            if "<>" in line:
                start = i + 1
            if "</>" in line:
                end = i
            if ");" in line and end == 0:
                end = i
        return "".join(content[start:end])

def parse_file(file_path, platform, EdgeType):
    html_like_content = get_html_like_content(file_path)
    print(f"Extracted HTML-like content from {file_path}:\n{html_like_content}\n")

def main():
    output = open("./blood.json", "w", encoding="utf-8")
    output_data = {}
    
    # packages/javascript/bh-shared-ui/src/components/HelpTexts/ADCSESC1/LinuxAbuse.tsx
    loc = "./docs/packages/javascript/bh-shared-ui/src/components/HelpTexts"
    for dir in os.listdir(loc):
        dir_path = os.path.join(loc, dir)
        if not os.path.isdir(dir_path):
            print(f"Skipping non-directory: {dir_path}")
            continue
        print(f"Processing directory: {dir_path}")

        react_files = os.listdir(dir_path)

        if "LinuxAbuse.tsx" in react_files:
            print(f"Found LinuxAbuse.tsx in {dir_path}")
            parse_file(
                os.path.join(dir_path, "LinuxAbuse.tsx"),
                "linux",
                dir
            )
        
        if "WindowsAbuse.tsx" in react_files:
            print(f"Found WindowsAbuse.tsx in {dir_path}")
            parse_file(
                os.path.join(dir_path, "WindowsAbuse.tsx"),
                "windows",
                dir
            )
        
        if "Abuse.tsx" in react_files:
            print(f"Found Abuse.tsx in {dir_path}")
            
    
if __name__ == "__main__":
    main()



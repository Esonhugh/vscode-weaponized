# vscode-weaponized

`vscode-weaponized` is a lightweight VS Code extension to run commands in READMEs in one-click.
It adds a CodeLens action to run shell snippets in any markdown file.

<img width="478" alt="screenshot" src="https://user-images.githubusercontent.com/1406778/64465935-20934280-d163-11e9-8e0e-8dfd0f86fad3.png">

### How does it work?

`vscode-weaponized` detects `` ``` ``, `` ```sh `` and `` ```bash `` snippets in markdown files an adds
a `Run command in terminal` action at the top.

When clicked the associated snippet is run the current active terminal or a new one if it is busy.


*This extension is not actively maintained but contributions are welcome!*

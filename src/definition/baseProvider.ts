import * as vscode from 'vscode';

export type definitionSearcher = (params: { document: vscode.TextDocument, position: vscode.Position }) => string | undefined;

export class BaseDefinitionProvider implements vscode.DefinitionProvider,vscode.HoverProvider {
    private findSnippetDescription: definitionSearcher;
    constructor(findSnippetDescription: definitionSearcher) {
        this.findSnippetDescription = findSnippetDescription;
    }

    public static getWord(document: vscode.TextDocument, position: vscode.Position): string | undefined {
        const range = document.getWordRangeAtPosition(position);
        if (range) {
            return document.getText(range);
        }
        return undefined;
    }

    public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Definition | vscode.DefinitionLink[]> {
        const description = this.findSnippetDescription({ document, position });
        if (description) {
            const uri = vscode.Uri.parse(`weaponized-editor:${BaseDefinitionProvider.getWord(document, position)}?${encodeURIComponent(description)}`);
            return new vscode.Location(uri, new vscode.Position(0, 0));
        }
        return null;
    }
    public provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        const description = this.findSnippetDescription({ document, position });
        if (description) {
            return new vscode.Hover(description);
        }
    }

    public registerSelf(context: vscode.ExtensionContext): void {
        context.subscriptions.push(
            vscode.languages.registerDefinitionProvider(
                { scheme: "file", language: "markdown" },
                this
            ),
            vscode.languages.registerHoverProvider(
                { scheme: "file", language: "markdown" },
                this
            )
        );
    }
}



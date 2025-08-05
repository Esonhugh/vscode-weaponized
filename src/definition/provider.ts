import * as vscode from 'vscode';
import bloodSnippet from '../snippets/source/blood/blood_desc.json';
import { BaseDefinitionProvider } from './baseProvider';



export let BloodhoundDefinitionProvider = new BaseDefinitionProvider(
    (params: { document: vscode.TextDocument, position: vscode.Position }): string | undefined => {
        const word = BaseDefinitionProvider.getWord(params.document, params.position) ;
        if (!word) {
            return undefined;
        }
        for (const snippet of Object.keys(bloodSnippet)) {
            if (snippet.startsWith(word)) {
                const description = (bloodSnippet as any)[snippet].description || '';
                return description;
            }
        }
    }
);
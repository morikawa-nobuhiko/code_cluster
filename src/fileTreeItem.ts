import * as vscode from 'vscode';
import * as path from 'path';

// export class FileTreeItem extends vscode.TreeItem {
//     constructor(
//         public readonly label: string,
//         public readonly resourceUri: vscode.Uri,
//         public readonly collapsibleState: vscode.TreeItemCollapsibleState
//     ) {
//         super(label, collapsibleState);
//         this.tooltip = this.label;
//         this.description = path.dirname(resourceUri.fsPath);
//         this.contextValue = 'fileItem';
//     }

//     contextValue = 'file';
// }

export class FileTreeItem extends vscode.TreeItem {
    constructor(
        public readonly filePath: string,
        public readonly uri: vscode.Uri,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(path.basename(filePath), collapsibleState);
        this.resourceUri = uri;
        this.contextValue = 'fileItem';
    }
}

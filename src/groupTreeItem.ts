import * as vscode from 'vscode';
import { Group } from './types';

export class GroupTreeItem extends vscode.TreeItem {
    // constructor(
    //     public readonly label: string,
    //     public readonly files: string[],
    //     public readonly collapsibleState: vscode.TreeItemCollapsibleState
    // ) {
    //     super(label, collapsibleState);
    // }
    constructor(
        public readonly group: Group,
        public readonly files: string[],
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(group.name, collapsibleState);
        this.group = group;
        this.description = group.files.length.toString();
        this.contextValue = 'groupItem';
    }
    // contextValue = 'group';
}

import * as vscode from 'vscode';
import { GroupTreeItem } from './groupTreeItem';
import { FileTreeItem } from './fileTreeItem';
import { Group } from './types';

export class FileGroupingTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | null> = new vscode.EventEmitter<vscode.TreeItem | null>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | null> = this._onDidChangeTreeData.event;

    constructor(private groups: Group[] = []) { }

    refresh(): void {
        this._onDidChangeTreeData.fire(null);
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getGroups(): Group[] {
        const config = vscode.workspace.getConfiguration('fileGrouping');
        const groups = config.get<Group[]>('groups') || [];
        // アルファベット順にソート
        groups.sort((a, b) => a.name.localeCompare(b.name)); 
        return groups;
    }

    getChildren(element?: GroupTreeItem | FileTreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
        const groups = this.getGroups();

        if (!element) {
            return groups.map((group) => new GroupTreeItem(group, group.files, vscode.TreeItemCollapsibleState.Collapsed));
        } else if (element instanceof GroupTreeItem) {
            return element.group.files.map((file) => {
                const uri = vscode.Uri.file(file);
                return new FileTreeItem(file, uri, vscode.TreeItemCollapsibleState.None);
            });
        }

        return [];
    }

}

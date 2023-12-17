"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
function activate(context) {
    // Add file to group command
    let addFileToGroupDisposable = vscode.commands.registerCommand('fileGrouping.addFileToGroup', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor found.');
            return;
        }
        const filePath = editor.document.uri.fsPath;
        const config = vscode.workspace.getConfiguration('fileGrouping');
        const groups = config.get('groups') || [];
        const groupNames = groups.map(group => group.name);
        const selectedGroupName = await vscode.window.showQuickPick(groupNames, { placeHolder: 'Select a group to add the file to' });
        if (!selectedGroupName) {
            return;
        }
        const selectedGroupIndex = groups.findIndex(group => group.name === selectedGroupName);
        if (selectedGroupIndex >= 0) {
            groups[selectedGroupIndex].files.push(filePath);
            await config.update('groups', groups, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`File added to group: ${selectedGroupName}`);
        }
        else {
            vscode.window.showErrorMessage('Group not found.');
        }
    });
    context.subscriptions.push(addFileToGroupDisposable);
    // Open group files command
    let openGroupFilesDisposable = vscode.commands.registerCommand('fileGrouping.openGroupFiles', async () => {
        const config = vscode.workspace.getConfiguration('fileGrouping');
        const groups = config.get('groups') || [];
        const groupNames = groups.map(group => group.name);
        const selectedGroupName = await vscode.window.showQuickPick(groupNames, { placeHolder: 'Select a group to open the files' });
        if (!selectedGroupName) {
            return;
        }
        const selectedGroup = groups.find(group => group.name === selectedGroupName);
        if (selectedGroup) {
            for (const file of selectedGroup.files) {
                const uri = vscode.Uri.file(file);
                const document = await vscode.workspace.openTextDocument(uri);
                await vscode.window.showTextDocument(document, { preview: false });
            }
        }
        else {
            vscode.window.showErrorMessage('Group not found.');
        }
    });
    context.subscriptions.push(openGroupFilesDisposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
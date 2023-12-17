import * as vscode from 'vscode';
import { FileGroupingTreeDataProvider } from './fileGroupingTreeDataProvider';
import { Group } from './types';
import { GroupTreeItem } from './groupTreeItem';
import { FileTreeItem } from './fileTreeItem';

export function activate(context: vscode.ExtensionContext) {

	// Register a TreeDataProvider in the view
	const fileGroupingDataProvider = new FileGroupingTreeDataProvider();
	vscode.window.registerTreeDataProvider('codeClusterTreeView', fileGroupingDataProvider);

	// create group command
	context.subscriptions.push(
		vscode.commands.registerCommand('fileGrouping.createGroup', async () => {
			const groupName = await vscode.window.showInputBox({ prompt: 'Enter a group name' });
			if (groupName) {
				const config = vscode.workspace.getConfiguration('fileGrouping');
				const groups = config.get<Group[]>('groups') || [];
				// グループが存在しない場合のみ、新しいグループを追加
				if (!groups.find(group => group.name === groupName)) {
					const newGroup = { name: groupName, files: [] };
					groups.push(newGroup);
					await config.update('groups', groups, vscode.ConfigurationTarget.Global);
					fileGroupingDataProvider.refresh();
					vscode.window.showInformationMessage(`Group "${groupName}" has been created.`);
				} else {
					vscode.window.showErrorMessage(`Group "${groupName}" already exists.`);
				}
			}
		})
	);

	// delete Group command
	context.subscriptions.push(
		vscode.commands.registerCommand('fileGrouping.deleteGroup', async () => {
			const config = vscode.workspace.getConfiguration('fileGrouping');
			const groups = config.get<Group[]>('groups') || [];
			const groupNames = groups.map(group => group.name);
			const selectedGroupName = await vscode.window.showQuickPick(groupNames, { placeHolder: 'Select delete group' });
			if (!selectedGroupName) {
				return;
			}
			const selectedGroupIndex = groups.findIndex(group => group.name === selectedGroupName);
			if (selectedGroupIndex >= 0) {
				// 選択されたグループを削除します
				groups.splice(selectedGroupIndex, 1);

				// 更新されたグループリストを設定に保存します
				await config.update('groups', groups, vscode.ConfigurationTarget.Global);
				fileGroupingDataProvider.refresh();
				vscode.window.showInformationMessage(`Delete Group: ${selectedGroupName}`);
			} else {
				vscode.window.showErrorMessage('Group not found.');
			}
		})
	);

	// add file to group command
	context.subscriptions.push(
		vscode.commands.registerCommand('fileGrouping.addFileToGroup', async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage('No active text editor found.');
				return;
			}
			const filePath = editor.document.uri.fsPath;
			const config = vscode.workspace.getConfiguration('fileGrouping');
			const groups = config.get<Group[]>('groups') || [];
			if (groups.length === 0) {
				vscode.window.showErrorMessage("No groups found. Please create a group first.");
				return;
			}
			const groupNames = groups.map(group => group.name);
			const selectedGroupName = await vscode.window.showQuickPick(groupNames, { placeHolder: 'Select a group to add the file to' });
			if (!selectedGroupName) {
				return;
			}
			const selectedGroupIndex = groups.findIndex(group => group.name === selectedGroupName);
			if (selectedGroupIndex >= 0) {
				// 既存のファイルパスと重複しているかどうかチェック
				const fileExists = groups[selectedGroupIndex].files.some((file) => file === filePath);
				if (fileExists) {
					vscode.window.showInformationMessage(`File "${filePath}" already exists in the group.`);
					return;
				}
				groups[selectedGroupIndex].files.push(filePath);
				await config.update('groups', groups, vscode.ConfigurationTarget.Global);
				fileGroupingDataProvider.refresh();
				vscode.window.showInformationMessage(`File added to group: ${selectedGroupName}`);
			} else {
				vscode.window.showErrorMessage('Group not found.');
			}
		})
	);

	// open group files command
	context.subscriptions.push(
		vscode.commands.registerCommand('fileGrouping.openGroupFiles', async () => {
			const config = vscode.workspace.getConfiguration('fileGrouping');
			const groups = config.get<Group[]>('groups') || [];
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
			} else {
				vscode.window.showErrorMessage('Group not found.');
			}
		})
	);

	// create group a view
	context.subscriptions.push(
		vscode.commands.registerCommand("fileGrouping.createGroupView", async () => {
		  const config = vscode.workspace.getConfiguration("fileGrouping");
		  const groups = config.get<Group[]>("groups") || [];
	  
		  const newGroupName = await vscode.window.showInputBox({
			placeHolder: "Enter a new group name",
			validateInput: (value) => {
			  if (groups.some((group) => group.name === value)) {
				return "Group name already exists";
			  }
			  return "";
			},
		  });
	  
		  if (newGroupName) {
			groups.push({ name: newGroupName, files: [] });
			await config.update("groups", groups, vscode.ConfigurationTarget.Global);
			fileGroupingDataProvider.refresh();
			vscode.window.showInformationMessage(`Created group '${newGroupName}'.`);
		  }
		})
	  );
	  
	// deleting a group from a view
	context.subscriptions.push(
		vscode.commands.registerCommand('fileGrouping.deleteGroupView', async (groupTreeItem: GroupTreeItem) => {
			const group = groupTreeItem.group;
			const config = vscode.workspace.getConfiguration('fileGrouping');
			const groups = config.get<Group[]>('groups') || [];
			const selectedGroupIndex = groups.findIndex((g) => g.name === group.name);
			if (selectedGroupIndex < 0) {
				vscode.window.showErrorMessage('Group not found.');
				return;
			}
			if (selectedGroupIndex >= 0) {
				// 選択されたグループを削除します
				groups.splice(selectedGroupIndex, 1);
				vscode.window.showInformationMessage('fileGrouping.deleteGroupView');
				// 更新されたグループリストを設定に保存します
				await config.update('groups', groups, vscode.ConfigurationTarget.Global);
				fileGroupingDataProvider.refresh();
			} else {
				vscode.window.showErrorMessage('Group not found.');
			}
		})
	);

	// open group files command a view
	context.subscriptions.push(
		vscode.commands.registerCommand('fileGrouping.openGroupFilesView', async (groupTreeItem: GroupTreeItem) => {
			const config = vscode.workspace.getConfiguration('fileGrouping');
			const groups = config.get<Group[]>('groups') || [];

			const selectedGroup = groupTreeItem.group;
			if (selectedGroup) {
				for (const file of selectedGroup.files) {
					const uri = vscode.Uri.file(file);
					const document = await vscode.workspace.openTextDocument(uri);
					await vscode.window.showTextDocument(document, { preview: false });
				}
			} else {
				vscode.window.showErrorMessage('Group not found.');
			}
		})
	);

	// open file view
	context.subscriptions.push(
		vscode.commands.registerCommand("fileGrouping.openFileView", async (fileTreeItem: FileTreeItem) => {
			if (!fileTreeItem.resourceUri) {
				vscode.window.showErrorMessage("File URI not found.");
				return;
			}
	
			const fileUri = fileTreeItem.resourceUri;
	
			try {
				await vscode.commands.executeCommand("vscode.open", fileUri);
			} catch (error) {
				vscode.window.showErrorMessage(`Error opening file: ${error}`);
			}
		})
	);
	
	// remove file from group a view
	context.subscriptions.push(
		vscode.commands.registerCommand("fileGrouping.removeFileFromGroupView", async (fileTreeItem: FileTreeItem) => {
			if (!fileTreeItem.resourceUri) {
				vscode.window.showErrorMessage("File URI not found.");
				return;
			}

			const config = vscode.workspace.getConfiguration("fileGrouping");
			const groups = config.get<Group[]>("groups") || [];

			const fileUri = fileTreeItem.resourceUri;

			const selectedGroupIndex = groups.findIndex((group) => group.files.some((filePath) => filePath === fileUri.fsPath));
			if (selectedGroupIndex < 0) {
				vscode.window.showErrorMessage("File not found in any group.");
				return;
			}

			const selectedGroup = groups[selectedGroupIndex];
			const fileIndex = selectedGroup.files.findIndex((filePath) => filePath === fileUri.fsPath);

			if (fileIndex >= 0) {
				selectedGroup.files.splice(fileIndex, 1);
				await config.update("groups", groups, vscode.ConfigurationTarget.Global);
				fileGroupingDataProvider.refresh();
				vscode.window.showInformationMessage(`Removed file from group '${selectedGroup.name}'.`);
			} else {
				vscode.window.showErrorMessage("File not found in the group.");
			}
		})
	);

	// rename group a view
	context.subscriptions.push(
		vscode.commands.registerCommand("fileGrouping.renameGroupView", async (groupTreeItem: GroupTreeItem) => {
			const config = vscode.workspace.getConfiguration("fileGrouping");
			const groups = config.get<Group[]>("groups") || [];

			const selectedGroupIndex = groups.findIndex((group) => group.name === groupTreeItem.group.name);
			if (selectedGroupIndex < 0) {
				vscode.window.showErrorMessage("Group not found.");
				return;
			}

			const newName = await vscode.window.showInputBox({
				prompt: "Enter new group name",
				value: groupTreeItem.group.name,
			});

			if (!newName) {
				return;
			}

			if (groups.some((group) => group.name === newName)) {
				vscode.window.showErrorMessage("Group name already exists.");
				return;
			}

			groups[selectedGroupIndex].name = newName;
			await config.update("groups", groups, vscode.ConfigurationTarget.Global);
			fileGroupingDataProvider.refresh();
			vscode.window.showInformationMessage(`Group '${groupTreeItem.group.name}' renamed to '${newName}'.`);
		})
	);

	// refresh group command a view
	context.subscriptions.push(
		vscode.commands.registerCommand('fileGrouping.refreshGroupView', (group: Group) => {
			fileGroupingDataProvider.refresh();
			vscode.window.showInformationMessage(`Refreshed Group`);
		})
	);

}

export function deactivate() { }

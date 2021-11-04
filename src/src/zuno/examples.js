"use strict";

const Path = require("path");

const VsCode = require("vscode");

const ZunoConstant = require("../constant/zunoconstant");
const File = require("../common/file");

class FileSystemProviderExamples {
	constructor(_pathExamples, _pathImages) {
		this._pathExamples = _pathExamples;
		this._pathImagesDir =
		{
			light: Path.join(_pathImages, 'Folder_16x.svg'),
			dark: Path.join(_pathImages, 'Folder_16x_inverse.svg'),
		};
		this._onDidChangeFile = new VsCode.EventEmitter();
	}
	get onDidChangeFile() {
		return this._onDidChangeFile.event;
	}
	// tree data provider
	async getChildren(element) {
		if (element == undefined)
			element = this._pathExamples;
		else
			element = element.uri.fsPath;
		let type;
		let list_dir = await File.readdir(element);
		if (list_dir == false)
			list_dir = [];
		const children = [];
		for (let i = 0; i < list_dir.length; i++) {
			const child = list_dir[i];
			const state = await File.stat(Path.join(element, child));
			if (state == false)
				continue ;
			else if (state.isFile() == true) {
				if (Path.extname(child) === ".ino")
					type =  VsCode.FileType.File;
				else
					continue ;
				
			}
			else if (state.isDirectory() == true)
				type =  VsCode.FileType.Directory;
			else
				continue ;
			children.push([child, type]);
		}
		return children.map(([name, type]) => ({ uri: VsCode.Uri.file(Path.join(element, name)), type }));
	}
	getTreeItem(element) {
		const treeItem = new VsCode.TreeItem(element.uri, element.type === VsCode.FileType.Directory ? VsCode.TreeItemCollapsibleState.Collapsed : VsCode.TreeItemCollapsibleState.None);
		if (element.type === VsCode.FileType.File) {
			treeItem.command = { command: 'zunoExamples.openFile', title: "Open File", arguments: [element.uri], };
			treeItem.contextValue = 'file';
		}
		if (element.type === VsCode.FileType.Directory)
			treeItem.iconPath = this._pathImagesDir;
		return treeItem;
	}
}

class Examples {
	constructor(context, path_install) {
		const treeDataProvider = new FileSystemProviderExamples(Path.join(path_install, ZunoConstant.BOARD_CURRENT.core, ZunoConstant.DIR.HARDWARE, ZunoConstant.BOARD_CURRENT.EXAMPLES), Path.join(context.extensionPath, 'images', 'examples'));
		context.subscriptions.push(VsCode.window.createTreeView('zunoExamples', { treeDataProvider }));
		VsCode.commands.registerCommand('zunoExamples.openFile', (resource) => this.openResource(resource));
	}
	openResource(resource) {
		VsCode.window.showTextDocument(resource);
	}
}
exports.Examples = Examples;
//# sourceMappingURL=zunoExamples.js.map
/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const VsCode = require("vscode");

const ZunoConstant = require("../constant/zunoconstant");

//Создаем обьект канала для вывода информации на терминал vs code
class OutputPro
{
	#outputChannel;
	#outputEdit;
	constructor(name)
	{
		this.#outputChannel = VsCode.window.createOutputChannel(name);
	}
	static createOutputChannel(name)
	{
		VsCode.workspace.onDidChangeTextDocument((arg) => {
			const fghfg = arg.document.uri;
			let fghfgghg = 'ghjgh';
		});
		VsCode.workspace.onDidCreateFiles((arg) => {
			let fghfgghg = 'ghjgh';
		});
		const out = new OutputPro(name);
		return(out);
	}
	append(msg)
	{
		this.#outputChannel.append(msg);
	}
	appendLine(msg)
	{
		const fghfg = VsCode.window.visibleTextEditors;
		const gfhjg = this.#outputChannel;
		this.#outputChannel.appendLine(msg);
		gfhjg._channel.then(
			(e) => {
				e.clear();
			}
			);
	}
	async show(preserveFocus)
	{
		// if (this.#outputChannel == undefined)
		// {
		// 	VsCode.workspace.onDidOpenTextDocument((arg) => {
		// 		const fghfg = arg;
		// 	});
		// }
		this.#outputChannel.show(preserveFocus);
	}
	hide()
	{
		this.#outputChannel.hide();
	}
	clear()
	{
		this.#outputChannel.clear();
	}
	dispose()
	{
		this.#outputChannel.dispose();
	}
	documentlineAt()
	{
		const outputEdit = this.#outputEdit;
		if (outputEdit == undefined)
			return ('');//Что бы не падало
		return (outputEdit.document.lineAt(outputEdit.document.lineCount - 1));
	}
}

module.exports = OutputPro;

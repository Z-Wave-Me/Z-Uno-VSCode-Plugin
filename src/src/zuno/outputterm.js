/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const VsCode = require("vscode");

const ZunoConstant = require("../constant/zunoconstant");

//Создаем обьект канала для вывода информации на терминал vs code
class OutputTerm
{
	#writeEmitter;
	#term;
	createChannel(name)
	{
		const context = this;
		return (new Promise((resolve, reject) => {
			const writeEmitter = new VsCode.EventEmitter();
			const term = VsCode.window.createTerminal({name: name, pty: {
				onDidWrite: writeEmitter.event,
				open: () => {resolve();},
				close: () => {
					term.dispose();
					writeEmitter.dispose();
					context.createChannel.call(context, name);
				},
				handleInput: (data) => writeEmitter.fire(data)
			} });
			this.#writeEmitter = writeEmitter;
			this.#term = term;
		}));
	}
	append(msg)
	{
		this.#writeEmitter.fire(msg);
	}
	appendLine(msg)
	{
		this.#writeEmitter.fire(`${msg}\n\r`);
	}
	show()
	{
		this.#term.show();
	}
	dispose()
	{
		this.#term.dispose();
		this.#writeEmitter.dispose();
	}
}

module.exports = OutputTerm;

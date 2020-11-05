/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const VsCode = require('vscode');

const _this = {
	execute: function(cmd, args, name)
	{
		return (new Promise((resolve) => {
			const task = new VsCode.Task({type: 'shell', label: name, command: cmd, args: args}, VsCode.TaskScope.Workspace, name, ' Z-Uno', new VsCode.ShellExecution(cmd, args), '$gcc');
			const end = VsCode.tasks.onDidEndTaskProcess((e) => {
				if (task.definition.id == e.execution.task.definition.id)
				{
					end.dispose();
					resolve(e.exitCode);
				}
			});
			VsCode.tasks.executeTask(task);
		}));
	}
}

module.exports = _this;

/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const VsCode = require("vscode");

const _this = {
	getPath: function()
	{
		const value = VsCode.workspace.getConfiguration().get('zuno.path');
		return ((value == undefined) ? "" : value);
	},
	setPath(value)
	{
		VsCode.workspace.getConfiguration().update('zuno.path', value, true);
	},
	getkeyBindings: function()
	{
		const value = VsCode.workspace.getConfiguration().get('zuno.keyBindings');
		return ((value == 'Enabled') ? true : false);
	},
	setkeyBindings(value)
	{
		value = (value == true) ? 'Enabled' : 'Disabled';
		VsCode.workspace.getConfiguration().update('zuno.keyBindings', value, true);
	},
	getAutoUpdate: function()
	{
		const value = VsCode.workspace.getConfiguration().get('zuno.autoUpdate');
		return ((value == 'Enabled') ? true : false);
	},
	getAutoUpdateTime:  function()
	{
		const value = VsCode.workspace.getConfiguration().get('zuno.autoUpdateTime');
		return ((value == undefined) ? 86400 : parseInt(value));
	},
	getOutputTerminal: function()
	{
		const value = VsCode.workspace.getConfiguration().get('zuno.outputTerminal');
		return ((value == 'Enabled') ? true : false);
	},
	getBaudRate: function()
	{
		const out = VsCode.workspace.getConfiguration().get('zuno.baudRate');
		if (out != parseInt(out))
			return ('115200');
		return (`${out}`);//Что бы передать как строку
	}
}

module.exports = _this;
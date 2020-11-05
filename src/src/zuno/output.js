/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const VsCode = require("vscode");

const ZunoConstant = require("../constant/zunoconstant");

//Создаем обьект канала для вывода информации на терминал vs code
const _this = {
	channel: VsCode.window.createOutputChannel("Z-Uno"),
	start: function(message)
	{
		_this.channel.appendLine(`${ZunoConstant.OUTPUT_START} ${message}`);
	},
	end: function(message)
	{
		_this.channel.appendLine(`${ZunoConstant.OUTPUT_END} ${message}`);
	},
	warning: function(message)
	{
		_this.channel.appendLine(`${ZunoConstant.OUTPUT_WARNING} ${message}`);
	},
	error: function(message)
	{
		_this.channel.appendLine(`${ZunoConstant.OUTPUT_ERROR} ${message}`);
	},
	info: function(message)
	{
		_this.channel.appendLine(`${ZunoConstant.OUTPUT_INFO} ${message}`);
	},
	data: function(data)
	{
		_this.channel.append(data.toString());
	},
	show: function()
	{
		_this.channel.show();
	},
	clear: function()
	{//Почему то не коректно работает после того как почистит парсер gramatic выдает ошибку
		_this.channel.clear();
	},
	hide: function()
	{
		_this.channel.hide();
	}
}

module.exports = _this;
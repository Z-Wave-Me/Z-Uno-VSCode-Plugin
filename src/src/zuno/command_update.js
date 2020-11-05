/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";//Файлы не должны иметь ЗАГЛАВНЫЕ буквы иначе отладка не работает правельно

//Подключаем необходимые модули
const VsCode = require("vscode");
const Path = require("path");
const Fs = require('fs');

const StatusBar = require("./statusbar");

const ZunoConstant = require("../constant/zunoconstant");
const Output = require("./output");
const VsConfig = require("./vsconfig");

//Создаем обьект для эксорта комманд
const _this = {
	getSketch: async function()
	{
		const active_sketch = StatusBar.sketch.getActiveSketch();//Активная текущяя вкладка если она есть
		if (active_sketch != false)
			if (Fs.existsSync(active_sketch) == true)
				return ({sketch: Path.basename(active_sketch), path_sketch: active_sketch});
		const sketch = StatusBar.sketch.get();
		if (sketch == false)
			return (false);
		return ({sketch: sketch, path_sketch: Path.join(ZunoConstant.PATH.WORKSPACE, sketch)});//Если не нашли возращаем тот что указан явно скетч
	},
	getUpdateMemoryUsage: function()
	{
		if (_this.updateMemoryUsage.storage > ZunoConstant.MEMORY.STORAGE || _this.updateMemoryUsage.dynamic > ZunoConstant.MEMORY.DYNAMIC)
			return (false);
		return (true);
	},
	updateMemoryUsage: function(data)
	{
		const array = data.toString().match(/\d+/g);
		_this.updateMemoryUsage.storage = array[0];
		_this.updateMemoryUsage.dynamic = array[1];
	},
	printUpdateMemoryUsage: function(typeout = true)
	{
		const storage = _this.updateMemoryUsage.storage;
		const dynamic = _this.updateMemoryUsage.dynamic;
		const storage_max = ZunoConstant.MEMORY.STORAGE;
		const dynamic_max = ZunoConstant.MEMORY.DYNAMIC;
		let message_storage = ZunoConstant.UPLOAD_USAGE_MEMORY_STORAGE.replace('${STORAGE_USE}', storage);
		let message_dynamic = ZunoConstant.UPLOAD_USAGE_MEMORY_DYNAMIC.replace('${DYNAMIC_USE}', dynamic);
		message_storage = message_storage.replace('${STORAGE_MAX}', storage_max);
		message_dynamic = message_dynamic.replace('${DYNAMIC_MAX}', dynamic_max);
		message_storage = message_storage.replace('${STORAGE_USE_RATE}', parseInt(storage / (storage_max / 100)));
		message_dynamic = message_dynamic.replace('${DYNAMIC_USE_RATE}', parseInt(dynamic / (dynamic_max / 100)));
		message_dynamic = message_dynamic.replace('${DYNAMIC_LOCAL}', dynamic_max - dynamic);
		if (typeout == true)
		{
			Output.info(message_storage);
			Output.info(message_dynamic);
			if (storage > storage_max)
				Output.error(ZunoConstant.UPLOAD_STORAGE_BIG);
			if (dynamic > dynamic_max)
				Output.error(ZunoConstant.UPLOAD_DYNAMIC_BIG);
			return ;
		}
		VsCode.window.showInformationMessage(`${message_storage} ${message_dynamic}`);
		let msg = '';
		if (storage > storage_max)
			msg = msg + ZunoConstant.UPLOAD_STORAGE_BIG + ' ';
		if (dynamic > dynamic_max)
			msg = msg + ZunoConstant.UPLOAD_DYNAMIC_BIG;
		if (msg != '')
			VsCode.window.showErrorMessage(msg);
	}
}

module.exports = _this;

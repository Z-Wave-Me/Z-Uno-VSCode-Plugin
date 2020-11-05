/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";//Файлы не должны иметь ЗАГЛАВНЫЕ буквы иначе отладка не работает правельно

//Подключаем необходимые модули
const VsCode = require("vscode");

const SerialMonitor = require("./serialmonitor");

const ZunoConstant = require("../constant/zunoconstant");

//Создаем обьект для эксорта комманд
const _this = {
	installProloge: function(context, path_install, array_host)
	{
		if (context.b_install == true)
		{
			VsCode.window.showInformationMessage(ZunoConstant.SYSTEM_PROCESS_BUSY);
			return (false);
		}
		if (path_install == false)
		{
			VsCode.window.showWarningMessage(ZunoConstant.SYSTEM_NOT_PATH);
			return (false);
		}
		if (array_host == false)
		{
			VsCode.window.showErrorMessage(ZunoConstant.SYSTEM_NOT_SUPPORT);
			return (false);
		}
		context.b_install = true;
		return (true);
	},
	installEpilogue: function(context)
	{
		SerialMonitor.finishUpload();
		context.b_install = false;
	}
}

module.exports = _this;

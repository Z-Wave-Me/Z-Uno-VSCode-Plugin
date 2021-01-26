/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
'use strict';

//Подключаем необходимые модули
const VsCode = require("vscode");
const Fs = require("fs");
const Os = require("os");

const File = require("./common/file");

const VsConfig = require("./zuno/vsconfig");
const Command = require("./zuno/command");
const ZunoConstant = require("./constant/zunoconstant");
const Constant = require("./constant/constant");

//вызываться в том случае, если плагин был активирован событием, указанным в манифест
async function activate(context)//package.json - указанно так что активируеться если есть хотябы одна рабочая папка
{
	const path_install = await _start();
	_key();
	Command.init(context, path_install, _platform());
}
exports.activate = activate;

//вызывается в том случае, если плагин был деактивирован
function deactivate()
{//FIXME добавить удаление папок всех в кеше на случай резкого завершения программы
	File.delete(ZunoConstant.PATH.TMP_BUILD);//Удалим свои все временные файлы
}
exports.deactivate = deactivate;

async function _key()
{
	if (VsConfig.getkeyBindings() == false)
		return ;
	const ans = await VsCode.window.showInformationMessage(ZunoConstant.START_KEY_QUESTION, Constant.DIALOG_YES, Constant.DIALOG_NOT);
	if (ans == undefined)
		return ;
	if (ans == Constant.DIALOG_YES)
	{
		await VsCode.commands.executeCommand(ZunoConstant.WORKBENCH.OPEN_GLOBAL_KEYBINDINGS);
		VsCode.window.showInformationMessage(ZunoConstant.START_KEY_FIND);
	}
	VsConfig.setkeyBindings(false);
}

function _platform()
{
	let array_host = false;
	const platform = Os.platform();
	switch (platform)
	{
		case 'win32':
			array_host = {host_install: 'i686-mingw32', host_cpp: 'Win32'};
			break;
		case 'darwin':
			array_host = {host_install: 'x86_64-apple-darwin', host_cpp: 'Mac'};
			break;
		case 'linux':
			if (Os.arch() != 'x64')
				break ;
			array_host = {host_install: 'x86_64-pc-linux-gnu', host_cpp: 'Linux'};
			break;
	}
	if (array_host == false)
		VsCode.window.showErrorMessage(ZunoConstant.START_NOT_SUPPORT);
	return (array_host);
}

async function _start()
{
		let path_install = VsConfig.getPath();
		if (path_install != "")
		{
			if (Fs.existsSync(path_install) == false)
			{
				VsCode.window.showWarningMessage(`${Constant.FILE_NOT_PATH} : ${path_install} .`);
				path_install = false;
			}
			else
			{
				const st = await File.stat(path_install);
				if (st == false || st.isDirectory() == false)
				{
					VsCode.window.showWarningMessage(`${Constant.FILE_NOT_DIR} : ${path_install} .`);
					path_install = false;
				}
			}
		}
		if (path_install == false)
		{
			while (0xFF) 
			{
				const ans = await VsCode.window.showInformationMessage(ZunoConstant.SYSTEM_PATH_CONTINUE, Constant.DIALOG_YES, Constant.DIALOG_NOT);
				if (ans != Constant.DIALOG_YES)
					return (false);
				const folder = await VsCode.window.showOpenDialog({canSelectFolders: true, canSelectMany: false, openLabel: Constant.DIALOG_SELECT_DIR});
				if (folder == undefined)
					continue ;
				path_install = folder[0].fsPath;
				break ;
			}
		}
		VsConfig.setPath(path_install);
		return (path_install);
}

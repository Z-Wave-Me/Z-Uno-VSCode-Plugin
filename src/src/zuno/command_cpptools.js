/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";//Файлы не должны иметь ЗАГЛАВНЫЕ буквы иначе отладка не работает правельно

//Подключаем необходимые модули
const VsCode = require("vscode");
const Path = require("path");
const Fs = require('fs');

const Config = require("./config");
const ZunoConstant = require("../constant/zunoconstant");
const Constant = require("../constant/constant");

const VERSION						= 4;
const INTELLISENSEMODE				= "${default}";

//Создаем обьект для эксорта комманд
const _this = {
	cppTools: async function(path_install, array_host)
	{
		const hardware = Path.join(path_install, ZunoConstant.DIR.CORE, ZunoConstant.DIR.HARDWARE);
		const forcedInclude = [Path.join(hardware, ZunoConstant.ZMAKE.ARDUINO)];
		const includePath = [
			Path.join(hardware, ZunoConstant.ZMAKE.CORE, '**'),
			Path.join(hardware, ZunoConstant.ZMAKE.LIB, '**'),
			Path.join(path_install, ZunoConstant.DIR.CORE, ZunoConstant.DIR.TOOLS, ZunoConstant.ZMAKE.GCC_LIB, '**')
		];
		const name = array_host.host_cpp;
		let array;
		try {array = JSON.parse(Fs.readFileSync(ZunoConstant.PATH.JSON_CPPTOOLS, 'utf8')); } catch (error) {array = false;}
		if (array == false)//Если вообще такого нет файла
			return (_saveNew(name, includePath, forcedInclude));
		const index = _scanName(array, name, includePath, forcedInclude);
		if (index == false || Config.getCppIgnored() == true)
			return ;
		const configurations = array.configurations[index];
		if (configurations.includePath == undefined || configurations.forcedInclude == undefined  || configurations.intelliSenseMode == undefined)
			return (_actionJson(array, index, name, includePath, forcedInclude));
		if (Array.isArray(configurations.includePath) == false || Array.isArray(configurations.forcedInclude) == false)
			return (_actionJson(array, index, name, includePath, forcedInclude));
		if (_testArray(includePath, configurations.includePath) == false)
			return (_actionJson(array, index, name, includePath, forcedInclude));
		if (_testArray(forcedInclude, configurations.forcedInclude) == false)
			return (_actionJson(array, index, name, includePath, forcedInclude));
	}
}

module.exports = _this;


async function _actionJson(array, index, name, includePath, forcedInclude)
{
	const ans = await VsCode.window.showWarningMessage(ZunoConstant.CPP_TOOLS_INCOMPLETE_CONFIG, Constant.DIALOG_OVERWRITE, Constant.DIALOG_SUPPLEMENT, Constant.DIALOG_IGNORED);
	if (ans == undefined)
		return ;
	if (ans == Constant.DIALOG_OVERWRITE)
		return (_saveNew(name, includePath, forcedInclude));
	if (ans == Constant.DIALOG_IGNORED)
		return (Config.setCppIgnored(true));
	const configurations = array.configurations[index];
	if (configurations.intelliSenseMode == undefined)
		configurations.intelliSenseMode = INTELLISENSEMODE;
	if (configurations.includePath == undefined || Array.isArray(configurations.includePath) == false)
		configurations.includePath = includePath;
	if (configurations.forcedInclude == undefined || Array.isArray(configurations.forcedInclude) == false)
		configurations.forcedInclude = forcedInclude;
	_supplementJson(includePath, configurations.includePath);//Допишем нужные значения не самый лутчий вариант но может и это нужно будет
	_supplementJson(forcedInclude, configurations.forcedInclude);
	try
	{
		Fs.writeFileSync(ZunoConstant.PATH.JSON_CPPTOOLS, JSON.stringify(array, null, 4));
	} catch (error) {}
	VsCode.commands.executeCommand(ZunoConstant.CPP.CONFIGURATION_SELECT);
}

function _supplementJson(array1, array2)
{
	const len1 = array1.length;
	for (let index1 = 0; index1 < len1; index1++)
	{
		const element = array1[index1];
		const len2 = array2.length;
		let index2;
		for (index2 = 0; index2 < len2; index2++)
			if (element == array2[index2])
				break ;
		if (index2 == len2)
			array2.push(element);
		
	}
}

function _testArray(array1, array2)
{
	const len1 = array1.length;
	const len2 = array2.length;
	if (len1 > len2)
		return (false);
	for (let index1 = 0; index1 < len1; index1++)
	{
		const element = array1[index1];
		let index2;
		for (index2 = 0; index2 < len2; index2++)
			if (element == array2[index2])
				break ;
		if (index2 == len2)
			return (false);
		
	}
	return (true);
}

function _scanName(array, name, includePath, forcedInclude)
{
	const configurations = array.configurations;
	if (Array.isArray(configurations) == true)
	{
		const len = configurations.length;
		for (let index = 0; index < len; index++)
		{
			const element = configurations[index];
			if (element.name == name)
				return (index);
		}
		configurations.push({
			name: name,
			includePath: includePath,
			forcedInclude: forcedInclude,
			intelliSenseMode: INTELLISENSEMODE
		});
	}
	else
	{
		array.configurations = [{
			name: name,
			includePath: includePath,
			forcedInclude: forcedInclude,
			intelliSenseMode: INTELLISENSEMODE
		}];
		array.version = VERSION;
	}
	try
	{
		Fs.writeFileSync(ZunoConstant.PATH.JSON_CPPTOOLS, JSON.stringify(array, null, 4));
	} catch (error) {}
	VsCode.window.showInformationMessage(ZunoConstant.CPP_TOOLS_ADD_CONFIG);
	VsCode.commands.executeCommand(ZunoConstant.CPP.CONFIGURATION_SELECT);
	return (false);
}

function _saveNew(name, includePath, forcedInclude)
{
	const array = {
		configurations: [{
			name: name,
			includePath: includePath,
			forcedInclude: forcedInclude,
			intelliSenseMode: INTELLISENSEMODE
		}],
		version: VERSION
	};
	try
	{
		Fs.mkdirSync(ZunoConstant.PATH.JSON_DIR);
		Fs.writeFileSync(ZunoConstant.PATH.JSON_CPPTOOLS, JSON.stringify(array, null, 4));
	} catch (error) {}
	VsCode.commands.executeCommand(ZunoConstant.CPP.RESCAN_WORKSPACE);
}
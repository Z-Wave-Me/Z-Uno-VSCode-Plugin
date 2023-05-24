/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";//Файлы не должны иметь ЗАГЛАВНЫЕ буквы иначе отладка не работает правельно

//Подключаем необходимые модули
const VsCode = require("vscode");
const Path = require("path");
const Fs = require('fs');

const StatusBar = require("./statusbar");
const Config = require("./config");
const ZunoConstant = require("../constant/zunoconstant");
const Constant = require("../constant/constant");

const VERSION						= 4;
const INTELLISENSEMODE				= "gcc-arm";

//Создаем обьект для эксорта комманд
const _this = {
	cppTools: async function(path_install)
	{
		const hardware = Path.join(path_install, ZunoConstant.BOARD_CURRENT.core, ZunoConstant.DIR.HARDWARE);
		const forcedInclude = [];
		for (let index = 0; index < ZunoConstant.BOARD_CURRENT.ZMAKE.FORCE.length; index++)
			forcedInclude.push(Path.join(hardware, ZunoConstant.BOARD_CURRENT.ZMAKE.FORCE[index]));
		const includePath = [
			Path.join(hardware, ZunoConstant.BOARD_CURRENT.ZMAKE.CORE, '**'),
			Path.join(hardware, ZunoConstant.ZMAKE.LIB, '**'),
			Path.join(path_install, ZunoConstant.BOARD_CURRENT.core, ZunoConstant.DIR.TOOLS, ZunoConstant.BOARD_CURRENT.ZMAKE.GCC_LIB, '**'),
			Path.join(path_install, ZunoConstant.BOARD_CURRENT.core, ZunoConstant.DIR.TOOLS, ZunoConstant.ZMAKE.LIB_FAKE, '**')
		];
		let compiler_path = "";
		if (ZunoConstant.BOARD_CURRENT.ZMAKE.GCC_EXE != "")
			compiler_path = Path.join(path_install, ZunoConstant.BOARD_CURRENT.core, ZunoConstant.DIR.TOOLS, ZunoConstant.BOARD_CURRENT.ZMAKE.GCC_EXE);
		let name;
		if (ZunoConstant.BOARD_LIST_CHIP_SUPPORT == ZunoConstant.BOARD_LIST_CHIP_SUPPORT_DEFAULT) {
			name = ZunoConstant.BOARD_CURRENT.core;
		}
		else {
			name = ZunoConstant.BOARD_CURRENT.core + ' : ' + StatusBar.multi_chip.get();
		}
		const configurations_new = {
			name: name,
			includePath: includePath,
			forcedInclude: forcedInclude,
			intelliSenseMode: INTELLISENSEMODE,
			compilerPath: compiler_path
		};
		let array;
		try {array = JSON.parse(Fs.readFileSync(ZunoConstant.PATH.JSON_CPPTOOLS, 'utf8')); } catch (error) {array = false;}
		if (array == false || Array.isArray(array.configurations) == false)
		{
			await _save_cpp_json({ configurations: [configurations_new], version: VERSION});
			VsCode.window.showInformationMessage(ZunoConstant.CPP_TOOLS_ADD_CONFIG.replace('${name}', name));
			await VsCode.commands.executeCommand(ZunoConstant.CPP.CONFIGURATION_SELECT);
			return (false);//не нужно доп выбирать
		}
		let index;
		for (index = 0; index < array.configurations.length; index++)
		{
			const element = array.configurations[index];
			if (element.name == name)
				break ;
		}
		if (index >= array.configurations.length) {
			array.configurations.push(configurations_new);
			await _save_cpp_json(array);
			VsCode.window.showInformationMessage(ZunoConstant.CPP_TOOLS_ADD_CONFIG.replace('${name}', name));
			await VsCode.commands.executeCommand(ZunoConstant.CPP.CONFIGURATION_SELECT);
			return (false);//не нужно доп выбирать
		}
		if (Config.getCppIgnored() == true)
			return (true);//нужно выбрать если меняли чип
		if (JSON.stringify(configurations_new) === JSON.stringify(array.configurations[index]))
			return (true);//нужно выбрать если меняли чип
		array.configurations[index] = configurations_new;
		const ans = await VsCode.window.showWarningMessage(ZunoConstant.CPP_TOOLS_INCOMPLETE_CONFIG.replace('${name}', name), Constant.DIALOG_OVERWRITE, Constant.DIALOG_SKIP, Constant.DIALOG_IGNORED);
		if (ans == undefined)
			return (true);//нужно выбрать если меняли чип
		if (ans == Constant.DIALOG_IGNORED)
			return (Config.setCppIgnored(true));
		if (ans == Constant.DIALOG_SKIP)
			return (true);//нужно выбрать если меняли чип
		await _save_cpp_json(array);
		await VsCode.commands.executeCommand(ZunoConstant.CPP.RESCAN_WORKSPACE);
		return (true);//нужно выбрать если меняли чип
	}
}

module.exports = _this;


async function _save_cpp_json(array)
{
	try
	{
		if (Fs.accessSync(ZunoConstant.PATH.JSON_DIR) == false)
			Fs.mkdirSync(ZunoConstant.PATH.JSON_DIR);
		Fs.writeFileSync(ZunoConstant.PATH.JSON_CPPTOOLS, JSON.stringify(array, null, 4));
	} catch (error) {}
}
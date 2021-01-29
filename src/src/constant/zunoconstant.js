/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const VsCode = require("vscode");
const Path = require("path");
const Os = require("os");

let _this;
switch (VsCode.env.language)
{
	case 'ru':
		_this = require('./zunoconstant.nls.ru');
		break;
	default:
		_this = require('./zunoconstant.nls');
		break;
}

/*-------------------------------*/
_this.ZMAKE =
{
	CORE: 'cores',
	ARDUINO: Path.join('cores', 'includes', 'Arduino.h'),
	LIB: 'libraries',
	BOOT: 'bootloaders',
	BOOT_FILE: 'zuno_bootloader.bin',
	LIB_CLANG: 'libclang',
	EXE: Path.join('zme_make', Os.platform() == 'win32' ? 'zme_make.exe' : 'zme_make'),
	GCC_LIB: Path.join('gcc', 'lib', 'gcc', 'arm-none-eabi', '7.2.1', 'include'),
	GCC_EXE: Path.join('gcc', 'bin', 'arm-none-eabi-gcc'),
	GCC_BIN: Path.join('gcc', 'bin')
}

/*-------------------------------*/
_this.REGEXP =
{
	SKETCH: /\.((ino))$/
}

/*-------------------------------*/
_this.MEMORY =
{
	STORAGE: 40704,
	DYNAMIC: 8192,// FIXME эти данные лутчше сделать что бы с нитренета можно было получать
}

/*-------------------------------*/
_this.CMD =
{
	BOOTLOADER: 'zuno.bootloader',
	SECURITY: 'zuno.security',
	FREQUENCY: 'zuno.frequency',
	SKETCH: 'zuno.sketch',
	PORT: 'zuno.port',
	MONITOR: 'zuno.monitor',
	SERIALMONITOR_CURRENT_OPTIONS: 'zuno.serialmonitor.currentoptions',
	SETTING: 'zuno.settings',
	VERIFY: 'zuno.verify',
	UPLOAD: 'zuno.upload',
	INSTALL: 'zuno.install'
}

/*-------------------------------*/
_this.DIR =
{
	CORE: 'Z-Uno2G',//Нужно что бы соответсвовало скачеваему файлу от INSTALL_URL array.packages.name
	CACHE: 'cache',
	HARDWARE: 'hardware',
	TOOLS: 'tools'
}

/*-------------------------------*/
_this. BARPRIORITY =
{
	SKETCH: 80,
	BOOTLOADER: 80,
	PORT: 70,
	SECURITY: 70,
	MONITOR: 60,
	FREQUENCY: 60,
	SETTINGS: 50
}

/*-------------------------------*/
_this.FILE =
{
	JSON_URL: 'https://rus.z-wave.me/files/z-uno/g2/beta-index/package_z-wave2.me_index.json',
	JSON_LOAD: 'install.json',
	JSON_SETTING: 'setting.json'
}

/*-------------------------------*/
const _workspaceFolders = VsCode.workspace.workspaceFolders[0].uri.fsPath;//У нас плагин работает только тогда когда есть рабочая область так что норм
_this.PATH =
{
	WORKSPACE: _workspaceFolders,
	TMP_BUILD: Path.join(Os.tmpdir(), `${_this.DIR.CORE}_${new Date().getTime()}`),
	JSON_WORKSPACE: Path.join(_workspaceFolders, '.vscode', 'zuno.json'),
	JSON_DIR: Path.join(_workspaceFolders, '.vscode'),
	JSON_CPPTOOLS: Path.join(_workspaceFolders, '.vscode', 'c_cpp_properties.json')
}

_this.SERIALMONITOR_OPTIONS_BAUDRATE_LIST = ['50', '75', '110', '134', '150', '200', '300', '600', '1200', '1800', '2400', '4800', '9600', '19200', '38400', '57600', '115200', _this.SERIALMONITOR_OPTIONS_BAUDRATE_MANUAL];

_this.WORKBENCH =
{
	OPEN_GLOBAL_KEYBINDINGS: 'workbench.action.openGlobalKeybindings'
}

_this.CPP =
{
	CONFIGURATION_SELECT: 'C_Cpp.ConfigurationSelect',
	RESCAN_WORKSPACE: 'C_Cpp.RescanWorkspace'
}


module.exports = _this;
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
	LIB: 'libraries',
	BOOT: 'bootloaders',
	LIB_CLANG: 'libclang',
	LIB_FAKE: 'inc'
}

/*-------------------------------*/
_this.REGEXP =
{
	SKETCH: /\.((ino))$/,
	POWER: /(\d+)([.,](\d))$/
}

/*-------------------------------*/
_this.CMD =
{
	BOOTLOADER: 'zuno.bootloader',
	RF_LOGGING: 'zuno.rf_logging',
	SECURITY: 'zuno.security',
	FREQUENCY: 'zuno.frequency',
	POWER: 'zuno.power',
	SKETCH: 'zuno.sketch',
	PORT: 'zuno.port',
	MONITOR: 'zuno.monitor',
	BOARD: 'zuno.board',
	SERIALMONITOR_CURRENT_OPTIONS: 'zuno.serialmonitor.currentoptions',
	SETTING: 'zuno.settings',
	VERIFY: 'zuno.verify',
	UPLOAD: 'zuno.upload',
	INSTALL: 'zuno.install'
}

/*-------------------------------*/
_this.DIR =
{
	CACHE: 'cache',
	HARDWARE: 'hardware',
	TOOLS: 'tools'
}

/*-------------------------------*/
_this.BOARD_CURRENT = undefined;
_this.BOARD =
{
	ZUNO:
	{
		ZMAKE:
		{
			GCC_BIN: Path.join('zuno_toolchain', 'sdcc'),
			EXE: Path.join('zuno_toolchain', Os.platform() == 'win32' ? 'compiler.exe' : 'compiler'),
			CORE: Path.join('cores', 'zuno'),
			GCC_EXE: "",
			GCC_LIB: Path.join('zuno_toolchain', 'sdcc', 'share', 'sdcc', 'include'),
			FORCE: [Path.join('cores', 'zuno', 'Arduino.h'), Path.join('cores', 'zuno', 'ZUNO_legacy_channels.h')]
		},
		LIB_FAKE: ['Custom_pins.h', 'Custom_defs.h'],
		MEMORY:
		{
			STORAGE: 32256,
			DYNAMIC: 0,
		},
		JSON_LOAD: 'package_z-wave.me_index.json',
		JSON_URL: 'https://z-uno.z-wave.me/files/z-uno/package_z-wave.me_index.json',
		EXAMPLES: Path.join('libraries', 'Z-Uno', 'examples'),
		core: 'Z-Uno',//Нужно что бы соответсвовало скачеваему файлу от INSTALL_URL array.packages.name
		description: _this.Z_UNO_DESCRIPTION,
		security: _this.SECURITY,
		pid : 0x200,
		vid : 0x658,
		ram_match: /ram:\s*\d+/,
		text_match: /rom:\s*\d+/,
		generation: 0x1,
		power: false
	},
	ZUNO2:
	{
		ZMAKE:
		{
			GCC_BIN: Path.join('gcc', 'bin'),
			EXE: Path.join('zme_make', Os.platform() == 'win32' ? 'zme_make.exe' : 'zme_make'),
			CORE: 'cores',
			GCC_EXE: Path.join('gcc', 'bin', Os.platform() == 'win32' ? 'arm-none-eabi-gcc.exe' : 'arm-none-eabi-gcc'),
			GCC_LIB: Path.join('gcc', 'lib', 'gcc', 'arm-none-eabi', '7.2.1', 'include'),
			FORCE: [Path.join('cores', 'includes','Arduino.h')]
		},
		LIB_FAKE: ['Custom_decl.h', 'Custom_defs.h', 'ZUNO_AutoChannels.h', 'ZUNO_AutoDef.h'],
		MEMORY:
		{
			STORAGE: 40704,
			DYNAMIC: 8192,
		},
		JSON_LOAD: 'package_z-wave2.me_index.json',
		JSON_URL: 'http://z-uno.z-wave.me/files/z-uno2/package_z-wave2.me_index.json',
		EXAMPLES: Path.join('libraries', 'Z-Uno-2G', 'examples'),
		core: 'Z-Uno2',//Нужно что бы соответсвовало скачеваему файлу от INSTALL_URL array.packages.name
		description: _this.Z_UNO2_DESCRIPTION,
		security: _this.SECURITY2,
		pid : 0xEA60,
		vid : 0x10C4,
		ram_match: /ram\s*\d+/,
		text_match: /text\s*\d+/,
		generation: 0x2,
		power: true
	},
	ZUNO2_BETA:
	{
		ZMAKE:
		{
			GCC_BIN: Path.join('gcc', 'bin'),
			EXE: Path.join('zme_make', Os.platform() == 'win32' ? 'zme_make.exe' : 'zme_make'),
			CORE: 'cores',
			GCC_EXE: Path.join('gcc', 'bin', Os.platform() == 'win32' ? 'arm-none-eabi-gcc.exe' : 'arm-none-eabi-gcc'),
			GCC_LIB: Path.join('gcc', 'lib', 'gcc', 'arm-none-eabi', '7.2.1', 'include'),
			FORCE: [Path.join('cores', 'includes','Arduino.h')]
		},
		LIB_FAKE: ['Custom_decl.h', 'Custom_defs.h', 'ZUNO_AutoChannels.h', 'ZUNO_AutoDef.h'],
		MEMORY:
		{
			STORAGE: 40704,
			DYNAMIC: 8192,
		},
		JSON_LOAD: 'package_z-wave2.me_beta_index.json',
		JSON_URL: 'https://z-uno.z-wave.me/files/z-uno2/package_z-wave2.me_beta_index.json',
		EXAMPLES: Path.join('libraries', 'Z-Uno-2G', 'examples'),
		core: 'Z-Uno2 (Beta)',//Нужно что бы соответсвовало скачеваему файлу от INSTALL_URL array.packages.name
		description: _this.Z_UNO2_BETA_DESCRIPTION,
		security: _this.SECURITY2,
		pid : 0xEA60,
		vid : 0x10C4,
		ram_match: /ram\s*\d+/,
		text_match: /text\s*\d+/,
		generation: 0x2,
		power: true
	}
}

/*-------------------------------*/
_this.BARPRIORITY =
{
	SKETCH: 90,
	BOOTLOADER: 80,
	BOARD: 80,
	PORT: 70,
	SECURITY: 70,
	MONITOR: 60,
	FREQUENCY: 60,
	SETTINGS: 50
}

/*-------------------------------*/
_this.FILE =
{
	JSON_SETTING: 'setting.json'
}

/*-------------------------------*/
const _workspaceFolders = VsCode.workspace.workspaceFolders[0].uri.fsPath;//У нас плагин работает только тогда когда есть рабочая область так что норм
_this.PATH =
{
	WORKSPACE: _workspaceFolders,
	TMP_BUILD: Path.join(Os.tmpdir(), `ZUNO_${new Date().getTime()}`),
	JSON_WORKSPACE: Path.join(_workspaceFolders, '.vscode', 'zuno.json'),
	JSON_DIR: Path.join(_workspaceFolders, '.vscode'),
	JSON_CPPTOOLS: Path.join(_workspaceFolders, '.vscode', 'c_cpp_properties.json')
}

_this.SERIALMONITOR_OPTIONS_BAUDRATE_LIST = ['50', '75', '110', '134', '150', '200', '300', '600', '1200', '1800', '2400', '4800', '9600', '19200', '38400', '57600', '115200', '230400', '460800', '500000', '576000', _this.SERIALMONITOR_OPTIONS_BAUDRATE_MANUAL];

_this.WORKBENCH =
{
	OPEN_GLOBAL_KEYBINDINGS: 'workbench.action.openGlobalKeybindings'
}

_this.CPP =
{
	CONFIGURATION_SELECT: 'C_Cpp.ConfigurationSelect',
	RESCAN_WORKSPACE: 'C_Cpp.RescanWorkspace'
}

/*-------------------------------*/
_this.POWER =
{
	POWER_DEFAULT: 0,
	POWER_MAX: 140,
	POWER_MULTI: 10,
	POWER_MIN: 0
}

module.exports = _this;
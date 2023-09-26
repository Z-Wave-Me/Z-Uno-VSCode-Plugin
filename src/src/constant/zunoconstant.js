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
	POWER: /^\d+$/
}

/*-------------------------------*/
_this.CMD =
{
	BOOTLOADER: 'zuno.bootloader',
	RF_LOGGING: 'zuno.rf_logging',
	UART_BAUDRATE: 'zuno.uart_baudrate',
	ERASENVM: 'zuno.eraseNVM',
	BOARDINFO: 'zuno.boardInfo',
	LICENSE: 'zuno.license',
	PTI: 'zuno.PTI',
	SECURITY: 'zuno.security',
	FREQUENCY: 'zuno.frequency',
	POWER: 'zuno.power',
	MULTI_CHIP: 'zuno.multi_chip',
	SKETCH: 'zuno.sketch',
	PORT: 'zuno.port',
	COMPLIER_OPTIONS: 'zuno.complier_options',
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
_this.CHIP_NAME_DEFAULT = undefined;
_this.BOARD_CURRENT_DEFAULT = undefined;
_this.BOARD_CURRENT = _this.BOARD_CURRENT_DEFAULT;
_this.BOARD_LIST_CHIP_SUPPORT_DEFAULT = undefined;
_this.BOARD_LIST_CHIP_SUPPORT = _this.BOARD_LIST_CHIP_SUPPORT_DEFAULT;
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
			GCC_LIB_DEFAULT: Path.join('zuno_toolchain', 'sdcc', 'share', 'sdcc', 'include'),
			GCC_LIB: undefined,
			FORCE: [Path.join('cores', 'zuno', 'Arduino.h'), Path.join('cores', 'zuno', 'ZUNO_legacy_channels.h')]
		},
		LIB_FAKE: ['Custom_pins.h', 'Custom_defs.h'],
		MEMORY:
		{
			STORAGE_DEFAULT: 32256,
			DYNAMIC_DEFAULT: 0,
			STORAGE: 32256,
			DYNAMIC: 0,
		},
		JSON_LOAD: 'package_z-wave.me_index.json',
		JSON_URL: 'https://z-uno.z-wave.me/files/z-uno/package_z-wave.me_index.json',
		EXAMPLES: Path.join('libraries', 'Z-Uno', 'examples'),
		chip_name: 'STM',
		core: 'Z-Uno',//Нужно что бы соответсвовало скачеваему файлу от INSTALL_URL array.packages.name
		description: _this.Z_UNO_DESCRIPTION,
		security: _this.SECURITY,
		pid : 0x200,
		vid : 0x658,
		ram_match: /ram:\s*\d+/,
		text_match: /rom:\s*\d+/,
		generation: 0x1,
		power: false,
		PTI: false,
		boardInfo: false,
		license: false,
		uart_baudrate: false
	},
	ZUNO2:
	{
		ZMAKE:
		{
			GCC_BIN: Path.join('gcc', 'bin'),
			EXE: Path.join('zme_make', Os.platform() == 'win32' ? 'zme_make.exe' : 'zme_make'),
			CORE: 'cores',
			GCC_EXE: Path.join('gcc', 'bin', Os.platform() == 'win32' ? 'arm-none-eabi-gcc.exe' : 'arm-none-eabi-gcc'),
			GCC_LIB_DEFAULT: Path.join('gcc', 'lib', 'gcc', 'arm-none-eabi', '7.2.1', 'include'),
			GCC_LIB: undefined,
			FORCE: [Path.join('cores', 'includes','Arduino.h')]
		},
		LIB_FAKE: ['Custom_decl.h', 'Custom_defs.h', 'ZUNO_AutoChannels.h', 'ZUNO_AutoDef.h'],
		MEMORY:
		{
			STORAGE_DEFAULT: 40704,
			DYNAMIC_DEFAULT: 8192,
			STORAGE: 40704,
			DYNAMIC: 8192,
		},
		JSON_LOAD: 'package_z-wave2.me_index.json',
		JSON_URL: 'http://z-uno.z-wave.me/files/z-uno2/package_z-wave2.me_index.json',
		EXAMPLES: Path.join('libraries', 'Z-Uno-2G', 'examples'),
		chip_name: 'ZGM130S037HGN1',
		core: 'Z-Uno2',//Нужно что бы соответсвовало скачеваему файлу от INSTALL_URL array.packages.name
		description: _this.Z_UNO2_DESCRIPTION,
		security: _this.SECURITY2,
		pid : 0xEA60,
		vid : 0x10C4,
		ram_match: /ram\s*\d+/,
		text_match: /text\s*\d+/,
		generation: 0x2,
		power: true,
		PTI: true,
		boardInfo: true,
		license: true,
		uart_baudrate: false
	},
	ZUNO2_BETA:
	{
		ZMAKE:
		{
			GCC_BIN: Path.join('gcc', 'bin'),
			EXE: Path.join('zme_make', Os.platform() == 'win32' ? 'zme_make.exe' : 'zme_make'),
			CORE: 'cores',
			GCC_EXE: Path.join('gcc', 'bin', Os.platform() == 'win32' ? 'arm-none-eabi-gcc.exe' : 'arm-none-eabi-gcc'),
			GCC_LIB_DEFAULT: Path.join('gcc', 'lib', 'gcc', 'arm-none-eabi', '7.2.1', 'include'),
			GCC_LIB: undefined,
			FORCE: [Path.join('cores', 'includes','Arduino.h')]
		},
		LIB_FAKE: ['Custom_decl.h', 'Custom_defs.h', 'ZUNO_AutoChannels.h', 'ZUNO_AutoDef.h'],
		MEMORY:
		{
			STORAGE_DEFAULT: 40704,
			DYNAMIC_DEFAULT: 8192,
			STORAGE: 40704,
			DYNAMIC: 8192,
		},
		JSON_LOAD: 'package_z-wave2.me_beta_index.json',
		JSON_URL: 'https://z-uno.z-wave.me/files/z-uno2/package_z-wave2.me_beta_index.json',
		EXAMPLES: Path.join('libraries', 'Z-Uno-2G', 'examples'),
		chip_name: 'ZGM130S037HGN1',
		core: 'Z-Uno2 (Beta)',//Нужно что бы соответсвовало скачеваему файлу от INSTALL_URL array.packages.name
		description: _this.Z_UNO2_BETA_DESCRIPTION,
		security: _this.SECURITY2,
		pid : 0xEA60,
		vid : 0x10C4,
		ram_match: /ram\s*\d+/,
		text_match: /text\s*\d+/,
		generation: 0x2,
		power: true,
		PTI: true,
		boardInfo: true,
		license: true,
		uart_baudrate: false
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
	TMP_BUILD: Path.join(Os.tmpdir(), 'z-waveme.vscode-zuno'),
	JSON_WORKSPACE: Path.join(_workspaceFolders, '.vscode', 'zuno.json'),
	JSON_DIR: Path.join(_workspaceFolders, '.vscode'),
	JSON_CPPTOOLS: Path.join(_workspaceFolders, '.vscode', 'c_cpp_properties.json')
}

_this.SERIALMONITOR_OPTIONS_BAUDRATE_LIST = ['50', '75', '110', '134', '150', '200', '300', '600', '1200', '1800', '2400', '4800', '9600', '19200', '38400', '57600', '115200', '230400', '460800', '500000', '576000', _this.SERIALMONITOR_OPTIONS_BAUDRATE_MANUAL];

_this.UTILITES_PTI_OPTIONS_BAUDRATE_LIST = ['230400', '460800', '500000', '576000', _this.UTILITES_PTI_OPTIONS_BAUDRATE_MANUAL];

_this.WORKBENCH =
{
	OPEN_GLOBAL_KEYBINDINGS: 'workbench.action.openGlobalKeybindings',
	RELOAD_WINDOW: 'workbench.action.reloadWindow'
}

_this.CPP =
{
	CONFIGURATION_SELECT: 'C_Cpp.ConfigurationSelect',
	RESCAN_WORKSPACE: 'C_Cpp.RescanWorkspace'
}

/*-------------------------------*/
_this.POWER =
{
	POWER_DEFAULT: 40,
	POWER_MAX: 220,
	POWER_MIN: 1
}

/*-------------------------------*/
_this.UART_BAUDRATE =
{
	DEFAULT: 230400,
	LIST: [115200, 230400, 460800, 921600]
}

_this.FREQUENCY_DEFAULT_KEY = 'EU'
_this.FREQUENCY_DICT_ARRAY =
[
	{"freq": 'ANZ', "description": 'Australia & New Zealand, Brazil'},
	{"freq": 'CN', "description": 'China'},
	{"freq": 'EU', "description": 'Europe'},
	{"freq": 'HK', "description": 'Hong Kong'},
	{"freq": 'IL', "description": 'Israel'},
	{"freq": 'IN', "description": 'India'},
	{"freq": 'JP', "description": 'Japan'},
	{"freq": 'KR', "description": 'Korea'},
	{"freq": 'RU', "description": 'Russian'},
	{"freq": 'US', "description": 'USA'}
]

module.exports = _this;
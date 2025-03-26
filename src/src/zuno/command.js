/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";//Файлы не должны иметь ЗАГЛАВНЫЕ буквы иначе отладка не работает правельно

//Подключаем необходимые модули
const VsCode = require("vscode");
const Path = require("path");
const Fs = require('fs');
const Os = require("os");

const string = require("../common/string");
const File = require("../common/file");
const Run = require("../common/run");

const Output = require("./output");
const Config = require("./config");
const StatusBar = require("./statusbar");
const Task = require("./task");
const VsConfig = require("./vsconfig");
const SerialMonitor = require("./serialmonitor");
const ZunoConstant = require("../constant/zunoconstant");
const Constant = require("../constant/constant");

const CommandGeneral = require("./command_general");
const CommandInstall = require("./command_install");
const CppTools = require("./command_cpptools");
const CommandUpdate = require("./command_update");

const Examples = require("./examples");

//Создаем обьект для эксорта комманд
const _this = {
	b_install: false,//Указывает начали установку и формирования списка для вывода или нет
	init: async function(context, path_install, array_host)
	{
		_this.path_install = path_install;//Путь там где файлы для сборки лежат
		_this.array_host = array_host;//Хост системы для конфига качаемого
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.SKETCH, _this.sketch));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.FREQUENCY, _this.frequency));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.SKETCH_ENCRYPTION, _this.sketch_encryption));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.UART_BAUDRATE, _this.uart_baudrate));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.POWER, _this.power));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.MULTI_CHIP, _this.multi_chip));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.BOOTLOADER, _this.bootloader));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.SECURITY, _this.security));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.RF_LOGGING, _this.rf_logging));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.ERASENVM, _this.eraseNVM));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.BOARDINFO, _this.boardInfo));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.LICENSE, _this.license));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.PTI, _this.PTI));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.PORT, _this.port));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.COMPLIER_OPTIONS, _this.complier_options));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.BOARD, _this.board));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.MONITOR, _this.monitor));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.SETTING, _this.settings));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.VERIFY, _this.verify));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.UPLOAD, _this.verify, _this));//_this - дает понять что раз контекст есть значит upload а не verify
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.INSTALL, _this.install));
		StatusBar.board.init();
		ZunoConstant.BOARD_CURRENT = StatusBar.board.getArray();
		StatusBar.sketch.init(context);
		StatusBar.monitor.init();
		StatusBar.settings.init();
		StatusBar.port.init();
		SerialMonitor.init(context);
		_checkFile(path_install, array_host, context);
	},
	board: async function()
	{
		const select = await VsCode.window.showQuickPick(StatusBar.board.getArrayString(), {placeHolder: `${StatusBar.board.get()} - ${ZunoConstant.BOARD_PLACEHOLDER}`});
		if (select == undefined)
			return ;
		if (select.label == ZunoConstant.BOARD_CURRENT.core)
			return ;
		Config.setBoard(select.label);
		StatusBar.board.set(select.label);
		await VsCode.commands.executeCommand(ZunoConstant.WORKBENCH.RELOAD_WINDOW);
	},
	monitor: async function()
	{
		SerialMonitor.openMonitor();
	},
	rf_logging: async function()
	{
		const rf_logging = StatusBar.rf_logging.get();
		const select = await VsCode.window.showQuickPick(ZunoConstant.RF_LOGGING.map((element) => {
			return {description: element[1], label: element[0], _zuno_tmp: element[2]};
		}), {placeHolder: `${rf_logging[0]} - ${rf_logging[1]}`});
		if (select == undefined)
			return (false);
		const out = select.label;
		Config.setRfLogging(out);
		StatusBar.rf_logging.set([out, select.description, select._zuno_tmp]);
		return (out);
	},
	security: async function()
	{
		const security = StatusBar.security.get();
		const select = await VsCode.window.showQuickPick(ZunoConstant.BOARD_CURRENT.security.map((element) => {
			return {description: element[1], label: element[0], _zuno_tmp: element[2]};
		}), {placeHolder: `${security[0]} - ${security[1]}`});
		if (select == undefined)
			return (false);
		const out = select.label;
		Config.setSecurity(out);
		StatusBar.security.set([out, select.description, select._zuno_tmp]);
		return (out);
	},
	multi_chip: async function()
	{
		if (ZunoConstant.BOARD_LIST_CHIP_SUPPORT == ZunoConstant.BOARD_LIST_CHIP_SUPPORT_DEFAULT)
			return (false);
		const multi_chip = StatusBar.multi_chip.get();
		const select = await VsCode.window.showQuickPick(ZunoConstant.BOARD_LIST_CHIP_SUPPORT.map((element) => {
			return {label: element[0]};
		}), {placeHolder: `${multi_chip}`});
		if (select == undefined)
			return (false);
		StatusBar.multi_chip.set(select.label);
		Config.setMultiChip(select.label);
		await VsCode.commands.executeCommand(ZunoConstant.WORKBENCH.RELOAD_WINDOW);
		return (select.label);
	},
	power: async function()
	{
		let not_regular = ZunoConstant.POWER_NOT_REGULAR.replace("%min%", ZunoConstant.POWER.POWER_MIN);
		not_regular = not_regular.replace("%max%", ZunoConstant.POWER.POWER_MAX);
		if (ZunoConstant.BOARD_CURRENT.power == false)
			return (false);
		let pow = StatusBar.power.get();
		const select = await VsCode.window.showInputBox({
			placeHolder: pow,
			validateInput: async (value) => {
				if (value && ZunoConstant.REGEXP.POWER.test(value.trim()) == true)
				{
					value = value.trim();
					if (value < ZunoConstant.POWER.POWER_MIN || value > ZunoConstant.POWER.POWER_MAX)
						return (not_regular);
					return (null);
				}
				else
					return (not_regular);
			}
		});
		if (select == undefined)
			return (false);
		pow = select.trim();
		Config.setPower(pow);
		StatusBar.power.set(pow);
		return (pow);

	},
	complier_options: async function()
	{
		if (ZunoConstant.BOARD_CURRENT.generation == 0x1)
			return ("");
		const complier_options = await VsCode.window.showInputBox({
			placeHolder: ZunoConstant.COMPLIER_OPTIONS_PLACEHOLDER,
		});
		if (complier_options == undefined)
			return (false);
		Config.setComplierOptions(complier_options);
		StatusBar.complier_options.set(complier_options);
		return (complier_options);
	},
	utilities: async function()
	{
		const options =
		[
			['eraseNVM', ZunoConstant.UTILITES_ERASENVM_PLACEHOLDER]
		];
		if (ZunoConstant.BOARD_CURRENT.PTI == true)
			options.push(['PTI', ZunoConstant.UTILITES_PTI_PLACEHOLDER]);
		if (ZunoConstant.BOARD_CURRENT.boardInfo == true)
			options.push(['boardInfo', ZunoConstant.UTILITES_BOARDINFO_PLACEHOLDER]);
		if (ZunoConstant.BOARD_CURRENT.license == true)
			options.push(['license', ZunoConstant.UTILITES_LICENSE_PLACEHOLDER]);
		const select = await VsCode.window.showQuickPick(options.map((element) => {
			return {description: element[1], label: element[0]};
		}), {placeHolder: ZunoConstant.UTILITES_PLACEHOLDER});
		if (select == undefined)
			return ;
		switch (select.label)
		{
			case 'eraseNVM':
				await _this.eraseNVM();
				break ;
			case 'PTI':
				await _this.PTI();
				break ;
			case 'boardInfo':
				await _this.boardInfo();
				break ;
			case 'license':
				await _this.license();
				break ;
		}
	},
	uart_baudrate: async function()
	{
		if (ZunoConstant.BOARD_CURRENT.uart_baudrate == false)
			return (false);
		const uart_baudrate = StatusBar.uart_baudrate.get();
		const select = await VsCode.window.showQuickPick(ZunoConstant.UART_BAUDRATE.LIST.map((element) => {
			return {description: "baud rate", label: "" + element};
		}), {placeHolder: `${uart_baudrate} - baud rate`});
		if (select == undefined)
			return (false);
		const out = Number(select.label);
		Config.setUartBaudrate(out);
		StatusBar.uart_baudrate.set(out);
		return (out);
	},
	frequency: async function()
	{
		const freq = StatusBar.frequency.get();
		const select = await VsCode.window.showQuickPick(ZunoConstant.FREQUENCY_DICT_ARRAY.map((element) => {
			return {description: element["description"], label: element["freq"]};
		}), {placeHolder: `${freq["freq"]} - ${freq["description"]}`});
		if (select == undefined)
			return (false);
		select["freq"] = select["label"];
		Config.setFrequency(select["freq"]);
		StatusBar.frequency.set(select);
		return (select["freq"]);
	},
	sketch_encryption: async function()
	{
		if (ZunoConstant.BOARD_CURRENT.sketch_encryption == false)
			return (false);
		const key = StatusBar.sketch_encryption.get();
		const select = await VsCode.window.showQuickPick(ZunoConstant.SKETCH_ENCRYPTION_DICT_ARRAY.map((element) => {
			return {description: element["description"], label: element["key"]};
		}), {placeHolder: `${key["key"]} - ${key["description"]}`});
		if (select == undefined)
			return (false);
		select["key"] = select["label"];
		Config.setSketchEncryption(select["key"]);
		StatusBar.sketch_encryption.set(select);
		return (select["key"]);
	},
	settings: async function()
	{
		let options =
		[
			['security', StatusBar.security.get()[0], ZunoConstant.SECURITY_PLACEHOLDER],
			['frequency', StatusBar.frequency.get()["freq"], ZunoConstant.FREQUENCY_PLACEHOLDER],
			['rf_logging', StatusBar.rf_logging.get()[0], ZunoConstant.RF_LOGGING_PLACEHOLDER]
		];
		if (ZunoConstant.BOARD_CURRENT.uart_baudrate == true)
		{
			let value = StatusBar.uart_baudrate.get();
			let placeholder = ZunoConstant.UART_BAUDRATE_PLACEHOLDER;
			let placeholder_replace = ""
			for (let i = 0; i < ZunoConstant.UART_BAUDRATE.LIST.length; i++) {
				placeholder_replace = placeholder_replace + ZunoConstant.UART_BAUDRATE.LIST[i]
				if (i < ZunoConstant.UART_BAUDRATE.LIST.length - 0x1)
					placeholder_replace = placeholder_replace + ", "
			}
			placeholder = placeholder.replace("%baudrate%", placeholder_replace);
			options.push(['uart_baudrate', value + ' baud rate', placeholder]);
		}
		if (ZunoConstant.BOARD_CURRENT.power == true)
		{
			let value = StatusBar.power.get();
			let placeholder = ZunoConstant.POWER_PLACEHOLDER.replace("%min%", ZunoConstant.POWER.POWER_MIN);
			placeholder = placeholder.replace("%max%", ZunoConstant.POWER.POWER_MAX);
			options.push(['power', value + ' raw', placeholder]);
		}
		if (ZunoConstant.BOARD_CURRENT.sketch_encryption == true)
		{
			options.push(['sketch_encryption', StatusBar.sketch_encryption.get()["key"], ZunoConstant.SKETCH_ENCRYPTION_PLACEHOLDER],);
		}
		if (ZunoConstant.BOARD_CURRENT.generation != 0x1)
		{
			let value = StatusBar.complier_options.get();
			options.push(['complier_options', '"' + value + '"', ZunoConstant.COMPLIER_OPTIONS_PLACEHOLDER]);
		}
		if (ZunoConstant.BOARD_LIST_CHIP_SUPPORT != ZunoConstant.BOARD_LIST_CHIP_SUPPORT_DEFAULT)
		{
			let value = StatusBar.multi_chip.get();
			options.push(['multi_chip', value, ZunoConstant.MULTI_CHIP_PLACEHOLDER]);
		}
		options.push(['utilities', ZunoConstant.UTILITES_DEFAULT, ZunoConstant.UTILITES_PLACEHOLDER]);
		while (0xFF)
		{
			let index = 0;
			const select = await VsCode.window.showQuickPick(options.map((element) => {
				return {description: element[2], label: element[1], index: index++};
			}), {placeHolder: ZunoConstant.SETTINGS_TOOLTIP});
			if (select == undefined)
				return ;
			const element = options[select.index];
			switch (element[0])
			{
				case 'utilities':
					await _this.utilities();
					break;
				case 'rf_logging':
					const rf_logging = await _this.rf_logging();
					if (rf_logging == false)
						break ;
					element[1] = rf_logging;
					break;
				case 'security':
					const security = await _this.security();
					if (security == false)
						break ;
					element[1] = security;
					break;
				case 'frequency':
					const frequency = await _this.frequency();
					if (frequency == false)
						break ;
					element[1] = frequency;
					break;
				case 'sketch_encryption':
					const sketch_encryption = await _this.sketch_encryption();
					if (sketch_encryption == false)
						break ;
					element[1] = sketch_encryption;
					break;
				case 'multi_chip':
					const multi_chip = await _this.multi_chip();
					if (multi_chip == false)
						break ;
					element[1] = multi_chip;
					break;
				case 'power':
					const power = await _this.power();
					if (power == false)
						break ;
					element[1] = power + ' raw';
					break;
				case 'uart_baudrate':
					const uart_baudrate = await _this.uart_baudrate();
					if (uart_baudrate == false)
						break ;
					element[1] = uart_baudrate + ' baud rate';
					break;
				case 'complier_options':
					const complier_options = await _this.complier_options();
					if (complier_options == false)
						break ;
					element[1] = '"' + complier_options + '"';
					break;
			}
		}
	},
	license: async function()
	{
		if (ZunoConstant.BOARD_CURRENT.license == false)
			return ;
		if (CommandGeneral.installProloge(_this, _this.path_install, _this.array_host) == false)
			return ;
		const number_license = await VsCode.window.showInputBox({
			placeHolder: ZunoConstant.UTILITES_LICENSE_MANUAL_PLACEHOLDER,
			validateInput: async (value) => {
				if (value.length != 48)
					return (ZunoConstant.UTILITES_LICENSE_MANUAL_LENGTH_PLACEHOLDER);
				if (/^[A-F\d]+$/.test(value) == false)
					return (ZunoConstant.UTILITES_LICENSE_MANUAL_SYMBOL_PLACEHOLDER);
				return (null);
			}
		});
		if (number_license == undefined)
			return (CommandGeneral.installEpilogue(_this));
		const zmake = Path.join(_this.path_install, ZunoConstant.BOARD_CURRENT.core, ZunoConstant.DIR.TOOLS, ZunoConstant.BOARD_CURRENT.ZMAKE.EXE);
		if (Fs.existsSync(zmake) == false)
		{
			await File.delete(Path.join(_this.path_install, ZunoConstant.BOARD_CURRENT.core));
			await File.unlink(Path.join(_this.path_install, ZunoConstant.FILE.JSON_SETTING));
			VsCode.window.showErrorMessage(ZunoConstant.INSTALL_INVALID_CORE);
			CommandGeneral.installEpilogue(_this);
			return (_this.install());
		}
		let port = StatusBar.port.get();
		if (port == false)
		{
			const ans = await VsCode.window.showInformationMessage(ZunoConstant.UTILITES_LICENSE_NOT_PORT, Constant.DIALOG_YES, Constant.DIALOG_NOT);
			if (ans != Constant.DIALOG_YES)
				return (CommandGeneral.installEpilogue(_this));
			port = await SerialMonitor.getPort(false);
			if (port == false)
				return (CommandGeneral.installEpilogue(_this));
		}
		SerialMonitor.startUpload(port);
		await VsCode.window.withProgress({
			location: VsCode.ProgressLocation.Notification,
			title: ZunoConstant.UTILITES_LICENSE_TITLE,
		}, async () => {
			const arg_license =
			[
				'writeNVM',
				'-a', '0xFFACE0',
				'-b', number_license,
				'-d', port
			];
			if (ZunoConstant.BOARD_CURRENT.uart_baudrate == true)
			{
				arg_license.push('-ub');
				arg_license.push(StatusBar.uart_baudrate.get());
			}
			SerialMonitor.pauseMonitor();//Если есть открытый монитор закрываем его что бы прошить 
			if (VsConfig.getOutputTerminal() != false)//Вывод с помощью задачи не в стандартный канал а в типа терминал
			{
				await Task.execute(zmake, arg_license, 'license');
				SerialMonitor.resumeMonitor();//Если был монтитор закрыт навремя прошивки открываем заново
				return (CommandGeneral.installEpilogue(_this));
			}
			Output.show();//Покажим кансоль если скрыта
			Output.start(`${ZunoConstant.UTILITES_LICENSE_START}`);
			let code = await Run.spawn(zmake, Output.data, Output.data, arg_license);
			SerialMonitor.resumeMonitor();//Если был монтитор закрыт навремя прошивки открываем заново
			if (code === false)
				return (_update_critical());
			else if (code != 0)
				Output.error(`${ZunoConstant.SYSTEM_EXIT_CODE}: ${code}`);
			else
				Output.end(`${ZunoConstant.UTILITES_LICENSE_END}`);
			Output.show();//Выведем все что записали в кансоль или ждать придеться долго
			return (CommandGeneral.installEpilogue(_this));
		});
	},
	boardInfo: async function()
	{
		if (ZunoConstant.BOARD_CURRENT.boardInfo == false)
			return ;
		const offset_port = 0x1;
		let port = Config.getBoardInfo_port();
		if (port == false)
			port = StatusBar.port.get();
		const array = 
		[
			['open', ZunoConstant.UTILITES_BOARDINFO_OPTIONS_TEXT, ZunoConstant.UTILITES_BOARDINFO_OPTIONS_DECRIPTION],
			['port', (port == false) ? ZunoConstant.PORT_BAR_TEXT : port, ZunoConstant.PORT_PLACEHOLDER]
		];
		const array_old =
		[
			['open', ZunoConstant.UTILITES_BOARDINFO_OPTIONS_TEXT, ZunoConstant.UTILITES_BOARDINFO_OPTIONS_DECRIPTION],
			['port', (port == false) ? ZunoConstant.PORT_BAR_TEXT : port, ZunoConstant.PORT_PLACEHOLDER]
		];
		while (0xFF)
		{
			let index = 0;
			const select = await VsCode.window.showQuickPick(array.map((element) => {
				return {description: element[2], label: element[1], index: index++};
			}), {placeHolder: ZunoConstant.UTILITES_BOARDINFO_OPTIONS_PLACEHOLDER});
			if (select == undefined)
				return (_openOptionsConversionBoardInfo(array, array_old));
			const element = array[select.index];
			switch (element[0])
			{
				case 'open':
					if (array[offset_port][0x1] == ZunoConstant.PORT_BAR_TEXT)
					{
						const ans = await VsCode.window.showInformationMessage(ZunoConstant.UTILITES_BOARDINFO_NOT_PORT, Constant.DIALOG_YES, Constant.DIALOG_NOT);
						if (ans != Constant.DIALOG_YES)
							return (_openOptionsConversionBoardInfo(array, array_old));
						port = await SerialMonitor.getPort(false);
						if (port == false)
							break ;
						array[offset_port][0x1] = port;
						break ;
					}
					_openOptionsConversionBoardInfo(array, array_old)
					if (CommandGeneral.installProloge(_this, _this.path_install, _this.array_host) == false)
						return ;
					const zmake = Path.join(_this.path_install, ZunoConstant.BOARD_CURRENT.core, ZunoConstant.DIR.TOOLS, ZunoConstant.BOARD_CURRENT.ZMAKE.EXE);
					if (Fs.existsSync(zmake) == false)
					{
						await File.delete(Path.join(_this.path_install, ZunoConstant.BOARD_CURRENT.core));
						await File.unlink(Path.join(_this.path_install, ZunoConstant.FILE.JSON_SETTING));
						VsCode.window.showErrorMessage(ZunoConstant.INSTALL_INVALID_CORE);
						CommandGeneral.installEpilogue(_this);
						return (_this.install());
					}
					port = array[offset_port][0x1];
					SerialMonitor.startUpload(port);
					await VsCode.window.withProgress({
						location: VsCode.ProgressLocation.Notification,
						title: ZunoConstant.UTILITES_BOARDINFO_TITLE,
					}, async () => {
						const arg_boardInfo =
						[
							'boardInfo',
							'-d', port
						];
						if (ZunoConstant.BOARD_CURRENT.uart_baudrate == true)
						{
							arg_boardInfo.push('-ub');
							arg_boardInfo.push(StatusBar.uart_baudrate.get());
						}
						SerialMonitor.pauseMonitor();//Если есть открытый монитор закрываем его что бы прошить 
						if (VsConfig.getOutputTerminal() != false)//Вывод с помощью задачи не в стандартный канал а в типа терминал
						{
							await Task.execute(zmake, arg_boardInfo, 'path_bootloader');
							SerialMonitor.resumeMonitor();//Если был монтитор закрыт навремя прошивки открываем заново
							return (CommandGeneral.installEpilogue(_this));
						}
						Output.show();//Покажим кансоль если скрыта
						Output.start(`${ZunoConstant.UTILITES_BOARDINFO_START}`);
						let code = await Run.spawn(zmake, Output.data, Output.data, arg_boardInfo);
						SerialMonitor.resumeMonitor();//Если был монтитор закрыт навремя прошивки открываем заново
						if (code === false)
							return (_update_critical());
						else if (code != 0)
							Output.error(`${ZunoConstant.SYSTEM_EXIT_CODE}: ${code}`);
						else
							Output.end(`${ZunoConstant.UTILITES_BOARDINFO_END}`);
						Output.show();//Выведем все что записали в кансоль или ждать придеться долго
						return (CommandGeneral.installEpilogue(_this));
					});
					return ;
				case 'port':
					port = await SerialMonitor.getPort((element[1] == ZunoConstant.PORT_BAR_TEXT) ? false : element[1]);
					element[1] = (port == false) ? ZunoConstant.PORT_BAR_TEXT : port, ZunoConstant.PORT_PLACEHOLDER;
					break;
			}
		}
	},
	PTI: async function()
	{
		if (ZunoConstant.BOARD_CURRENT.PTI == false)
			return ;
		const offset_port = 0x1;
		const offset_baudRate = 0x2;
		const offset_valid_only = 0x3;
		const offset_input = 0x4;
		const offset_output = 0x5;
		let port = Config.getPTI_port();
		if (port == false)
			port = StatusBar.port.get();
		const baudRate = String(Config.getPTI_baudRate());
		const input = Config.getPTI_input();
		const output = Config.getPTI_output();
		const valid_only = (Config.getPTI_valid_only() == false) ? Constant.DIALOG_DISABLED : Constant.DIALOG_ENABLED;
		const array = 
		[
			['open', ZunoConstant.UTILITES_PTI_OPTIONS_TEXT, ZunoConstant.UTILITES_PTI_OPTIONS_DECRIPTION],
			['port', (port == false) ? ZunoConstant.PORT_BAR_TEXT : port, ZunoConstant.PORT_PLACEHOLDER],
			['baudRate', baudRate, ZunoConstant.UTILITES_PTI_OPTIONS_BAUDRATE_DECRIPTION],
			['valid_only', valid_only, ZunoConstant.UTILITES_PTI_OPTIONS_VALID_ONLY_DECRIPTION],
			['input', (input == false) ? Constant.DIALOG_NOT_USED : input, ZunoConstant.UTILITES_PTI_OPTIONS_INPUT_DECRIPTION],
			['output', (output == false) ? Constant.DIALOG_NOT_USED : output, ZunoConstant.UTILITES_PTI_OPTIONS_OUTPUT_DECRIPTION]
		];
		const array_old =
		[
			['open', ZunoConstant.UTILITES_PTI_OPTIONS_TEXT, ZunoConstant.UTILITES_PTI_OPTIONS_DECRIPTION],
			['port', (port == false) ? ZunoConstant.PORT_BAR_TEXT : port, ZunoConstant.PORT_PLACEHOLDER],
			['baudRate', baudRate, ZunoConstant.UTILITES_PTI_OPTIONS_BAUDRATE_DECRIPTION],
			['valid_only', valid_only, ZunoConstant.UTILITES_PTI_OPTIONS_VALID_ONLY_DECRIPTION],
			['input', (input == false) ? Constant.DIALOG_NOT_USED : input, ZunoConstant.UTILITES_PTI_OPTIONS_INPUT_DECRIPTION],
			['output', (output == false) ? Constant.DIALOG_NOT_USED : output, ZunoConstant.UTILITES_PTI_OPTIONS_OUTPUT_DECRIPTION]
		];
		while (0xFF)
		{
			let index = 0;
			const select = await VsCode.window.showQuickPick(array.map((element) => {
				return {description: element[2], label: element[1], index: index++};
			}), {placeHolder: ZunoConstant.UTILITES_PTI_OPTIONS_PLACEHOLDER});
			if (select == undefined)
				return (_openOptionsConversionPti(array, array_old));
			const element = array[select.index];
			switch (element[0])
			{
				case 'open':
					if (array[offset_port][0x1] == ZunoConstant.PORT_BAR_TEXT)
					{
						const ans = await VsCode.window.showInformationMessage(ZunoConstant.UTILITES_PTI_OPTIONS_NOT_PORT, Constant.DIALOG_YES, Constant.DIALOG_NOT);
						if (ans != Constant.DIALOG_YES)
							return (_openOptionsConversionPti(array, array_old));
						const port = await SerialMonitor.getPort(false);
						if (port == false)
							break ;
						array[1][1] = port;
						break ;
					}
					_openOptionsConversionPti(array, array_old)
					const options =
					[
						'tracer',
						'-d', array[offset_port][0x1],
						'-b', array[offset_baudRate][0x1],
						'-vo', (array[offset_valid_only][0x1] == Constant.DIALOG_DISABLED) ? 'False': 'True'
					];
					if (array[offset_input][0x1] != Constant.DIALOG_NOT_USED)
						options.push('-i', array[offset_input][0x1]);
					if (array[offset_output][0x1] != Constant.DIALOG_NOT_USED)
						options.push('-o', array[offset_output][0x1]);
					const tools = Path.join(_this.path_install, ZunoConstant.BOARD_CURRENT.core, ZunoConstant.DIR.TOOLS);
					const zmake = Path.join(tools, ZunoConstant.BOARD_CURRENT.ZMAKE.EXE);
					if (Fs.existsSync(zmake) == false)
					{
						await File.delete(Path.join(_this.path_install, ZunoConstant.BOARD_CURRENT.core));
						await File.unlink(Path.join(_this.path_install, ZunoConstant.FILE.JSON_SETTING));
						VsCode.window.showErrorMessage(ZunoConstant.INSTALL_INVALID_CORE);
						return (_this.install());
					}
					Task.execute(zmake, options, "PTI")
					return ;
				case 'port':
					const port = await SerialMonitor.getPort((element[1] == ZunoConstant.PORT_BAR_TEXT) ? false : element[1]);
					element[1] = (port == false) ? ZunoConstant.PORT_BAR_TEXT : port, ZunoConstant.PORT_PLACEHOLDER;
					break;
				case 'baudRate':
					element[1] = await _getBaudRatePti(element[1]);
					break;
				case 'input':
					element[1] = await _ptiGetPathFile(element[1]);
					break ;
				case 'output':
					element[1] = await _ptiGetPathFile(element[1]);
					break ;
				case 'valid_only':
					element[1] = await _ptiValidOnly(element[1]);
					break ;
			}
		}
	},
	eraseNVM: async function()
	{
		if (CommandGeneral.installProloge(_this, _this.path_install, _this.array_host) == false)
			return ;
		const zmake = Path.join(_this.path_install, ZunoConstant.BOARD_CURRENT.core, ZunoConstant.DIR.TOOLS, ZunoConstant.BOARD_CURRENT.ZMAKE.EXE);
		if (Fs.existsSync(zmake) == false)
		{
			await File.delete(Path.join(_this.path_install, ZunoConstant.BOARD_CURRENT.core));
			await File.unlink(Path.join(_this.path_install, ZunoConstant.FILE.JSON_SETTING));
			VsCode.window.showErrorMessage(ZunoConstant.INSTALL_INVALID_CORE);
			CommandGeneral.installEpilogue(_this);
			return (_this.install());
		}
		const port =StatusBar.port.get();
		if (port == false)
		{
			VsCode.window.showInformationMessage(ZunoConstant.UPLOAD_SELECT_PORT);
			VsCode.commands.executeCommand(ZunoConstant.CMD.PORT);
			return (CommandGeneral.installEpilogue(_this));
		}
		SerialMonitor.startUpload(port);
		await VsCode.window.withProgress({
			location: VsCode.ProgressLocation.Notification,
			title: ZunoConstant.UTILITES_ERASENVM_TITLE,
		}, async () => {
			let arg_bootloader;
			if (ZunoConstant.BOARD_CURRENT.generation == 0x1)
			{
				arg_bootloader = [
					'erase',
					'-d', port
				];
			}
			else
			{
				arg_bootloader = [
					'eraseNVM',
					'-d', port
				];
			}
			if (ZunoConstant.BOARD_CURRENT.uart_baudrate == true)
			{
				arg_bootloader.push('-ub');
				arg_bootloader.push(StatusBar.uart_baudrate.get());
			}
			SerialMonitor.pauseMonitor();//Если есть открытый монитор закрываем его что бы прошить 
			if (VsConfig.getOutputTerminal() != false)//Вывод с помощью задачи не в стандартный канал а в типа терминал
			{
				await Task.execute(zmake, arg_bootloader, path_bootloader);
				SerialMonitor.resumeMonitor();//Если был монтитор закрыт навремя прошивки открываем заново
				return (CommandGeneral.installEpilogue(_this));
			}
			Output.show();//Покажим кансоль если скрыта
			Output.start(`${ZunoConstant.UTILITES_ERASENVM_START}`);
			let code = await Run.spawn(zmake, Output.data, Output.data, arg_bootloader);
			SerialMonitor.resumeMonitor();//Если был монтитор закрыт навремя прошивки открываем заново
			if (code === false)
				return (_update_critical());
			else if (code != 0)
				Output.error(`${ZunoConstant.SYSTEM_EXIT_CODE}: ${code}`);
			else
				Output.end(`${ZunoConstant.UTILITES_ERASENVM_END}`);
			Output.show();//Выведем все что записали в кансоль или ждать придеться долго
			return (CommandGeneral.installEpilogue(_this));
		});
	},
	bootloader: async function()
	{
		if (CommandGeneral.installProloge(_this, _this.path_install, _this.array_host) == false)
			return ;
		const path_bootloader = Path.join(_this.path_install, ZunoConstant.BOARD_CURRENT.core, ZunoConstant.DIR.HARDWARE, ZunoConstant.ZMAKE.BOOT);
		const zmake = Path.join(_this.path_install, ZunoConstant.BOARD_CURRENT.core, ZunoConstant.DIR.TOOLS, ZunoConstant.BOARD_CURRENT.ZMAKE.EXE);
		if (Fs.existsSync(path_bootloader) == false || Fs.existsSync(zmake) == false)
		{
			await File.delete(Path.join(_this.path_install, ZunoConstant.BOARD_CURRENT.core));
			await File.unlink(Path.join(_this.path_install, ZunoConstant.FILE.JSON_SETTING));
			VsCode.window.showErrorMessage(ZunoConstant.INSTALL_INVALID_CORE);
			CommandGeneral.installEpilogue(_this);
			return (_this.install());
		}
		const port =StatusBar.port.get();
		if (port == false)
		{
			VsCode.window.showInformationMessage(ZunoConstant.UPLOAD_SELECT_PORT);
			VsCode.commands.executeCommand(ZunoConstant.CMD.PORT);
			return (CommandGeneral.installEpilogue(_this));
		}
		SerialMonitor.startUpload(port);
		await VsCode.window.withProgress({
			location: VsCode.ProgressLocation.Notification,
			title: ZunoConstant.UPLOAD_BOOTLOADER_TITLE,
		}, async () => {
			let arg_bootloader;
			if (ZunoConstant.BOARD_CURRENT.generation == 0x1)
			{
				arg_bootloader = [
					'boot',
					'-p', path_bootloader,
					'--param', `sec=${StatusBar.security.get()[2]}`,
					'-fr', StatusBar.frequency.get()["freq"],
					'-d', port
				];
			}
			else
			{
				arg_bootloader = [
					'boot',
					'-c', path_bootloader,
					'-d', port,
					'-i'
				];
			}
			if (ZunoConstant.BOARD_CURRENT.uart_baudrate == true)
			{
				arg_bootloader.push('-ub');
				arg_bootloader.push(StatusBar.uart_baudrate.get());
			}
			SerialMonitor.pauseMonitor();//Если есть открытый монитор закрываем его что бы прошить 
			if (VsConfig.getOutputTerminal() != false)//Вывод с помощью задачи не в стандартный канал а в типа терминал
			{
				await Task.execute(zmake, arg_bootloader, path_bootloader);
				SerialMonitor.resumeMonitor();//Если был монтитор закрыт навремя прошивки открываем заново
				return (CommandGeneral.installEpilogue(_this));
			}
			Output.show();//Покажим кансоль если скрыта
			Output.start(`${ZunoConstant.UPLOAD_BOOTLOADER_START}`);
			let code = await Run.spawn(zmake, Output.data, Output.data, arg_bootloader);
			SerialMonitor.resumeMonitor();//Если был монтитор закрыт навремя прошивки открываем заново
			if (code === false)
				return (_update_critical());
			else if (code != 0)
				Output.error(`${ZunoConstant.SYSTEM_EXIT_CODE}: ${code}`);
			else
				Output.end(`${ZunoConstant.UPLOAD_BOOTLOADER_END}`);
			Output.show();//Выведем все что записали в кансоль или ждать придеться долго
			return (CommandGeneral.installEpilogue(_this));
		});
	},
	verify: async function()
	{
		if (CommandGeneral.installProloge(_this, _this.path_install, _this.array_host) == false)
			return ;
		const array = await CommandUpdate.getSketch();
		if (array == false)
		{
			VsCode.window.showInformationMessage(ZunoConstant.UPLOAD_SELECT_SKETH);
			VsCode.commands.executeCommand(ZunoConstant.CMD.SKETCH);
			return (CommandGeneral.installEpilogue(_this));
		}
		const sketch = array.sketch;
		const path_sketch = array.path_sketch;
		if (Fs.existsSync(path_sketch) == false)
		{
			VsCode.window.showWarningMessage(`${Constant.FILE_NOT} : ${path_sketch}`);
			VsCode.window.showInformationMessage(ZunoConstant.UPLOAD_SELECT_SKETH);
			VsCode.commands.executeCommand(ZunoConstant.CMD.SKETCH);
			return (CommandGeneral.installEpilogue(_this));
		}
		const hardware = Path.join(_this.path_install, ZunoConstant.BOARD_CURRENT.core, ZunoConstant.DIR.HARDWARE);
		const tools = Path.join(_this.path_install, ZunoConstant.BOARD_CURRENT.core, ZunoConstant.DIR.TOOLS);
		const tmp = StatusBar.sketch.getTmp(path_sketch);
		if (Fs.existsSync(tmp) == false)
		{
			if (await File.mkdir(tmp, {recursive: true}) == false)
			{
				VsCode.window.showErrorMessage(`${Constant.FILE_FAILED_DIR} : ${tmp}`);
				return (CommandGeneral.installEpilogue(_this));
			}
		}
		const zmake = Path.join(tools, ZunoConstant.BOARD_CURRENT.ZMAKE.EXE);
		if (Fs.existsSync(zmake) == false)
		{
			await File.delete(Path.join(_this.path_install, ZunoConstant.BOARD_CURRENT.core));
			await File.unlink(Path.join(_this.path_install, ZunoConstant.FILE.JSON_SETTING));
			VsCode.window.showErrorMessage(ZunoConstant.INSTALL_INVALID_CORE);
			CommandGeneral.installEpilogue(_this);
			return (_this.install());
		}
		const port = StatusBar.port.get();
		if (this != undefined && port == false)
		{
			VsCode.window.showInformationMessage(ZunoConstant.UPLOAD_SELECT_PORT);
			VsCode.commands.executeCommand(ZunoConstant.CMD.PORT);
			return (CommandGeneral.installEpilogue(_this));
		}
		if (this != undefined)//Если шить будем то подготовимся к остановке монитора
			SerialMonitor.startUpload(port);
		await VsCode.workspace.saveAll(false);//Сохраним все что еще не сохранил - что бы актыально было
		await VsCode.window.withProgress({
			location: VsCode.ProgressLocation.Notification,
			title: ((this == undefined)? ZunoConstant.UPLOAD_VERIFY_TITLE : ZunoConstant.UPLOAD_TITLE),
		}, async () => {
			let args_build;
			let args_size;
			if (ZunoConstant.BOARD_CURRENT.generation == 0x1)
			{
				let tmp_sketch = Path.join(tmp, Path.basename(path_sketch));
				if (await File.copyFile(path_sketch, tmp_sketch) == false)
					return (CommandGeneral.installEpilogue(_this));
				args_build = [
					'build', tmp_sketch,
					'-r', hardware,
					'-p', Path.join(tools, ZunoConstant.BOARD_CURRENT.ZMAKE.GCC_BIN)
				];
				args_size = [
					'size', tmp_sketch
				];
			}
			else
			{
				const complier_options = Config.getComplierOptions().split(';');
				args_build = [
					'build', path_sketch,
					'-S', Path.join(hardware, ZunoConstant.BOARD_CURRENT.ZMAKE.CORE),
					'-S', Path.join(hardware, ZunoConstant.ZMAKE.LIB),
					'-S', Path.join(tools, ZunoConstant.BOARD_CURRENT.ZMAKE.GCC_LIB),
					'-B', tmp,
					'-T', Path.join(tools, ZunoConstant.BOARD_CURRENT.ZMAKE.GCC_BIN),
					'-lcl',Path.join(tools, ZunoConstant.ZMAKE.LIB_CLANG)
				];
				let index, len;
				for (index = 0, len = complier_options.length; index < len; ++index) {
					let value = complier_options[index].trim();
					if (value != "") {
						args_build.push('-O');
						args_build.push('BO:' + value);
					}
				}
				if (ZunoConstant.BOARD_LIST_CHIP_SUPPORT != ZunoConstant.BOARD_LIST_CHIP_SUPPORT_DEFAULT) {
					args_build.push('-C');
					args_build.push(StatusBar.multi_chip.get());
				}
				args_size = [
					'arduino_size', path_sketch,
					'-B', Path.join(tmp, Path.basename(sketch).replace(Path.extname(sketch), ''))
				];
			}
			if (ZunoConstant.BOARD_CURRENT.sketch_encryption == true)
			{
				args_build.push('-ski');
				args_build.push(StatusBar.sketch_encryption.get()["key"]);
			}
			let args_update;
			if (ZunoConstant.BOARD_CURRENT.generation == 0x1)
			{
				args_update = [
					'prog', Path.join(tmp, Path.basename(path_sketch)),
					'-p', `sec=${StatusBar.security.get()[2]}`,
					'-p', `logging=${StatusBar.rf_logging.get()[2]}`,
					'-fr', StatusBar.frequency.get()["freq"],
					'-d', port
				];
			}
			else
			{
				args_update = [
					'upload', path_sketch,
					'-B', tmp,
					'-p', `sec=${StatusBar.security.get()[2]}`,
					'-fr', StatusBar.frequency.get()["freq"],
					'-p', `main_pow=${StatusBar.power.get()}`,
					'-p', `flag_rflog=${StatusBar.rf_logging.get()[2]}`,
					'-d', port,
					'-i'
				];
			}
			if (ZunoConstant.BOARD_CURRENT.uart_baudrate == true)
			{
				args_update.push('-ub');
				args_update.push("" + StatusBar.uart_baudrate.get());//VsCode.Task аргументы принимает только строки
			}
			if (VsConfig.getOutputTerminal() != false)//Вывод с помощью задачи не в стандартный канал а в типа терминал
			{
				if (await Task.execute(zmake, args_build, sketch) != 0)
					return (CommandGeneral.installEpilogue(_this));
				let code = await Run.spawn(zmake, CommandUpdate.updateMemoryUsage, Output.data, args_size);
				if (code === false)
					return (_update_critical());
				if (this == undefined)
				{
					if (code == 0)
						CommandUpdate.printUpdateMemoryUsage(false);
					return (CommandGeneral.installEpilogue(_this));
				}
				SerialMonitor.pauseMonitor();//Если есть открытый монитор закрываем его что бы прошить 
				const out = await Task.execute(zmake, args_update, sketch);
				if (out == true)
					CommandUpdate.printUpdateMemoryUsage(false);
				SerialMonitor.resumeMonitor();//Если был монтитор закрыт навремя прошивки открываем заново
				return (CommandGeneral.installEpilogue(_this));
			}
			Output.show();//Покажим кансоль если скрыта
			Output.start(`${((this == undefined)? ZunoConstant.UPLOAD_VERIFY_START : ZunoConstant.UPLOAD_START) + sketch}`);
			let code = await Run.spawn(zmake, Output.data, Output.data, args_build);
			if (code === false)
				return (_update_critical());
			else if (code != 0)
			{
				Output.error(`${ZunoConstant.SYSTEM_EXIT_CODE}: ${code}`);
				Output.show();//Выведем все что записали в кансоль или ждать придеться долго
				return (CommandGeneral.installEpilogue(_this));
			}
			code = await Run.spawn(zmake, CommandUpdate.updateMemoryUsage, Output.data, args_size);
			if (code === false)
				return (_update_critical());
			else if (code != 0)
				Output.error(`${ZunoConstant.SYSTEM_EXIT_CODE}: ${code}`);
			if (this == undefined)
			{
				if (code == 0)
				{
					CommandUpdate.printUpdateMemoryUsage();
					if (CommandUpdate.getUpdateMemoryUsage() == true)
						Output.end(`${ZunoConstant.UPLOAD_VERIFY_END + sketch}`);
				}
				Output.show();//Выведем все что записали в кансоль или ждать придеться долго
				return (CommandGeneral.installEpilogue(_this));
			}
			if (code != 0)
				return (CommandGeneral.installEpilogue(_this));
			SerialMonitor.pauseMonitor();//Если есть открытый монитор закрываем его что бы прошить 
			code = await Run.spawn(zmake, Output.data, Output.data, args_update);
			SerialMonitor.resumeMonitor();//Если был монтитор закрыт навремя прошивки открываем заново
			if (code === false)
				return (_update_critical());
			else if (code != 0)
			{
				Output.error(`${ZunoConstant.SYSTEM_EXIT_CODE}: ${code}`);
				Output.show();//Выведем все что записали в кансоль или ждать придеться долго
				return (CommandGeneral.installEpilogue(_this));
			}
			if (CommandUpdate.getUpdateMemoryUsage() != true)
			{
				CommandUpdate.printUpdateMemoryUsage();
				return (CommandGeneral.installEpilogue(_this));
			}
			CommandUpdate.printUpdateMemoryUsage();
			Output.end(`${ZunoConstant.UPLOAD_END + sketch}`);
			Output.show();//Выведем все что записали в кансоль или ждать придеться долго
			return (CommandGeneral.installEpilogue(_this));
		});
	},
	install: async function()
	{
		if (CommandGeneral.installProloge(_this, _this.path_install, _this.array_host) == false)
			return ;
		const array = await CommandInstall.getJsonLoad(_this.path_install, _this.array_host, '');
		if (array == false)
			return (CommandGeneral.installEpilogue(_this));
		const file_setting = Path.join(_this.path_install, ZunoConstant.FILE.JSON_SETTING);
		const array_platforms = array.packages.platforms;
		const path_core = Path.join(_this.path_install, ZunoConstant.BOARD_CURRENT.core);
		const array_setting = Config.getSettting(file_setting);
		const old_version = array_setting.version;
		if (old_version == undefined)
			await File.delete(path_core);
		const select = await VsCode.window.showQuickPick(array_platforms.map((element) => {
			const description = (element.version == old_version) ? ZunoConstant.STATUS_INSTALL: ZunoConstant.STATUS_NOT_INSTALL;
			return {description: description, label: `${ZunoConstant.BOARD_CURRENT.core} ${element.version}:`};
		}).sort((a, b) => {return (string.cmpDown(a.label, b.label));}), {placeHolder: ZunoConstant.INSTALL_PLACEHOLDER});
		if (select == undefined)
			return (CommandGeneral.installEpilogue(_this));
		const new_version = select.label.replace(`${ZunoConstant.BOARD_CURRENT.core} `, '').replace(':', '');
		if (new_version == old_version)
		{
			const ans = await VsCode.window.showInformationMessage(ZunoConstant.INSTALL_DELETE_NOT_INSTALL, Constant.DIALOG_YES, Constant.DIALOG_NOT);
			if (ans == Constant.DIALOG_YES)
			{
				array_setting.version = false;
				Config.setSettting(file_setting, array_setting);
				await File.delete(path_core);
			}
			return (CommandGeneral.installEpilogue(_this));
		}
		const path_cache = Path.join(_this.path_install, ZunoConstant.DIR.CACHE);
		const path_cache_version = Path.join(path_cache, new_version);
		const path_tools = Path.join(path_cache_version, ZunoConstant.DIR.TOOLS);
		const path_hardware = Path.join(path_cache_version, ZunoConstant.DIR.HARDWARE);
		if (await CommandInstall.installReCreateDir(path_cache_version) == false || await File.mkdir(path_tools) == false || await File.mkdir(path_hardware) == false)
		{
			VsCode.window.showWarningMessage(`${Constant.FILE_FAILED_DIR} : ${path_cache_version} .`);
			return (CommandGeneral.installEpilogue(_this));
		}
		await VsCode.window.withProgress({
			location: VsCode.ProgressLocation.Notification,
			title: ZunoConstant.INSTALL_TITLE,
		}, async (progress) => {
			const obj_hardware = CommandInstall.findJsonHardware(array_platforms, new_version);
			progress.report({message: `${ZunoConstant.INSTALL_REPORT_PACK} '${ZunoConstant.DIR.HARDWARE}'`});
			if (await CommandInstall.installFile(path_cache, path_hardware, obj_hardware.url, obj_hardware.checksum) == false)
			{
				await File.delete(path_cache_version);
				return (CommandGeneral.installEpilogue(_this));
			}
			const array_dependencies = obj_hardware.toolsDependencies;
			const array_tools = array.packages.tools;
			const array_setting_new = {};
			for (let index = 0; index < array_dependencies.length; index++)
			{
				const element = array_dependencies[index];
				const name = element.name;
				progress.report({message: `${ZunoConstant.INSTALL_REPORT_PACK} '${name}'`});
				const version = element.version;
				const obj_tools = CommandInstall.findJsonTools(array_tools, name, version, _this.array_host.host_install);
				array_setting[name] = false;
				array_setting_new[name] = version;
				if (await CommandInstall.installFile(path_cache, path_tools, obj_tools.url, obj_tools.checksum) == false)
				{
					await File.delete(path_cache_version);
					return (CommandGeneral.installEpilogue(_this));
				}
			}
			array_setting_new.time = array_setting.time;
			array_setting_new.update_version = array_setting.update_version;
			array_setting_new.version = new_version;
			array_setting.update_version = undefined;
			array_setting.time = undefined;
			array_setting.version = undefined;
			progress.report({message: ZunoConstant.INSTALL_REPORT_MOVE});
			if (await CommandInstall.installMove(path_cache_version, path_core, array_setting) == false)
			{
				await File.unlink(file_setting);
				return (CommandGeneral.installEpilogue(_this));
			}
			await _process_file(_this.path_install);//обновим переменные нужные
			Config.setSettting(file_setting, array_setting_new);
			VsCode.window.showInformationMessage(ZunoConstant.INSTALL_SUCCESS);
			const path_stub = Path.join(path_core, ZunoConstant.DIR.TOOLS, ZunoConstant.ZMAKE.LIB_FAKE);
			await File.mkdir(path_stub);
			try {
				for (let index = 0; index < ZunoConstant.BOARD_CURRENT.LIB_FAKE.length; index++)
					Fs.writeFileSync(Path.join(path_stub, ZunoConstant.BOARD_CURRENT.LIB_FAKE[index]), ' ');
			} catch (error) {};
			await VsCode.commands.executeCommand(ZunoConstant.WORKBENCH.RELOAD_WINDOW);
			return (CommandGeneral.installEpilogue(_this));
		});
	},
	port: async function()
	{
		const port = await SerialMonitor.getPort(StatusBar.port.get());
		if (port == false)
			return ;
		Config.setPort(port);
		StatusBar.port.set(port);
	},
	sketch: async function()
	{
		let file = StatusBar.sketch.get();
		let array;
		file = await VsCode.window.showInputBox({
			placeHolder: (file == false) ? ZunoConstant.SKETCH_PLACEHOLDER : file,
			validateInput: async (value) => {
				if (value && ZunoConstant.REGEXP.SKETCH.test(value.trim()) == true)
				{
					array = await VsCode.workspace.findFiles("**/" + value, null, 2);
					if (array.length == 0)
						return (Constant.FILE_NOT);
					else if (array.length != 1)
						return (`${ZunoConstant.SKETCH_TOO_FIND} : ${array.length} .`);
					return (null);
				}
				else
					return (ZunoConstant.SKETCH_NOT_REGULAR);
			}
		});
		if (file == undefined)
			return ;
		file = array[0].fsPath.replace(`${ZunoConstant.PATH.WORKSPACE}${Path.sep}`, '');
		Config.setSketch(file);
		StatusBar.sketch.set(file, array[0].fsPath);
	}
}

module.exports = _this;

async function _update_critical()
{
	await File.delete(Path.join(_this.path_install, ZunoConstant.BOARD_CURRENT.core));
	await File.unlink(Path.join(_this.path_install, ZunoConstant.FILE.JSON_SETTING));
	Output.error(`${ZunoConstant.SYSTEM_EXIT_CODE}: 1`);
	Output.show();//Выведем все что записали в кансоль или ждать придеться долго
	VsCode.window.showErrorMessage(ZunoConstant.INSTALL_INVALID_CORE);
	CommandGeneral.installEpilogue(_this);
	_this.install();
	return ;
}

async function _checkFile(path_install, array_host, context)
{
	if (CommandGeneral.installProloge(_this, path_install, array_host) == false)//Проверим все ли есть необходимое
		return ;
	new Examples.Examples(context, path_install);
	const file_settings = Path.join(path_install, ZunoConstant.FILE.JSON_SETTING);
	const array_setting = Config.getSettting(file_settings);//Получим наши настройки
	await _process_file(path_install);
	const version = array_setting.version;
	if (version == undefined)//Если настроек нет или они не валидны предлагаем установить необходимые компоненты
	{
		const ans = await VsCode.window.showWarningMessage(ZunoConstant.INSTALL_CONTINUE, Constant.DIALOG_YES, Constant.DIALOG_NOT);
		if (ans != Constant.DIALOG_YES)
			return (CommandGeneral.installEpilogue(_this));
		CommandGeneral.installEpilogue(_this);
		return (_this.install());
	}
	CommandGeneral.installEpilogue(_this);
	await CppTools.cppTools(path_install);
	if (VsConfig.getAutoUpdate() == false)//Если автообновнление отключенно нечего не делаем
		return ;
	const time = new Date().getTime();
	if (Math.abs(time - parseInt((array_setting.time == undefined) ? 0 : array_setting.time)) < (VsConfig.getAutoUpdateTime() * 1000))
		return ;
	const array = await CommandInstall.getJsonLoad(Os.tmpdir(), _this.array_host, path_install);
	if (array == false)
		return ;
	const platforms = array.packages.platforms;
	const update_version = ((array_setting.update_version == undefined) ? version : array_setting.update_version);
	const array_cmp = [version, update_version];
	let len = platforms.length;
	for (let index = 0; index < len; index++)
		array_cmp.push(platforms[index].version);
	array_cmp.sort(string.cmpDown);
	const update_version_last = array_cmp[0];
	array_setting.time = time;
	if (update_version_last != update_version || update_version_last != version)
	{
		const ans = await VsCode.window.showInformationMessage(`${ZunoConstant.START_UPDATE_NEW_VERSION}: ${update_version_last}`, ZunoConstant.START_UPDATE_NEW_HOW, ZunoConstant.START_UPDATE_LATER, ZunoConstant.START_UPDATE_SKIP);
		if (ans == ZunoConstant.START_UPDATE_SKIP)
			array_setting.update_version = update_version_last;
		else if (ans == ZunoConstant.START_UPDATE_NEW_HOW)
		{
			Config.setSettting(file_settings, array_setting);
			return (_this.install());
		}
	}
	Config.setSettting(file_settings, array_setting);
}

async function _process_file(path_install)
{
	await _process_core_metadata_json(path_install);
	await _process_platform_txt(path_install);
	await _process_boards_txt(path_install);
}

async function _process_core_metadata_json(path_install)
{
	let array_chip_name = [];

	ZunoConstant.BOARD_LIST_CHIP_SUPPORT = ZunoConstant.BOARD_LIST_CHIP_SUPPORT_DEFAULT;
	try {
		const chip_depending = JSON.parse(Fs.readFileSync(Path.join(path_install, ZunoConstant.BOARD_CURRENT.core, 'hardware', 'cores','core_metadata.json'),"utf8")).chip_depending;
		for (let key in chip_depending) {
			array_chip_name.push([key, chip_depending[key].family]);
		}
		if (array_chip_name.length > 0x0) {
			ZunoConstant.BOARD_LIST_CHIP_SUPPORT = array_chip_name;
		}
	} catch (error) {  }
}

async function _process_platform_txt(path_install)
{
	let content, x, y;

	ZunoConstant.BOARD_CURRENT.ZMAKE.GCC_LIB = ZunoConstant.BOARD_CURRENT.ZMAKE.GCC_LIB_DEFAULT;
	try {
		content = Fs.readFileSync(Path.join(path_install, ZunoConstant.BOARD_CURRENT.core, 'hardware', 'platform.txt'), 'utf8');
		x = content.search('tools.zprog.cmd.include={runtime.tools.arm-none-eabi-gcc.path}');
		if (x == -1)
			return ;
		x = x + 62;
		y = content.indexOf("\n", x);
		if (y == -1)
			return ;
		y = y - 1;
		ZunoConstant.BOARD_CURRENT.ZMAKE.GCC_LIB = Path.join('gcc', content.substring(x, y));
	} catch (error) {
		return ;
	}
}

async function _process_boards_txt(path_install)
{
	let content, x, y, find_array, regexp_freq, value_text, value, arr_freq, dictionary_freq;

	ZunoConstant.BOARD_CURRENT.MEMORY.STORAGE = ZunoConstant.BOARD_CURRENT.MEMORY.STORAGE_DEFAULT;
	ZunoConstant.BOARD_CURRENT.MEMORY.DYNAMIC = ZunoConstant.BOARD_CURRENT.MEMORY.DYNAMIC_DEFAULT;
	try {
		content = Fs.readFileSync(Path.join(path_install, ZunoConstant.BOARD_CURRENT.core, 'hardware', 'boards.txt'), 'utf8');
	} catch (error) {
		return ;
	}
	arr_freq = new Array();
	regexp_freq = new RegExp(/\.menu\.Frequency\.(\w{1,})\.build\.rf_freq(\s{0,})=(\s{0,})(\w{1,})/, "g");
	find_array = content.match(regexp_freq);
	if (find_array) {
		for (let item of find_array)
		{
			value = item.match(new RegExp(regexp_freq.source));
			value_text = content.match(new RegExp("\\.menu\\.Frequency\\." + value[0x1] +"(\\s{0,})=(\\s{0,})([a-zA-Z 0-9 &,]{1,})"));
			if (value_text)
			{
				dictionary_freq = new Object();
				dictionary_freq["description"] = value_text[0x3].trim();
				dictionary_freq["freq"] = value[0x4];
				arr_freq.push(dictionary_freq);
			}
		}
	}
	if (arr_freq.length != 0x0) {
		const freq_default = ZunoConstant.FREQUENCY_DEFAULT_KEY;
		ZunoConstant.FREQUENCY_DEFAULT_KEY = arr_freq[0x0]["freq"];
		for (let item of arr_freq) {
			if (item["freq"] == freq_default) {
				ZunoConstant.FREQUENCY_DEFAULT_KEY = freq_default;
				break ;
			}
		}
		ZunoConstant.FREQUENCY_DICT_ARRAY = arr_freq;
	}
	x = content.search('maximum_size=');
	if (x != -1)
	{
		x = x + 13;
		y = x;
		while (content[y] >= '0' && content[y] <= '9')
			y++;
		ZunoConstant.BOARD_CURRENT.MEMORY.STORAGE = Number(content.substring(x, y));
	}
	x = content.search('maximum_data_size=');
	if (x != -1)
	{
		x = x + 18;
		y = x;
		while (content[y] >= '0' && content[y] <= '9')
			y++;
		ZunoConstant.BOARD_CURRENT.MEMORY.DYNAMIC = Number(content.substring(x, y));
	}
	x = content.search('menu.UARTBaudrate.ULTRA');
	if (x != -1)
	{
		ZunoConstant.BOARD_CURRENT.uart_baudrate = true
	}
	x = content.search('menu.SketchEncryption');
	if (x != -1)
	{
		ZunoConstant.BOARD_CURRENT.sketch_encryption = true
	}

}

async function _ptiValidOnly(oldvalue)
{
	const list = [Constant.DIALOG_ENABLED, Constant.DIALOG_DISABLED];
	while (0xFF)
	{
		const select = await VsCode.window.showQuickPick(list.map((element) => {
			return {label: element};
		}), {placeHolder: oldvalue});
		if (select == undefined)
			return (oldvalue);
		return (select.label);
	}
}

async function _ptiGetPathFile(oldvalue)
{
	const list = [Constant.DIALOG_NOT_USED, Constant.DIALOG_SELECT_FILE];
	while (0xFF)
	{
		const select = await VsCode.window.showQuickPick(list.map((element) => {
			return {label: element};
		}), {placeHolder: oldvalue});
		if (select == undefined)
			return (oldvalue);
		if (select.label == Constant.DIALOG_SELECT_FILE)
		{
			let uris;
			if (oldvalue == Constant.DIALOG_NOT_USED)
				uris = await VsCode.window.showOpenDialog({canSelectFolders: false, canSelectFiles: true, canSelectMany: false, openLabel: Constant.DIALOG_SELECT_FILE, filters: ZunoConstant.UTILITES_PTI_OPTIONS_JSON_FILTR});
			else
				uris = await VsCode.window.showOpenDialog({canSelectFolders: false, canSelectFiles: true, canSelectMany: false, openLabel: Constant.DIALOG_SELECT_FILE, filters: ZunoConstant.UTILITES_PTI_OPTIONS_JSON_FILTR, defaultUri: VsCode.Uri.parse('file:' + Path.dirname(oldvalue))});
			if (uris == undefined)
				break ;
			return (uris[0x0].fsPath);
		}
		return (select.label);
	}
}

async function _getBaudRatePti(oldvalue)
{
	while (0xFF)
	{
		const select = await VsCode.window.showQuickPick(ZunoConstant.UTILITES_PTI_OPTIONS_BAUDRATE_LIST.map((element) => {
			return {label: element};
		}), {placeHolder: oldvalue});
		if (select == undefined)
			return (oldvalue);
		if (select.label == ZunoConstant.UTILITES_PTI_OPTIONS_BAUDRATE_MANUAL)
		{
			const select = await VsCode.window.showInputBox({
				placeHolder: ZunoConstant.UTILITES_PTI_OPTIONS_BAUDRATE_MANUAL_PLACEHOLDER,
				validateInput: async (value) => {
					if (value == parseInt(value))
					{
						if (value < 230400)
							return (ZunoConstant.UTILITES_PTI_OPTIONS_BAUDRATE_MANUAL_NUMBER_LESS);
						return (null);
					}
					else
						return (ZunoConstant.UTILITES_PTI_OPTIONS_BAUDRATE_MANUAL_NUMBER);
				}
			});
			if (select == undefined)
				continue ;
			return (select);
		}
		return (select.label);
	}
}

function _openOptionsConversionBoardInfo(array, array_old)
{
	const len = array.length;
	let value, value_old;
	for (let index = 0; index < len; index++)
	{
		const element = array[index];
		value = element[1];
		value_old = array_old[index][0x1];
		switch (element[0])
		{
			case 'port':
				if (value != ZunoConstant.PORT_BAR_TEXT && value != value_old)
					Config.setBoardInfo_port(value);
				break;
		}
	}
}

function _openOptionsConversionPti(array, array_old)
{
	const len = array.length;
	let value, value_old;
	for (let index = 0; index < len; index++)
	{
		const element = array[index];
		value = element[1];
		value_old = array_old[index][0x1];
		switch (element[0])
		{
			case 'port':
				if (value != ZunoConstant.PORT_BAR_TEXT && value != value_old)
					Config.setPTI_port(value);
				break;
			case 'baudRate':
				if (value_old != value)
					Config.setPTI_baudRate(Number(value));
				break;
			case 'input':
				if (value != value_old)
				{
					if (value == Constant.DIALOG_NOT_USED)
						Config.setPTI_input(false);
					else
						Config.setPTI_input(value);
				}
				break;
			case 'output':
				if (value != value_old)
				{
					if (value == Constant.DIALOG_NOT_USED)
						Config.setPTI_output(false);
					else
						Config.setPTI_output(value);
				}
				break;
			case 'valid_only':
				if (value != value_old)
				{
					if (value == Constant.DIALOG_ENABLED)
						Config.setPTI_valid_only(true);
					else
						Config.setPTI_valid_only(false);
				}
				break;
		}
	}
}
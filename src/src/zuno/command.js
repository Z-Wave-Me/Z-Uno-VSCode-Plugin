/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";//Файлы не должны иметь ЗАГЛАВНЫЕ буквы иначе отладка не работает правельно

//Подключаем необходимые модули
const VsCode = require("vscode");
const Path = require("path");
const Fs = require('fs');
const Os = require("os");

const String = require("../common/string");
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
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.POWER, _this.power));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.BOOTLOADER, _this.bootloader));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.SECURITY, _this.security));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.PORT, _this.port));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.BOARD, _this.board));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.MONITOR, _this.monitor));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.SETTING, _this.settings));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.VERIFY, _this.verify));
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.UPLOAD, _this.verify, _this));//_this - дает понять что раз контекст есть значит upload а не verify
		context.subscriptions.push(VsCode.commands.registerCommand(ZunoConstant.CMD.INSTALL, _this.install));
		StatusBar.board.init();
		StatusBar.sketch.init(context);
		StatusBar.monitor.init();
		StatusBar.settings.init();
		StatusBar.port.init();
		SerialMonitor.init(context);
		ZunoConstant.BOARD_CURRENT = StatusBar.board.getArray();
		_checkFile(path_install, array_host, context);
	},
	board: async function()
	{
		const select = await VsCode.window.showQuickPick(StatusBar.board.getArrayString(), {placeHolder: `${StatusBar.board.get()} - ${ZunoConstant.BOARD_PLACEHOLDER}`});
		if (select == undefined)
			return ;
		if (select.label == ZunoConstant.BOARD_CURRENT.core)
			return ;
		VsCode.window.showInformationMessage(ZunoConstant.Z_UNO_INFO_RESTART);
		// VsCode.commands.executeCommand('workbench.action.reloadWindow');//Перезагрузим окно
		Config.setBoard(select.label);
		StatusBar.board.set(select.label);
	},
	monitor: async function()
	{
		SerialMonitor.openMonitor();
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
	power: async function()
	{
		let pow = StatusBar.power.get();
		const select = await VsCode.window.showInputBox({
			placeHolder: Math.trunc(pow / ZunoConstant.POWER.POWER_MULTI) + '.' + (pow % ZunoConstant.POWER.POWER_MULTI),
			validateInput: async (value) => {
				if (value && ZunoConstant.REGEXP.POWER.test(value.trim()) == true)
				{
					value = value.trim() * 10;
					if (value < ZunoConstant.POWER.POWER_MIN || value > ZunoConstant.POWER.POWER_MAX)
						return (ZunoConstant.POWER_NOT_REGULAR);
					return (null);
				}
				else
					return (ZunoConstant.POWER_NOT_REGULAR);
			}
		});
		if (select == undefined)
			return (false);
		pow = select.trim() * ZunoConstant.POWER.POWER_MULTI;
		Config.setPower(pow);
		StatusBar.power.set(pow);
		return (pow);

	},
	frequency: async function()
	{
		const freq = StatusBar.frequency.get();
		const select = await VsCode.window.showQuickPick(ZunoConstant.FREQUENCY.map((element) => {
			return {description: element[1], label: element[0], _zuno_tmp: element[2]};
		}), {placeHolder: `${freq[0]} - ${freq[1]}`});
		if (select == undefined)
			return (false);
		const out = select.label;
		Config.setFrequency(out);
		StatusBar.frequency.set([out, select.description, select._zuno_tmp]);
		return (out);
	},
	settings: async function()
	{
		let options =
		[
			['security', StatusBar.security.get()[0], ZunoConstant.SECURITY_PLACEHOLDER],
			['frequency', StatusBar.frequency.get()[0], ZunoConstant.FREQUENCY_PLACEHOLDER]
		];
		if (ZunoConstant.BOARD_CURRENT.power == true)
		{
			let value = StatusBar.power.get();
			options.push(['power', '+' + Math.trunc(value / ZunoConstant.POWER.POWER_MULTI) + '.' + (value % ZunoConstant.POWER.POWER_MULTI) + 'dBm', ZunoConstant.POWER_PLACEHOLDER]);
		}
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
				case 'power':
					const power = await _this.power();
					if (power == false)
						break ;
					element[1] = '+' + Math.trunc(power / ZunoConstant.POWER.POWER_MULTI) + '.' + (power % ZunoConstant.POWER.POWER_MULTI) + 'dBm';
					break;
			}
		}
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
					'-fr', StatusBar.frequency.get()[2],
					'-d', port
				];
			}
			else
			{
				arg_bootloader = [
					'boot',
					'-c', path_bootloader,
					'-d', port
				];
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
				args_build = [
					'build', path_sketch,
					'-S', Path.join(hardware, ZunoConstant.BOARD_CURRENT.ZMAKE.CORE),
					'-S', Path.join(hardware, ZunoConstant.ZMAKE.LIB),
					'-S', Path.join(tools, ZunoConstant.BOARD_CURRENT.ZMAKE.GCC_LIB),
					'-B', tmp,
					'-T', Path.join(tools, ZunoConstant.BOARD_CURRENT.ZMAKE.GCC_BIN),
					'-lcl',Path.join(tools, ZunoConstant.ZMAKE.LIB_CLANG),
					'-O', 'BO:-mfloat-abi=softfp',
					'-O', 'BO:-mfpu=fpv4-sp-d16',
					'-O', 'LO:-mfloat-abi=softfp',
					'-O', 'LO:-mfpu=fpv4-sp-d16',
					'-O', 'BO:-lm',
					'-O', 'LO:-lm'
				];
				args_size = [
					'arduino_size', path_sketch,
					'-B', Path.join(tmp, Path.basename(sketch).replace(Path.extname(sketch), ''))
				];
			}
			let args_update;
			if (ZunoConstant.BOARD_CURRENT.generation == 0x1)
			{
				args_update = [
					'prog', Path.join(tmp, Path.basename(path_sketch)),
					'-p', `sec=${StatusBar.security.get()[2]}`,
					'-fr', StatusBar.frequency.get()[2],
					'-d', port
				];
			}
			else
			{
				args_update = [
					'upload', path_sketch,
					'-B', tmp,
					'-p', `sec=${StatusBar.security.get()[2]}`,
					'-fr', StatusBar.frequency.get()[2],
					'-p', `main_pow=${StatusBar.power.get()[2]}`,
					'-d', port
				];
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
		}).sort((a, b) => {return (String.cmpDown(a.label, b.label));}), {placeHolder: ZunoConstant.INSTALL_PLACEHOLDER});
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
				if (array_setting[name] != version) {
					const obj_tools = CommandInstall.findJsonTools(array_tools, name, version, _this.array_host.host_install);
					array_setting[name] = false;
					array_setting_new[name] = version;
					if (await CommandInstall.installFile(path_cache, path_tools, obj_tools.url, obj_tools.checksum) == false)
					{
						await File.delete(path_cache_version);
						return (CommandGeneral.installEpilogue(_this));
					}
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
			Config.setSettting(file_setting, array_setting_new);
			VsCode.window.showInformationMessage(ZunoConstant.INSTALL_SUCCESS);
			const path_stub = Path.join(path_core, ZunoConstant.DIR.TOOLS, ZunoConstant.ZMAKE.LIB_FAKE);
			await File.mkdir(path_stub);
			try {
				for (let index = 0; index < ZunoConstant.BOARD_CURRENT.LIB_FAKE.length; index++)
					Fs.writeFileSync(Path.join(path_stub, ZunoConstant.BOARD_CURRENT.LIB_FAKE[index]), ' ');
			} catch (error) {};
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
	await CppTools.cppTools(path_install);
	const file_settings = Path.join(path_install, ZunoConstant.FILE.JSON_SETTING);
	const array_setting = Config.getSettting(file_settings);//Получим наши настройки
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
	array_cmp.sort(String.cmpDown);
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
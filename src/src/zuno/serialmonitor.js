/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const VsCode = require("vscode");
const Path = require("path");
const Os = require("os");
const Child_process = require("child_process");

const File = require("../common/file");
const String = require("../common/string");
const Utils = require('../common/utils');
const Constant = require("../constant/constant");

const VsConfig = require("./vsconfig");
const StatusBar = require("./statusbar");
const ZunoConstant = require("../constant/zunoconstant");

const SERIALMONITOR_ARRAY				= {};
const SERIALMONITOR_MAX_OPEN			= 4;
const SERIALMONITOR_PRIORITY			= 300;
const SERIALMONITOR_COUNT_BAR			= 1;

const _this = {
	element_resume: false,//Сохраняем структуру приостановленого монитора для resumeMonitor
	b_process: false,//Указывает начали изменения для отамарности доступа своебразного
	init: async function(context)
	{
		let platform = Os.platform();
		switch (platform)
		{
			case 'darwin':
				if (parseInt(Os.release()) >= 20)
					platform = Path.join(platform, '20')
				else
					platform = Path.join(platform, '19')
				break;
			default:
				break ;
		}
		_this.exe = Path.join(context.extensionPath, 'bin', 'serial_monitor',platform, 'serial_monitor');
		_this.extensions = context;
		if (platform != 'win32')
			await File.chmod(_this.exe, 0o777);
	},
	startUpload: function(port)
	{
		try
		{//На случай если в это время монитор из-за ошибки прекратит свою работу
			for (let index = 0; index < SERIALMONITOR_MAX_OPEN; index++)
			{
				const element = SERIALMONITOR_ARRAY[index];
				if (element == undefined)
					continue ;
				if (element.port == port)
				{
					_this.element_resume = element;
					return ;
				}
			}
		} catch (error){}
	},
	pauseMonitor: async function()
	{
		const element = _this.element_resume;
		if (element == false)
			return ;
		element.upload = false;//Указываем что данный монитор потом будем заново после прошивки запускать
		if (await _sendCmdChild(element, "pause", 1000) == false) {
			child.kill();
			_this.element_resume = false;
		}
	},
	resumeMonitor: async function()
	{
		const element = _this.element_resume;
		if (element == false)
			return ;
		_this.element_resume = false;
		element.upload = true;
		if (await _sendCmdChild(element, "resume", 1000) == false)
			child.kill();
	},
	finishUpload: function()
	{
		_this.element_resume = false;
	},
	openMonitor: async function()
	{
		if (_prologe() == false)
			return ;
		let index;
		for (index = 0; index < SERIALMONITOR_MAX_OPEN; index++)
			if (SERIALMONITOR_ARRAY[index] == undefined)
				break ;
		if (index == SERIALMONITOR_MAX_OPEN)
			return (_epilogueInfo(ZunoConstant.SERIALMONITOR_LIMITS_OPEN));
		SERIALMONITOR_ARRAY[index] = {};
		const obj = SERIALMONITOR_ARRAY[index];
		if (await _openOptions(obj) == false)
			return (_epilogue());
		const port = obj.port
		obj.index = index;
		obj.upload = true;//Указываем что данный монитор можно полностью удалять
		obj.output = VsCode.window.createOutputChannel(`${ZunoConstant.SERIALMONITOR_CHANNEL} ${port}`);
		obj.bar_monitor = VsCode.window.createStatusBarItem(VsCode.StatusBarAlignment.Right, 0 + SERIALMONITOR_PRIORITY + index * SERIALMONITOR_COUNT_BAR);
		if (await _createMonitor(obj) == false)
			return (_epilogueError(`${ZunoConstant.SERIALMONITOR_NOT_OPEN}: ${port}`));
		obj.output.show();
		obj.bar_monitor.command = `${ZunoConstant.CMD.SERIALMONITOR_CURRENT_OPTIONS + index}`;
		obj.bar_monitor.tooltip = `${ZunoConstant.SERIALMONITOR_BAR_TOOLTIP_MONITOR}; ${ZunoConstant.STATUS}: ${ZunoConstant.STATUS_ACTIVE}`;
		obj.bar_monitor.text = `${ZunoConstant.SERIALMONITOR_BAR_TEXT_MONITOR}:${port}`;
		try {//Что бы при повторном с такой же командой не крашилось и прошло просто мимо так как уже команда созданна
			const cmd = VsCode.commands.registerCommand(`${ZunoConstant.CMD.SERIALMONITOR_CURRENT_OPTIONS + index}`, () => {_optionsCurrentMonitor(index);});
			_this.extensions.subscriptions.push(cmd);
		} catch (error) {}
		obj.bar_monitor.show();
		_epilogue();
	},
	getPort: async function(oldport)
	{
		let array;
		try {
			array = JSON.parse(Child_process.execFileSync(_this.exe, ["list-ports"]));
		} catch (error) {
			return (false);
		}
		if (array == false)
			return (false);
		const select = await VsCode.window.showQuickPick(array.map((list) => {
			let description;
			if (list.pid == 0xEA60 && list.vid == 0x10C4)//Переводиться в числа так как на разных осях может не быть приставки в строке '0x'
				description = ZunoConstant.DIR.CORE;
			else
				description = list.manufacturer;
			return {description: description, label: list.device};
		}).sort((a, b) => { return (String.cmpUp(a.label, b.label));}), {placeHolder: (oldport == false) ? ZunoConstant.PORT_PLACEHOLDER : oldport});
		if (select == undefined)
			return (false);
		return (select.label);
	}
}

module.exports = _this;

function _openOptions(obj)
{
	const port = StatusBar.port.get();
	const options =
	[
		['open', ZunoConstant.SERIALMONITOR_OPTIONS_TEXT, ZunoConstant.SERIALMONITOR_OPTIONS_DECRIPTION],
		['port', (port == false) ? ZunoConstant.PORT_BAR_TEXT : port, ZunoConstant.SERIALMONITOR_OPTIONS_PORT_DECRIPTION],
		['baudRate', VsConfig.getBaudRate(), ZunoConstant.SERIALMONITOR_OPTIONS_BAUDRATE_DECRIPTION]
	];
	return (new Promise(async (resolve, reject) => {
		while (0xFF)
		{
			let index = 0;
			const select = await VsCode.window.showQuickPick(options.map((element) => {
				return {description: element[2], label: element[1], index: index++};
			}), {placeHolder: ZunoConstant.SERIALMONITOR_OPTIONS_PLACEHOLDER});
			if (select == undefined)
				return (resolve(false));
			const element = options[select.index];
			switch (element[0])
			{
				case 'open':
					if (options[1][1] == ZunoConstant.PORT_BAR_TEXT)
					{
						const ans = await VsCode.window.showInformationMessage(ZunoConstant.SERIALMONITOR_OPTIONS_NOT_PORT, Constant.DIALOG_YES, Constant.DIALOG_NOT);
						if (ans != Constant.DIALOG_YES)
							return (resolve(false));
						const port = await _this.getPort(false);
						options[1][1] = (port == false) ? ZunoConstant.PORT_BAR_TEXT : port, ZunoConstant.PORT_PLACEHOLDER;
						break ;
					}
					return (resolve(_openOptionsConversion(options, obj)));
				case 'port':
					const port = await _this.getPort((element[1] == ZunoConstant.PORT_BAR_TEXT) ? false : element[1]);
					element[1] = (port == false) ? ZunoConstant.PORT_BAR_TEXT : port, ZunoConstant.PORT_PLACEHOLDER;
					break;
				case 'baudRate':
					element[1] = await _getBaudRate(element[1]);
					break;
			}
		}
	}));
}

async function _getBaudRate(oldvalue)
{
	while (0xFF)
	{
		const select = await VsCode.window.showQuickPick(ZunoConstant.SERIALMONITOR_OPTIONS_BAUDRATE_LIST.map((element) => {
			return {label: element};
		}), {placeHolder: oldvalue});
		if (select == undefined)
			return (oldvalue);
		if (select.label == ZunoConstant.SERIALMONITOR_OPTIONS_BAUDRATE_MANUAL)
		{
			const select = await VsCode.window.showInputBox({
				placeHolder: ZunoConstant.SERIALMONITOR_OPTIONS_BAUDRATE_MANUAL_PLACEHOLDER,
				validateInput: async (value) => {
					if (value == parseInt(value))
						return (null);
					else
						return (ZunoConstant.SERIALMONITOR_OPTIONS_BAUDRATE_MANUAL_NUMBER);
				}
			});
			if (select == undefined)
				continue ;
			return (select);
		}
		return (select.label);
	}
}

function _openOptionsConversion(array, obj)
{
	const len = array.length;
	const currentoptions = [
		['close', ZunoConstant.SERIALMONITOR_CURRENTOPTIONS_TEXT_CLOSE, ZunoConstant.SERIALMONITOR_CURRENTOPTIONS_TEXT_CLOSE_DECRIPTION],
		['pause', ZunoConstant.SERIALMONITOR_CURRENTOPTIONS_TEXT_PAUSE, ZunoConstant.SERIALMONITOR_CURRENTOPTIONS_TEXT_PAUSE_DECRIPTION]
	];
	for (let index = 0; index < len; index++)
	{
		const element = array[index];
		switch (element[0])
		{
			case 'port':
				obj.port = element[1];
				break;
			case 'baudRate':
				currentoptions.push(element);
				obj.baudRate = element[1];
				break;
		}
	}
	obj.currentoptions = currentoptions;
	return (true);
}

async function _optionsCurrentMonitor(obj_index)
{
	if (_prologe() == false)
		return ;
	const obj = SERIALMONITOR_ARRAY[obj_index];
	if (obj.upload == false)//Покуда шьеться не можно настаивать состояние монитора
		return (_epilogueInfo(ZunoConstant.SERIALMONITOR_CURRENTOPTIONS_NOT_UPLOAD));
	const child = obj.child;
	const currentoptions = obj.currentoptions;
	obj.output.show(true);
	let index = 0;
	const select = await VsCode.window.showQuickPick(currentoptions.map((element) => {
		return {description: element[2], label: element[1], index: index++};
	}), {placeHolder: ZunoConstant.SERIALMONITOR_OPTIONS_PLACEHOLDER});
	if (select == undefined)
		return (_epilogue());
	const element = currentoptions[select.index];
	switch (element[0])
	{
		case 'close':
			child.kill(); // Прощесамо убить.
			break ;
		case 'pause':
			obj.bar_monitor.tooltip = `${ZunoConstant.SERIALMONITOR_BAR_TOOLTIP_MONITOR}; ${ZunoConstant.STATUS}: ${ZunoConstant.STATUS_PAUSE}`;
			currentoptions[select.index] = ['resume', ZunoConstant.SERIALMONITOR_CURRENTOPTIONS_TEXT_RESUME, ZunoConstant.SERIALMONITOR_CURRENTOPTIONS_TEXT_RESUME_DECRIPTION];
			if (await _sendCmdChild(obj, "pause", 1000) == false) {
				child.kill();
				VsCode.window.showErrorMessage(ZunoConstant.SERIALMONITOR_OPTIONS_PAUSE_CHANGE);
				break ;
			}
			break ;
		case 'resume':
			obj.bar_monitor.tooltip = `${ZunoConstant.SERIALMONITOR_BAR_TOOLTIP_MONITOR}; ${ZunoConstant.STATUS}: ${ZunoConstant.STATUS_ACTIVE}`;
			currentoptions[select.index] = ['pause', ZunoConstant.SERIALMONITOR_CURRENTOPTIONS_TEXT_PAUSE, ZunoConstant.SERIALMONITOR_CURRENTOPTIONS_TEXT_PAUSE_DECRIPTION];
			if (await _sendCmdChild(obj, "resume", 1000) == false) {
				child.kill();
				VsCode.window.showErrorMessage(ZunoConstant.SERIALMONITOR_OPTIONS_RESUME_CHANGE);
				break ;
			}
			break ;
		case 'baudRate':
			const newbaudRate = await _getBaudRate(element[1]);
			if (await _sendCmdChild(obj, "baudrate " + newbaudRate, 1000) == false) {
				child.kill();
				VsCode.window.showErrorMessage(ZunoConstant.SERIALMONITOR_OPTIONS_BAUDRATE_CHANGE);
				break ;
			}
			element[1] = newbaudRate;
			break ;
	}
	return (_epilogue());
}

function _sendCmdChild(obj, cmd, timout)
{
	return new Promise((resolve, reject) => {
		let timeoutObj = setTimeout(() => {
			resolve(false);
		}, timout);
		obj.child.stderr.once("data", (data) => {
			if (data.toString() != obj.ok)
				resolve(false);
			try {
				clearTimeout(timeoutObj);
			} catch (error) {}
			resolve(true);
		});
		obj.child.stdin.write(cmd + "\n");
	});
}


function _createMonitor(obj)
{
	obj.ok = '0';
	return (new Promise((resolve, reject) => {
		const child = Child_process.spawn(_this.exe, ['open', '-d', obj.port, '-b', obj.baudRate, '-o', obj.ok], {stdio: ['pipe', 'pipe', 'pipe']});
		child.on("close", (err) => {
			if (err != undefined)
				VsCode.window.showErrorMessage(ZunoConstant.SERIALMONITOR_FALIED_READ.replace('${port}', obj.port));
			_disposeMonitor(obj);
			resolve(false);
		});
		child.stdout.on("data", (data) => {
			obj.output.append(data.toString());
		});
		child.stderr.once("data", (data) => {
			if (data.toString() != obj.ok) {
				_disposeMonitor(obj);
				resolve(false);
			}
			obj.child = child;
			resolve(true);
		});
	}));
}

function _disposeMonitor(obj)
{
	obj.output.dispose();
	obj.bar_monitor.dispose();
	SERIALMONITOR_ARRAY[obj.index] = undefined;
}

function _prologe()
{
	if (_this.b_process == true)
	{
		VsCode.window.showInformationMessage(ZunoConstant.SYSTEM_PROCESS_BUSY);
		return (false);
	}
	_this.b_process = true;
	return (true);
}

function _epilogueError(msg)
{
	VsCode.window.showErrorMessage(msg);
	_epilogue();
}

function _epilogueInfo(msg)
{
	VsCode.window.showInformationMessage(msg);
	_epilogue();
}

function _epilogue()
{
	_this.b_process = false;
}
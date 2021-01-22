/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const VsCode = require("vscode");

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
	init: function(context)
	{
		_this.extensions = context;
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
				if (element.obj_monitor.path == port)
				{
					_this.element_resume = element;
					return ;
				}
			}
		} catch (error){}
	},
	pauseMonitor: function()
	{
		const element = _this.element_resume;
		if (element == false)
			return ;
		try
		{//На случай если в это время монитор из-за ошибки прекратит свою работу
			element.upload = false;//Указываем что данный монитор потом будем заново после прошивки запускать
			element.obj_monitor.close('pause');
		} catch (error){_this.element_resume = false;}

	},
	resumeMonitor: async function()
	{
		const element = _this.element_resume;
		if (element == false)
			return ;
		try
		{//На случай если в это время монитор из-за ошибки прекратит свою работу
			_this.element_resume = false;
			element.upload = true;
			if (await _createMonitor(element, element.obj_monitor.path, element.arg) == false)
				VsCode.window.showErrorMessage(ZunoConstant.SERIALMONITOR_FALIED_READ.replace('${port}', obj_monitor.path));
		} catch (error){}
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
		const array_options = await _openOptions(obj);
		if (array_options == false)
			return (_epilogue());
		const port = array_options.port;
		obj.index = index;
		obj.upload = true;//Указываем что данный монитор можно полностью удалять
		obj.output = VsCode.window.createOutputChannel(`${ZunoConstant.SERIALMONITOR_CHANNEL} ${port}`);
		obj.bar_monitor = VsCode.window.createStatusBarItem(VsCode.StatusBarAlignment.Right, 0 + SERIALMONITOR_PRIORITY + index * SERIALMONITOR_COUNT_BAR);
		if (await _createMonitor(obj, port, array_options.arg) == false)
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
		try {array = await require("node-usb-native").SerialPort.list();} catch (error) {}//Получаем список портов
		if (array == undefined)
		{
			VsCode.window.showInformationMessage(ZunoConstant.PORT_NOT_AVIABLE);
			return (false);
		}
		const select = await VsCode.window.showQuickPick(array.map((list) => {
			let description;
			if (parseInt(list.productId, 16) == 0xEA60 && parseInt(list.vendorId, 16) == 0x10C4)//Переводиться в числа так как на разных осях может не быть приставки в строке '0x'
				description = ZunoConstant.DIR.CORE;
			else
				description = list.manufacturer;
			return {description: description, label: list.path};
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
	const out = {arg: {hupcl: false}};
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
				out.port = element[1];
				break;
			case 'baudRate':
				currentoptions.push(element);
				out.arg.baudRate = parseInt(element[1]);
				break;
		}
	}
	obj.currentoptions = currentoptions;
	return (out);
}

async function _optionsCurrentMonitor(obj_index)
{
	if (_prologe() == false)
		return ;
	const obj = SERIALMONITOR_ARRAY[obj_index];
	if (obj.upload == false)//Покуда шьеться не можно настаивать состояние монитора
		return (_epilogueInfo(ZunoConstant.SERIALMONITOR_CURRENTOPTIONS_NOT_UPLOAD));
	const obj_monitor = obj.obj_monitor;
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
			obj_monitor.close();
			_epilogue()
			return (_epilogue());
		case 'pause':
			obj.bar_monitor.tooltip = `${ZunoConstant.SERIALMONITOR_BAR_TOOLTIP_MONITOR}; ${ZunoConstant.STATUS}: ${ZunoConstant.STATUS_PAUSE}`;
			currentoptions[select.index] = ['resume', ZunoConstant.SERIALMONITOR_CURRENTOPTIONS_TEXT_RESUME, ZunoConstant.SERIALMONITOR_CURRENTOPTIONS_TEXT_RESUME_DECRIPTION];
			obj_monitor.pause();
			return (_epilogue());
		case 'resume':
			obj.bar_monitor.tooltip = `${ZunoConstant.SERIALMONITOR_BAR_TOOLTIP_MONITOR}; ${ZunoConstant.STATUS}: ${ZunoConstant.STATUS_ACTIVE}`;
			currentoptions[select.index] = ['pause', ZunoConstant.SERIALMONITOR_CURRENTOPTIONS_TEXT_PAUSE, ZunoConstant.SERIALMONITOR_CURRENTOPTIONS_TEXT_PAUSE_DECRIPTION];
			obj_monitor.resume();
			return (_epilogue());
		case 'baudRate':
			const newbaudRate = await _getBaudRate(element[1]);
			if (await _changeBaudRate(newbaudRate, obj_monitor) == false)
				return (_epilogue());
			element[1] = newbaudRate;
			return (_epilogue());
	}
}

function _changeBaudRate(newbaudRate, obj_monitor)
{
	return new Promise((resolve, reject) => {
		obj_monitor.update({baudRate: parseInt(newbaudRate)}, (err) => {
			if (err)
			{
				VsCode.window.showErrorMessage(ZunoConstant.SERIALMONITOR_OPTIONS_BAUDRATE_CHANGE);
				resolve(false);
			}
			else
				resolve(true);
		});
	});
}

function _createMonitor(obj, port, arg)
{
	return (new Promise((resolve, reject) => {
		const obj_monitor = require("node-usb-native").SerialPort(port, arg, (err) => {
			if (err == undefined)
				resolve (true);
			else
			{
				Utils.setLastError(err);
				_disposeMonitor(obj);
				resolve (false);
			}
		});
		obj.obj_monitor = obj_monitor;
		obj_monitor.on("data", (data) => {
			_outputHexAnsii(obj.output, data);
		});
		obj_monitor.on("close", (err) => {
			if (err != undefined)
			{
				VsCode.window.showErrorMessage(ZunoConstant.SERIALMONITOR_FALIED_READ.replace('${port}', obj_monitor.path));
				Utils.setLastError(err);
			}
			else if (obj.upload == false)
			{//При таком случае значит нужно закрыть но потом стартовать с теми же параметрами дабы не было заметно сие действие пользователю
				obj.arg = arg;
				return ;
			}
			_disposeMonitor(obj);
		});
	}));
}

const ALPHA			= '0123456789ABCDEF'

let _outputHexIndex = 0
function _outputHex(output, data)
{
	for (const value of data)
	{
		_outputHexIndex++;
		if (_outputHexIndex % 0x10 == 0)
			output.appendLine(ALPHA[value >>> 4] + ALPHA[value & 0xF]);
		else
			output.append(ALPHA[value >>> 4] + ALPHA[value & 0xF] + ' ');
	}
}

function _outputHexAnsii(output, data)
{
	let i = 0;
	for (const value of data)
	{
		output.append(ALPHA[value >>> 4] + ALPHA[value & 0xF] + ' ');
	}
	
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
/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const PATH = require("path");
const Fs = require("fs");

const File = require("../common/file");
const ZunoConstant = require("../constant/zunoconstant");



const _this = {//У нас активируеться только когда папка рабочая есть поэтому не провераем есть ли рабочая папка
	getSketch()//Получает используемый скетч из настроект текущего проекта
	{
		const sketch = _get('sketch');//ZunoConstant.REGEXP.SKETCH.test(
		if (sketch == false || ZunoConstant.REGEXP.SKETCH.test(sketch) == false)//Проверим через регулярку что бы ерунду не подсунули
			return (false);
		return (sketch);
	},
	setSketch(value)//Сохраняет используемый скетч из настроект текущего проекта
	{
		_set('sketch', value);
	},
	getRfLogging()
	{
		return (_arrayFind(ZunoConstant.RF_LOGGING, _get('rf_logging'), ZunoConstant.RF_LOGGING_DEFAULT));
	},
	setRfLogging(value)//Сохраняет используемый скетч из настроект текущего проекта
	{
		_set('rf_logging', value);
	},
	getSecurity()//Получает используемую при загрузки скетча security из настроект текущего проекта
	{
		let array;
		array = ZunoConstant.BOARD_CURRENT.security;//Это при загрузки файла не выставленно поэтому ругаеться - поэтому провераем
		return (_arrayFind(ZunoConstant.SECURITY, _get('security'), ZunoConstant.SECURITY_DEFAULT));
	},
	setSecurity(value)//Сохраняет используемый скетч из настроект текущего проекта
	{
		_set('security', value);
	},
	getUartBaudrate()//Получает скорость загрузки скетча и по совместительсву для дрцгих аналогичных функций
	{
		let value;
		value = _get('uart_baudrate');
		if (typeof value == "number" && Number.isInteger(value) == true)
		{
			for (let i = 0; i < ZunoConstant.UART_BAUDRATE.LIST.length; i++) {
				if (ZunoConstant.UART_BAUDRATE.LIST[i] == value)
					return (value);
			}
		}
		return (ZunoConstant.UART_BAUDRATE.DEFAULT);
	},
	setUartBaudrate(value)//Сохраняет используемый скетч из настроект текущего проекта
	{
		_set('uart_baudrate', Number(value));
	},
	getPower()//Получает используемую при загрузки скетча мощность передаваемого радио сигнала из настроект текущего проекта
	{
		let value;
		value = _get('power');
		if (typeof value == "number" && Number.isInteger(value) == true)
		{
			if (value < ZunoConstant.POWER.POWER_MIN || value > ZunoConstant.POWER.POWER_MAX)
				value = ZunoConstant.POWER.POWER_DEFAULT;
		}
		else
			value = ZunoConstant.POWER.POWER_DEFAULT;
		return (value);
	},
	setPower(value)//Сохраняет используемый скетч из настроект текущего проекта
	{
		_set('power', Number(value));
	},
	getSketchEncryption()
	{
		const key = _get('sketch_encryption');
		for (let item of ZunoConstant.SKETCH_ENCRYPTION_DICT_ARRAY) {
			if (item["key"] == key)
				return (item);
		}
		for (let item of ZunoConstant.SKETCH_ENCRYPTION_DICT_ARRAY) {
			if (item["key"] == ZunoConstant.SKETCH_ENCRYPTION_DEFAULT_KEY)
				return (item);
		}
		return (undefined);
	},
	setSketchEncryption(value)
	{
		_set('sketch_encryption', value);
	},
	getMultiChip()
	{
		let value;
		if (ZunoConstant.BOARD_LIST_CHIP_SUPPORT == ZunoConstant.BOARD_LIST_CHIP_SUPPORT_DEFAULT)
			return (ZunoConstant.BOARD_CURRENT.chip_name);
		value = _get(ZunoConstant.BOARD_CURRENT.core + ':multi_chip');
		if (typeof value != "string")
			return (ZunoConstant.BOARD_CURRENT.chip_name);
		for (let i = 0; i < ZunoConstant.BOARD_LIST_CHIP_SUPPORT.length; i++) {
			if (ZunoConstant.BOARD_LIST_CHIP_SUPPORT[i][0] == value)
				return (value);
		}
		return (ZunoConstant.BOARD_CURRENT.chip_name);
	},
	setMultiChip(value)//
	{
		_set(ZunoConstant.BOARD_CURRENT.core + ':multi_chip', value);
	},
	getComplierOptions()//Получает используемую при загрузки скетча мощность передаваемого радио сигнала из настроект текущего проекта
	{
		let value;
		value = _get('complier_options');
		if (typeof value != "string")
			value = "";
		return (value);
	},
	setComplierOptions(value)//Сохраняет используемый скетч из настроект текущего проекта
	{
		_set('complier_options', value);
	},
	getFrequency()//Получает используемую при загрузки скетча частоту из настроект текущего проекта
	{
		const freq = _get('frequency');
		for (let item of ZunoConstant.FREQUENCY_DICT_ARRAY) {
			if (item["freq"] == freq)
				return (item);
		}
		for (let item of ZunoConstant.FREQUENCY_DICT_ARRAY) {
			if (item["freq"] == ZunoConstant.FREQUENCY_DEFAULT_KEY)
				return (item);
		}
		return (undefined);
	},
	setFrequency(value)//Сохраняет используемый скетч из настроект текущего проекта
	{
		_set('frequency', value);
	},
	getCppIgnored()//Получает Нужно  ли игнорить ошибки в настройках IntelliSense
	{
		const value = _get('cppIgnored');
		return ((value == 'Enabled') ? true : false);
	},
	setCppIgnored(value)//Сохраняет Нужно  ли игнорить ошибки в настройках IntelliSense
	{
		value = (value == true) ? 'Enabled' : 'Disabled';
		_set('cppIgnored', value);
	},
	getPort()//Получает используемый порт из настроект текущего проекта
	{
		return (_get('port'));
	},
	setPort(value)//Сохраняет используемый порт из настроект текущего проекта
	{
		_set('port', value);
	},
	getPTI_output()//Получает из настроект текущего проекта
	{
		let value = _get('PTI_output');
		if (value == false)
			return (false);
		if (typeof value === 'string' || value instanceof String)
			return (value);
		return (false);
	},
	setPTI_output(value)//Сохраняет в настройках текущего проекта
	{
		_set('PTI_output', value);
	},
	getPTI_input()//Получает из настроект текущего проекта
	{
		let value = _get('PTI_input');
		if (value == false)
			return (false);
		if (typeof value === 'string' || value instanceof String)
			return (value);
		return (false);
	},
	setPTI_input(value)//Сохраняет в настройках текущего проекта
	{
		_set('PTI_input', value);
	},
	getPTI_valid_only()//Получает из настроект текущего проекта
	{
		let value = _get('PTI_valid_only');
		if (value == false)
			return (false);
		if (typeof value === 'boolean')
			return (value);
		return (false);
	},
	setPTI_valid_only(value)//Сохраняет в настройках текущего проекта
	{
		_set('PTI_valid_only', value);
	},
	getBoardInfo_port()//Получает из настроект текущего проекта
	{
		let value = _get('BoardInfo_port');
		if (value == false)
			return (false);
		if (typeof value === 'string' || value instanceof String)
			return (value);
		return (false);
	},
	setBoardInfo_port(value)//Сохраняет в настройках текущего проекта
	{
		_set('BoardInfo_port', value);
	},
	getPTI_port()//Получает из настроект текущего проекта
	{
		let value = _get('PTI_port');
		if (value == false)
			return (false);
		if (typeof value === 'string' || value instanceof String)
			return (value);
		return (false);
	},
	setPTI_port(value)//Сохраняет в настройках текущего проекта
	{
		_set('PTI_port', value);
	},
	getPTI_baudRate()//Получает из настроект текущего проекта
	{
		const baudRate = _get('PTI_baudRate');
		if (baudRate == undefined || Number.isInteger(baudRate) == false || baudRate < 230400)
			return (230400);
		return (baudRate);
	},
	setPTI_baudRate(value)//Сохраняет в настройках текущего проекта
	{
		_set('PTI_baudRate', value);
	},
	getBoard()//Получает используемый плату
	{
		let board = _get('board');
		let array = false;
		for (let key in ZunoConstant.BOARD)
		{
			if (ZunoConstant.BOARD[key].core == board)
			{
				array = true;
				break ;
			}
		}
		if (array == false)
			board = ZunoConstant.BOARD.ZUNO2.core;
		return (board);
	},
	setBoard(value)//Сохраняет используемый плату
	{
		_set('board', value);
	},
	getSettting(file)//Получает ивалидирует общие настройки находящиеся в папке куда устанавливаеться необходимые капоненты
	{
		try {//Если битый то просто false возратим
			const array = JSON.parse(Fs.readFileSync(file, "utf8"));
			if (array[ZunoConstant.BOARD_CURRENT.core] == undefined)
				return ({});
			return (array[ZunoConstant.BOARD_CURRENT.core]);
		} catch (error) { return ({}); }
	},
	setSettting(file, save)//Сохраняет общие настройки находящиеся в папке куда устанавливаеться необходимые капоненты
	{
		let array = {};
		try {//Если битый то просто false возратим
			array = JSON.parse(Fs.readFileSync(file, "utf8"));
		} catch (error) { }
		array[ZunoConstant.BOARD_CURRENT.core] = save;
		Fs.writeFileSync(file, JSON.stringify(array, null, 4));
	},
	getVersion(file)//Получает версию ядра из общих настройки находящиеся в папке куда устанавливаеться необходимые капоненты
	{
		return (_get(file, 'version'));
	},
	settVersion(file, value)//Сохраняет версию ядра из общих настройки находящиеся в папке куда устанавливаеться необходимые капоненты
	{
		return (_set(file, 'version', value));
	}
}

module.exports = _this;

function _arrayFind(array, key, def)
{
	if (key == undefined)
		return (def);
	const len = array.length
	for (let index = 0; index < len; index++)
	{
		const out = array[index][0];
		if (out == key)
			return (array[index]);
	}
	return (def);
}

function _get(name)
{//Получает из указанного файла в виде json информацию
	let file = ZunoConstant.PATH.JSON_WORKSPACE;
	try {//Если битый то просто false возратим
		const array = JSON.parse(Fs.readFileSync(file, "utf8"));
		if (array[name] == undefined)
			return (false);
		return (array[name]);
	} catch (error) {return (false); }
}

async function _set(name, value)
{//Сохраняет в указанный файл в виде json информацию
	let file = ZunoConstant.PATH.JSON_WORKSPACE;
	let array;
	if (Fs.existsSync(file) == false)
	{
		const dir = PATH.dirname(file);
		if (Fs.existsSync(dir) == false)
			await File.mkdir(dir);
		array = {};
		array[name] = value;
	}
	else
	{
		try {//Если битый то просто новый создадим
			array = JSON.parse(Fs.readFileSync(file, "utf8"));
		} catch (error) {
			array = {};
		}
		array[name] = value;
	}
	try {
		Fs.writeFileSync(file, JSON.stringify(array, null, 4));
	} catch (error) {}
}
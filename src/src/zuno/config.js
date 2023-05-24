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
		const sketch = _get(ZunoConstant.PATH.JSON_WORKSPACE, 'sketch');//ZunoConstant.REGEXP.SKETCH.test(
		if (sketch == false || ZunoConstant.REGEXP.SKETCH.test(sketch) == false)//Проверим через регулярку что бы ерунду не подсунули
			return (false);
		return (sketch);
	},
	setSketch(value)//Сохраняет используемый скетч из настроект текущего проекта
	{
		_set(ZunoConstant.PATH.JSON_WORKSPACE, 'sketch', value);
	},
	getRfLogging()
	{
		return (_arrayFind(ZunoConstant.RF_LOGGING, _get(ZunoConstant.PATH.JSON_WORKSPACE, 'rf_logging'), ZunoConstant.RF_LOGGING_DEFAULT));
	},
	setRfLogging(value)//Сохраняет используемый скетч из настроект текущего проекта
	{
		_set(ZunoConstant.PATH.JSON_WORKSPACE, 'rf_logging', value);
	},
	getSecurity()//Получает используемую при загрузки скетча security из настроект текущего проекта
	{
		let array;
		array = ZunoConstant.BOARD_CURRENT.security;//Это при загрузки файла не выставленно поэтому ругаеться - поэтому провераем
		return (_arrayFind(ZunoConstant.SECURITY, _get(ZunoConstant.PATH.JSON_WORKSPACE, 'security'), ZunoConstant.SECURITY_DEFAULT));
	},
	setSecurity(value)//Сохраняет используемый скетч из настроект текущего проекта
	{
		_set(ZunoConstant.PATH.JSON_WORKSPACE, 'security', value);
	},
	getPower()//Получает используемую при загрузки скетча мощность передаваемого радио сигнала из настроект текущего проекта
	{
		let value;
		value = _get(ZunoConstant.PATH.JSON_WORKSPACE, 'power');
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
		_set(ZunoConstant.PATH.JSON_WORKSPACE, 'power', value);
	},
	getMultiChip()
	{
		let value;
		if (ZunoConstant.BOARD_LIST_CHIP_SUPPORT == ZunoConstant.BOARD_LIST_CHIP_SUPPORT_DEFAULT)
			return (ZunoConstant.BOARD_CURRENT.chip_name);
		value = _get(ZunoConstant.PATH.JSON_WORKSPACE, ZunoConstant.BOARD_CURRENT.core + 'multi_chip');
		if (typeof value != "string")
			return (ZunoConstant.BOARD_CURRENT.chip_name);
		for (let i = 0; i < ZunoConstant.BOARD_LIST_CHIP_SUPPORT.length; i++) {
			if (ZunoConstant.BOARD_LIST_CHIP_SUPPORT[i] == value)
				return (value);
		}
		return (ZunoConstant.BOARD_CURRENT.chip_name);
	},
	setMultiChip(value)//
	{
		_set(ZunoConstant.PATH.JSON_WORKSPACE, ZunoConstant.BOARD_CURRENT.core + 'multi_chip', value);
	},
	getComplierOptions()//Получает используемую при загрузки скетча мощность передаваемого радио сигнала из настроект текущего проекта
	{
		let value;
		value = _get(ZunoConstant.PATH.JSON_WORKSPACE, 'complier_options');
		if (typeof value != "string")
			value = "";
		return (value);
	},
	setComplierOptions(value)//Сохраняет используемый скетч из настроект текущего проекта
	{
		_set(ZunoConstant.PATH.JSON_WORKSPACE, 'complier_options', value);
	},
	getFrequency()//Получает используемую при загрузки скетча частоту из настроект текущего проекта
	{
		return (_arrayFind(ZunoConstant.FREQUENCY, _get(ZunoConstant.PATH.JSON_WORKSPACE, 'frequency'), ZunoConstant.FREQUENCY_DEFAULT));
	},
	setFrequency(value)//Сохраняет используемый скетч из настроект текущего проекта
	{
		_set(ZunoConstant.PATH.JSON_WORKSPACE, 'frequency', value);
	},
	getCppIgnored()//Получает Нужно  ли игнорить ошибки в настройках IntelliSense
	{
		const value = _get(ZunoConstant.PATH.JSON_WORKSPACE, 'cppIgnored');
		return ((value == 'Enabled') ? true : false);
	},
	setCppIgnored(value)//Сохраняет Нужно  ли игнорить ошибки в настройках IntelliSense
	{
		value = (value == true) ? 'Enabled' : 'Disabled';
		_set(ZunoConstant.PATH.JSON_WORKSPACE, 'cppIgnored', value);
	},
	getPort()//Получает используемый порт из настроект текущего проекта
	{
		return (_get(ZunoConstant.PATH.JSON_WORKSPACE, 'port'));
	},
	setPort(value)//Сохраняет используемый порт из настроект текущего проекта
	{
		_set(ZunoConstant.PATH.JSON_WORKSPACE, 'port', value);
	},
	getPTI_output()//Получает из настроект текущего проекта
	{
		let value = _get(ZunoConstant.PATH.JSON_WORKSPACE, 'PTI_output');
		if (value == false)
			return (false);
		if (typeof value === 'string' || value instanceof String)
			return (value);
		return (false);
	},
	setPTI_output(value)//Сохраняет в настройках текущего проекта
	{
		_set(ZunoConstant.PATH.JSON_WORKSPACE, 'PTI_output', value);
	},
	getPTI_input()//Получает из настроект текущего проекта
	{
		let value = _get(ZunoConstant.PATH.JSON_WORKSPACE, 'PTI_input');
		if (value == false)
			return (false);
		if (typeof value === 'string' || value instanceof String)
			return (value);
		return (false);
	},
	setPTI_input(value)//Сохраняет в настройках текущего проекта
	{
		_set(ZunoConstant.PATH.JSON_WORKSPACE, 'PTI_input', value);
	},
	getPTI_valid_only()//Получает из настроект текущего проекта
	{
		let value = _get(ZunoConstant.PATH.JSON_WORKSPACE, 'PTI_valid_only');
		if (value == false)
			return (false);
		if (typeof value === 'boolean')
			return (value);
		return (false);
	},
	setPTI_valid_only(value)//Сохраняет в настройках текущего проекта
	{
		_set(ZunoConstant.PATH.JSON_WORKSPACE, 'PTI_valid_only', value);
	},
	getBoardInfo_port()//Получает из настроект текущего проекта
	{
		let value = _get(ZunoConstant.PATH.JSON_WORKSPACE, 'BoardInfo_port');
		if (value == false)
			return (false);
		if (typeof value === 'string' || value instanceof String)
			return (value);
		return (false);
	},
	setBoardInfo_port(value)//Сохраняет в настройках текущего проекта
	{
		_set(ZunoConstant.PATH.JSON_WORKSPACE, 'BoardInfo_port', value);
	},
	getPTI_port()//Получает из настроект текущего проекта
	{
		let value = _get(ZunoConstant.PATH.JSON_WORKSPACE, 'PTI_port');
		if (value == false)
			return (false);
		if (typeof value === 'string' || value instanceof String)
			return (value);
		return (false);
	},
	setPTI_port(value)//Сохраняет в настройках текущего проекта
	{
		_set(ZunoConstant.PATH.JSON_WORKSPACE, 'PTI_port', value);
	},
	getPTI_baudRate()//Получает из настроект текущего проекта
	{
		const baudRate = _get(ZunoConstant.PATH.JSON_WORKSPACE, 'PTI_baudRate');
		if (baudRate == undefined || Number.isInteger(baudRate) == false || baudRate < 230400)
			return (230400);
		return (baudRate);
	},
	setPTI_baudRate(value)//Сохраняет в настройках текущего проекта
	{
		_set(ZunoConstant.PATH.JSON_WORKSPACE, 'PTI_baudRate', value);
	},
	getBoard()//Получает используемый плату
	{
		return (_get(ZunoConstant.PATH.JSON_WORKSPACE, 'board'));
	},
	setBoard(value)//Сохраняет используемый плату
	{
		_set(ZunoConstant.PATH.JSON_WORKSPACE, 'board', value);
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

function _get(file, name)
{//Получает из указанного файла в виде json информацию
	try {//Если битый то просто false возратим
		const array = JSON.parse(Fs.readFileSync(file, "utf8"));
		if (array[name] == undefined)
			return (false);
		return (array[name]);
	} catch (error) {return (false); }
}

async function _set(file, name, value)
{//Сохраняет в указанный файл в виде json информацию
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
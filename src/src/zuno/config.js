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
	getSecurity()//Получает используемую при загрузки скетча security из настроект текущего проекта
	{
		let array;
		if (ZunoConstant.BOARD_CURRENT == undefined)
			array = ZunoConstant.SECURITY;
		else
			array = ZunoConstant.BOARD_CURRENT.security;//Это при загрузки файла не выставленно поэтому ругаеться - поэтому провераем
		return (_arrayFind(ZunoConstant.SECURITY, _get(ZunoConstant.PATH.JSON_WORKSPACE, 'security'), ZunoConstant.SECURITY_DEFAULT));
	},
	setSecurity(value)//Сохраняет используемый скетч из настроект текущего проекта
	{
		_set(ZunoConstant.PATH.JSON_WORKSPACE, 'security', value);
	},
	getPower()//Получает используемую при загрузки скетча мощность передаваемого радио сигнала из настроект текущего проекта
	{
		return (_arrayFind(ZunoConstant.POWER, _get(ZunoConstant.PATH.JSON_WORKSPACE, 'power'), ZunoConstant.POWER_DEFAULT));
	},
	setPower(value)//Сохраняет используемый скетч из настроект текущего проекта
	{
		_set(ZunoConstant.PATH.JSON_WORKSPACE, 'power', value);
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
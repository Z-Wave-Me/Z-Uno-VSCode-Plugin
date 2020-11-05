/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const VsCode = require("vscode");
const Http = require('http');
const Https = require('https');
const Fs = require('fs');
const Path = require('path');


const Constant = require("../constant/constant");

module.exports = {
	getSize: function(url)
	{
		const f = (url[4] == 's') ? Https : Http;//Определяем какой протокол
		return (new Promise(function (resolve, reject) {//Для того что бы синхроно можно было дождаться результата
			const req = f.request(url, function(res) { 
				if (res.statusCode == 200)//Провераем нормально выолнен запрос или нет
					resolve(res.headers['content-length']); 
				else
					resolve(false);
			});//Размер получаем
			req.on('error', function (err) { resolve(false); });//Наслучий ошибки что бы вечно не ожидала данную функцию
			req.end();//Завершаем передачу пакета
		}));
	},
	downLoad: async function(url, path_file)
	{
		const size = await this.getSize(url);//Получаем размер файла для того что бы показать прогресс скачивания
		if (size == false)
		{
			VsCode.window.showWarningMessage(`${Constant.INTERNET_DOWNLOAD_FAILED}: ${url}`);
			return (false);
		}
		return ( await VsCode.window.withProgress({//Показывает прогресс
			location: VsCode.ProgressLocation.Notification,//Где будет отображаться
			title: Path.basename(path_file),//Постоянный загголовок
			cancellable: true//Можно ли отменить
		},
		(progress, token) => {
			return (new Promise((resolve, reject) => {//Для того что бы синхроно можно было дождаться результата
				const f = (url[4] == 's') ? Https : Http;//Определяем какой протокол
				const file = Fs.createWriteStream(path_file);
				const size_kb = parseInt(size / 0x400);
				let byte = 0;
				file.on('open', (fd) => {
					progress.report({ increment: 0, message: `${parseInt(byte / 0x400)}Kb out of ${size_kb}Kb`});//Показываем прогресс начало
					const req = f.get(url, (res) => {
						if (res.statusCode != 200)//Провераем нормально выолнен запрос или нет
							_downLoadError(res.statusMessage + ': ' + url, req);
						res.on('data', (data) => {
							if (Fs.writeSync(fd, data) != data.length)
								_downLoadError(`${Constant.INTERNET_DOWNLOAD_FAILED}: ${url}`, req);
							byte = byte + data.length;
							if (byte > size)
								req.destroy();//Прекращаем качать файл раз ошибка
							else
								progress.report({ increment: data.length / (size / 100), message: `${parseInt(byte / 0x400)}Kb out of ${size_kb}Kb`});//Показываем прогресс еще качаем
						});
					});
					req.on('error', (err) => {//Наслучий ошибки что бы вечно не ожидала данную функцию
						_downLoadError(err.message, req);
					});
					req.on('close', () => {//Это всегда происходит поэтому тут закрываем файл и если надо в случае ошибки удаляем его
						Fs.closeSync(fd);//Закрываем дескриптор что бы освободить к файлу доступ
						if (byte != size)
						{
							try {Fs.unlinkSync(path_file);} catch (error) {}
							resolve(false);
						}
						else
							resolve(size);
					});
					token.onCancellationRequested( () => {//Отменяем скачивание
						_downLoadError(`${Constant.INTERNET_DOWNLOAD_FAILED}: ${url}`, req);
					});
				});
				file.on('error', (err) => {//На случай если не создасться файл
					VsCode.window.showWarningMessage(err.message);
					resolve(false);
				});
			}));
		}));
	}
}

function _downLoadError(msg, req)
{
	VsCode.window.showWarningMessage(msg);
	req.destroy();//Прекращаем качать файл раз ошибка
}

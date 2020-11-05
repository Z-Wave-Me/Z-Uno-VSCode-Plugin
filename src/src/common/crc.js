/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const Сrypto = require('crypto');
const Fs = require('fs');

module.exports = {
	hashFile: function (filename, algorithm, presentation='hex')
	{
		return (new Promise((resolve, reject) => {//Для того что бы синхроно можно было дождаться результата
			const hash = Сrypto.createHash(algorithm);
			const file = Fs.createReadStream(filename);
			file.on('open', (fd) => {
				file.on('readable', () => {
					const data = file.read();
					if (data != false)
						hash.update(data);
					else
						Fs.closeSync(fd);
				});
			});
			file.on('close', () => { resolve (hash.digest(presentation)); });
			file.on('error', () => { resolve (false); });
		}));
	},
	hash: function (data, algorithm, presentation='hex')
	{
		const hash = Сrypto.createHash(algorithm);
		hash.update(data);
		return (hash.digest(presentation));
	}
}

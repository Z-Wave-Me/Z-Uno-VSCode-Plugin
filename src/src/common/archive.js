/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const Path = require('path');
const Fs = require('fs');

const Admzip = require('adm-zip');
const Tar = require('tar');

const _this = {
	extract: async function (archive, path_dest, options = {overwrite: false})
	{
		try
		{
			switch (Path.extname(archive))
			{
				case '.zip':
					try
					{
						const zip = new Admzip(archive);
						zip.extractAllTo(path_dest, options.overwrite);
						return (true);
					} catch (error) {return (false);}
				case '.tar':
				case '.gz':
					try {
						Tar.extract({ file: archive, cwd: path_dest, sync: true });
						return (true);
					} catch (error) { return (false);}
				default:
					return (false);
			}
		} catch (error) {return (false);}
	}
}

module.exports = _this;

// async function _gz(archive, path_dest, options)
// {
// 	const out_file = Path.join(path_dest, Path.basename(archive).replace('.gz', ''));
// 	if (options.overwrite == false && Fs.existsSync(out_file) != false)
// 		return (false);
// 	return (new Promise((resolve, reject) => {
// 		let status= true;
// 		const file_src = Fs.createReadStream(archive);
// 		file_src.on('ready', () => {
// 			const file_dest = Fs.createWriteStream(out_file);
// 			file_dest.on('ready', () => {
// 				const gzip = Zlib.createGunzip();
// 				Stream.pipeline(file_src, gzip, file_dest, (err) => {
// 					if (err != undefined) 
// 					{
// 						status = false;
// 						file_src.close();
// 						file_dest.close();
// 						resolve(false);
// 					}
// 				});
// 			});
// 			file_dest.on('close', () => {
// 				if (status == false)
// 					Fs.unlinkSync(out_file);
// 				resolve(status);
// 			});
// 			file_dest.on('error', (err) => {
// 				file_src.close();
// 				resolve(false);
// 			});
// 		});
// 		file_src.on('error', (err) => {
// 			resolve(false);
// 		});
// 	}));
// }
/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";//Файлы не должны иметь ЗАГЛАВНЫЕ буквы иначе отладка не работает правельно

//Подключаем необходимые модули
const VsCode = require("vscode");
const Path = require("path");
const Fs = require('fs');

const Internet = require("../common/internet");
const Archive = require("../common/archive");
const Crc = require("../common/crc");
const File = require("../common/file");

const ZunoConstant = require("../constant/zunoconstant");
const Constant = require("../constant/constant");

//Создаем обьект для эксорта комманд
const _this = {
	installReCreateDir: async function(path)
	{
		if (Fs.existsSync(path) == false)
		{
			if (await File.mkdir(path, {recursive: true}) == false)
				return (false);
			return (true);
		}
		if (await File.delete(path) == false)
			return (false);
		if (await File.mkdir(path) == false)
			return (false);
		return (true);
	},
	installMove: async function(src, dest, obj)
	{
		for (const key in obj)
		{
			const element = obj[key];
			if (element != false)
			{
				const path_delete = Path.join(dest, key);
				if (await File.stat(path_delete) != false)
				{
					if (await File.delete(path_delete) == false)
					{
						await File.delete(dest);
						await File.delete(src);
						return (false);
					}
				}
			}
		}
		if (await File.moveSubDir(src, dest) == false)
		{
			await File.delete(dest);
			await File.delete(src);
			return (false);
		}
		return (true);
	},
	installFile: async function(path_cache, path_dest, url, checksum)
	{
		const arhive = Path.join(path_cache, Path.basename(url));
		const algorithm = 'sha256';
		checksum = checksum.replace('SHA-256:', '');
		if (await Crc.hashFile(arhive, algorithm) != checksum)
		{
			if (await Internet.downLoad(url, arhive) == false)
				return (false);
			if (await Crc.hashFile(arhive, algorithm) != checksum)
			{
				File.unlink(arhive);
				VsCode.window.showWarningMessage(`${Constant.FILE_NOT_CHECKSUM} : ${arhive} .`);
				return (false);
			}
		}
		if (Archive.extract(arhive, path_dest, {overwrite: true}) == false)
		{
			VsCode.window.showWarningMessage(`${Constant.FILE_NOT_EXTRACT} : ${arhive} .`);
			await File.delete(path_dest);
			return (false);
		}
		const path = Path.join(path_dest, Path.basename(url).replace(Path.extname(url), ''));
		if (Fs.existsSync(path) == false)
			return (true);
		if (await File.moveSubDir(path, path_dest) == false)
		{
			VsCode.window.showWarningMessage(Constant.FILE_FAILED_MOVE);
			await File.delete(path_dest);
			return (false);
		}
		return (true);
	},
	findJsonHardware: function(platforms, version)
	{
		const len = platforms.length;
		for (let i = 0; i < len; i++)
			if (platforms[i].version == version)
				return (platforms[i]);
	},
	findJsonTools: function(array_tools, name, version, host)
	{
		const len = array_tools.length;
		for (let i = 0; i < len; i++)
		{
			const element = array_tools[i];
			if (element.version == version && element.name == name)
			{
				const array = element.systems;
				const len = array.length;
				for (let index = 0; index < len; index++)
				{
					const element = array[index];
					if (element.host == host)
						return (element);
				}
				return (element);
			}
		}
	},
	getJsonLoad: async function(path_install, array_host, path_install_home)
	{
		const install = Path.join(path_install, ZunoConstant.FILE.JSON_LOAD);
		const install_home = Path.join(path_install_home, ZunoConstant.FILE.JSON_LOAD);
		if (await Internet.downLoad(ZunoConstant.FILE.JSON_URL, install) == false)
			return (false);
		let array;
		try {array = JSON.parse(Fs.readFileSync(install, 'utf8')); } catch (error) {array = false;}
		if (array == false)
			return (false);
		if (_validateJson(array, array_host.host_install) == false)
		{
			File.unlink(install);
			VsCode.window.showWarningMessage(`${Constant.FILE_NOT_JSON} : ${install} .`);
			return (false);
		}
		if (install != install_home)
			File.move(install, install_home);
		return (array);
	}
}

module.exports = _this;

function _validateJson(array, host)
{
	try {
		if (array.packages.name != ZunoConstant.DIR.CORE)
			return (false);
		const platforms = array.packages.platforms;
		const tools = array.packages.tools;
		const tools_max = tools.length;
		const len = platforms.length;
		start:
		for (let i = 0; i < len; i++)
		{
			const list = platforms[i];
			if (list.version == undefined || list.checksum == undefined || list.size == undefined || list.url == undefined)
				return (false);
			const dependencies = list.toolsDependencies;
			for (let i = 0; i < dependencies.length; i++)
			{
				const list = dependencies[i];
				const version = list.version;
				const name = list.name;
				for (let i = 0; i < tools_max; i++)
				{
					const list = tools[i];
					if (list.name == name && list.version == version)
					{
						const systems = list.systems;
						for (let i = 0; i < systems.length; i++)
						{
							const list = systems[i];
							if (list.host == host)
							{
								if (list.checksum == undefined || list.size == undefined || list.url == undefined)
									return (false);
								continue start;
							}
						}
					}
				}
			}
			return (false);
		}
	} catch (error) { return (false); }
	return (true);
}
/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const Fs = require('fs');
const Path = require('path');

const _this = {
	readdir: function (path)
	{
		return (new Promise((resolve, reject) => {
			Fs.readdir(path, (error, children) => {
				if (error != undefined)
					resolve(false);
				resolve(children);
			});
		}));
	},
	chmod: function (path, mode)
	{
		return (new Promise((resolve, reject) => {
			Fs.chmod(path, mode, (err) => {
				if (err != undefined)
					resolve(false);
				resolve(true);
			});
		}));
	},
	stat: function (path)
	{
		return (new Promise((resolve, reject) => {
			Fs.stat(path, (err, st) => {
				if (err != undefined)
					resolve(false);
				resolve(st);
			});
		}));
	},
	rename: function (src, dest)
	{
		return (new Promise((resolve, reject) => {
			Fs.rename(src, dest, (err) => {
				if (err != undefined)
					resolve(false);
				resolve(true);
			});
		}));
	},
	copyFile: function (src, dest)
	{
		return (new Promise((resolve, reject) => {
			Fs.copyFile(src, dest, (err) => {
				if (err != undefined)
					resolve(false);
				resolve(true);
			});
		}));
	},
	unlink: function (path)
	{
		return (new Promise((resolve, reject) => {
			Fs.unlink(path, (err) => {
				if (err != undefined)
					resolve(false);
				resolve(true);
			});
		}));
	},
	mkdir: function (path, options = {recursive: false})
	{
		return (new Promise((resolve, reject) => {
			Fs.mkdir(path, options, (err) => {
				if (err != undefined)
					resolve(false);
				resolve(true);
			});
		}));
	},
	rmdir: function (path)
	{
		return (new Promise((resolve, reject) => {
			Fs.rmdir(path, (err) => {
				if (err != undefined)
					resolve(false);
				resolve(true);
			});
		}));
	},
	delete: async function (path)
	{//Удаляет файл или папку и все что в ней находиться
		const st = await _this.stat(path);
		if (st == false)
			return (false);
		if (st.isDirectory() == false)
		{
			if (await _this.unlink(path) == false)
				return (false);
			return (true);
		}
		return (new Promise((resolve, reject) => {
			Fs.readdir(path, async (err, array) => {
				if (err != undefined)
					resolve(false);
				const len = array.length;
				for (let index = 0; index < len; index++)
					if (await _this.delete(Path.join(path, array[index])) == false)
						resolve(false);
				if (await _this.rmdir(path) == false)
					resolve(false);
				resolve(true);
			});
		}));
	},
	move: async function (src, dest)
	{//Перемещает папку с еесодержимым или же файл
		const st = await _this.stat(src);
		if (st == false)
			return (false);
		if (st.isDirectory() == false)
		{
			const path = Path.dirname(dest);
			if (Fs.existsSync(path) == false)
				if (await _this.mkdir(path, {recursive: true}) == false)
					return (false);
			if (await _this.rename(src, dest) == false)
			{
				if (await _this.copyFile(src, dest) == false)
					return (false);
				else if (await _this.unlink(src) == false)
					return (false);
			}
			return (true);
		}
		if (await _this.mkdir(dest, {recursive: true}) == false)
			return (false);
		return (new Promise((resolve, reject) => {
			Fs.readdir(src, async (err, array) => {
				if (err != undefined)
					resolve(false);
				const len = array.length;
				for (let index = 0; index < len; index++)
				{
					const name = array[index];
					if (await _this.move(Path.join(src, name), Path.join(dest, name)) == false)
						resolve(false);
				}
				if (await _this.rmdir(src) == false)
					resolve (false);
				resolve(true);
			});
		}));
	},
	moveSubDir: async function (src, dest)
	{//Перемещает содержимое папки а ее саму удаляет в конце
		const st = await _this.stat(src);
		if (st == false)
			return (false);
		if (st.isDirectory() == false)
			return (false);
		return (new Promise((resolve, reject) => {
			Fs.readdir(src, async (err, array) => {
				if (err != undefined)
					resolve(false);
				const len = array.length;
				for (let index = 0; index < len; index++)
				{
					const name = array[index];
					if (await _this.move(Path.join(src, name), Path.join(dest, name)) == false)
						resolve(false);
				}
				if (await _this.rmdir(src) == false)
					resolve (false);
				resolve(true);
			});
		}));
	}
}

module.exports = _this;
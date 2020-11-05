/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const ChildProcess = require("child_process");
const Utils = require('./utils');
const _this = {
	spawn: function(cmd, stdout = false, stderr = false, args = [], options = {})
	{
		return (new Promise((resolve, reject) => {
			const child = ChildProcess.spawn(cmd, args, options);
			child.on("error", (err) => {
				Utils.setLastError(err);
				resolve(false);
			});
			child.on("exit", (code) => {
				resolve(code);
			});
			if (stdout != false)
			{
				child.stdout.on("data", (data) => {stdout(data, resolve);});
			}
			if (stderr != false)
			{
				child.stderr.on("data", (data) => {stderr(data, resolve);});
			}
		}));
	}
}

module.exports = _this;

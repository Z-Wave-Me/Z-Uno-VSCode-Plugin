/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули

const _this = {
	_err: undefined,
	sleep: function (ms)
	{
		return new Promise((resolve, reject) => setTimeout(resolve, ms));
	},
	setLastError: function(err)
	{
		_this._err = err;
	},
	getLastError: function()
	{
		return(_this._err);
	}
}

module.exports = _this;
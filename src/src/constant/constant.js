/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const VsCode = require("vscode");

switch (VsCode.env.language)
{
	case 'ru':
		module.exports = require('./constant.nls.ru');
		break;
	default:
		module.exports = require('./constant.nls');
		break;
}


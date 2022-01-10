/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const VsCode = require('vscode');
const Path = require("path");

const Crc = require("../common/crc");

const Config = require("./config");
const ZunoConstant = require("../constant/zunoconstant");

const _this = {
	sketch:
	{
		init(context)
		{
			_sketchActive(VsCode.window.activeTextEditor);
			context.subscriptions.push(VsCode.window.onDidChangeActiveTextEditor((texteditor) => {_sketchActive(texteditor);}));//Что бы знать активный скетч обрабатываем активную вкладку
			context.subscriptions.push(VsCode.workspace.onDidCloseTextDocument((document) => {_sketchActiveClose(document);}));//Что бы знать активный скетч обрабатываем закрытие
			const sketch = Config.getSketch();
			const obj = VsCode.window.createStatusBarItem(VsCode.StatusBarAlignment.Right, ZunoConstant.BARPRIORITY.SKETCH);
			_this.sketch.value = sketch;
			_this.sketch.obj = obj;
			obj.command = ZunoConstant.CMD.SKETCH;
			obj.tooltip = ZunoConstant.SKETCH_PLACEHOLDER;
			if (sketch != false)
			{
				_this.sketch.path_tmp = Path.join(ZunoConstant.PATH.TMP_BUILD, ZunoConstant.BOARD_CURRENT.core, Crc.hash(sketch, 'md5'));
				obj.text = Path.basename(sketch)
			}
			else
				obj.text = ZunoConstant.SKETCH_BAR_TEXT;
			obj.show();
		},
		set: function(sketch, path_sketch)
		{
			_this.sketch.value = sketch;
			_this.sketch.path_tmp = Path.join(ZunoConstant.PATH.TMP_BUILD, ZunoConstant.BOARD_CURRENT.core, Crc.hash(path_sketch, 'md5'));
			_this.sketch.obj.text = Path.basename(sketch);
		},
		getActiveSketch()
		{
			const path_sketch = _this.sketch.active_sketch_active;
			if (path_sketch == undefined)
				return (false);
			return (path_sketch);
		},
		getTmp(path_sketch)
		{
			if (_this.sketch.path_tmp == undefined )
				return (Path.join(ZunoConstant.PATH.TMP_BUILD, ZunoConstant.BOARD_CURRENT.core, Crc.hash(path_sketch, 'md5')));
			return (_this.sketch.path_tmp);
		},
		get()
		{
			return (_this.sketch.value);
		}
	},
	monitor:
	{
		init()
		{
			const obj = VsCode.window.createStatusBarItem(VsCode.StatusBarAlignment.Right, ZunoConstant.BARPRIORITY.MONITOR);
			_this.monitor.obj = obj;
			obj.command = ZunoConstant.CMD.MONITOR;
			obj.tooltip = ZunoConstant.MONITOR_TOOLTIP;
			obj.text = ZunoConstant.MONITOR_BAR_TEXT;
			obj.show();
		}
	},
	settings:
	{
		init()
		{
			const obj = VsCode.window.createStatusBarItem(VsCode.StatusBarAlignment.Right, ZunoConstant.BARPRIORITY.SETTINGS);
			_this.settings.obj = obj;
			obj.command = ZunoConstant.CMD.SETTING;
			obj.tooltip = ZunoConstant.SETTINGS_TOOLTIP;
			obj.text = ZunoConstant.SETTING_BAR_TEXT;
			obj.show();
		}
	},
	board:
	{
		obj: undefined,
		value: undefined,
		array: undefined,
		init()
		{
			let board = Config.getBoard();
			let array = false;
			for (let key in ZunoConstant.BOARD)
			{
				if (ZunoConstant.BOARD[key].core == board)
				{
					array = true;
					break ;
				}
			}
			if (array == false)
				board = ZunoConstant.BOARD.ZUNO2.core;
			const obj = VsCode.window.createStatusBarItem(VsCode.StatusBarAlignment.Right, ZunoConstant.BARPRIORITY.BOARD);
			this.obj = obj;
			obj.command = ZunoConstant.CMD.BOARD;
			obj.tooltip = ZunoConstant.BOARD_PLACEHOLDER;
			this.set(board);
			obj.show();
		},
		set(board)
		{
			this.value = board;
			this.obj.text = board;
			for (let key in ZunoConstant.BOARD)
			{
				if (ZunoConstant.BOARD[key].core == this.value)
				{
					this.array = ZunoConstant.BOARD[key];
					break ;
				}
			}
		},
		getArrayString()
		{
			let array = [];
			for (let key in ZunoConstant.BOARD)
				array.push({description: ZunoConstant.BOARD[key].description, label: ZunoConstant.BOARD[key].core});
			return (array);
		},
		getArray()
		{
			return (this.array);
		},
		get()
		{
			return (this.value);
		}
	},
	port:
	{
		init()
		{
			const port = Config.getPort();
			const obj = VsCode.window.createStatusBarItem(VsCode.StatusBarAlignment.Right, ZunoConstant.BARPRIORITY.PORT);
			_this.port.value = port;
			_this.port.obj = obj;
			obj.command = ZunoConstant.CMD.PORT;
			obj.tooltip = ZunoConstant.PORT_PLACEHOLDER;
			obj.text = (port == false) ? ZunoConstant.PORT_BAR_TEXT : port;
			obj.show();
		},
		set(port)
		{
			_this.port.value = port;
			_this.port.obj.text = port;
		},
		get()
		{
			return (_this.port.value);
		}
	},
	power:
	{
		value: Config.getPower(),
		set(power)
		{
			_this.power.value = power;
		},
		get()
		{
			return (_this.power.value);
		}
	},
	frequency:
	{
		value: Config.getFrequency(),
		set(frequency)
		{
			_this.frequency.value = frequency;
		},
		get()
		{
			return (_this.frequency.value);
		}
	},
	rf_logging:
	{
		value: Config.getRfLogging(),
		set(rf_logging)
		{
			_this.rf_logging.value = rf_logging;
		},
		get()
		{
			return (_this.rf_logging.value);
		}
	},
	security:
	{
		value: Config.getSecurity(),
		set(security)
		{
			_this.security.value = security;
		},
		get()
		{
			return (_this.security.value);
		}
	}
}

module.exports = _this;

function _sketchActiveClose(document)
{
	if (document == undefined)
		return ;
	const path_sketch = document.fileName;
	if (ZunoConstant.REGEXP.SKETCH.test(path_sketch) == false)
		return ;
	if (_this.sketch.active_sketch_active == path_sketch)
	_this.sketch.active_sketch_active = undefined;
}

function _sketchActive(texteditor)
{
	if (texteditor == undefined)
		return ;
	const path_sketch = texteditor.document.fileName;
	if (ZunoConstant.REGEXP.SKETCH.test(path_sketch) == false)
		return ;
	_this.sketch.active_sketch_active = path_sketch;
}
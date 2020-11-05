/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули



const _this = {
	cmpUp: function(a, b)//От меньшего к большему с учетам цифар
	{
		let alist = a.split(/(\d+)/); // split text on change from anything to digit and digit to anything
		let blist = b.split(/(\d+)/); // split text on change from anything to digit and digit to anything

		alist.slice(-1) == '' ? alist.pop() : null; // remove the last element if empty
		blist.slice(-1) == '' ? blist.pop() : null; // remove the last element if empty

		for (var i = 0, len = alist.length; i < len;i++)
		{
			if (alist[i] != blist[i])
			{// find the first non-equal part
				if (alist[i].match(/\d/)) // if numeric
					return +alist[i] - +blist[i]; // compare as number
				else
					return alist[i].localeCompare(blist[i]); // compare as string
			}
		}
		return (true);
	},
	cmpDown: function(a, b)//От большему к меньшему с учетам цифар
	{
		const out = _this.cmpUp(a, b);
		if (out > 0)
			return (-1);
		if (out < 0)
			return (1);
		return (0);
	}
}

module.exports = _this;

/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const Os = require("os");

const _this = {
/*-------------------------------*/
	OUTPUT_START: '[Starting]',
	OUTPUT_END: '[Done]',
	OUTPUT_INFO: '[Info]',
	OUTPUT_ERROR: '[Error]',
	OUTPUT_WARNING: '[Warning]',
/*-------------------------------*/
	START_NOT_SUPPORT: 'Not supported platform "${Os.platform()}" and CPU architecture "${Os.arch()}"',
	START_KEY_QUESTION: 'Want to customize keyboard shortcuts for Z-Uno?',
	START_KEY_FIND: 'To sort in: \'Z-Uno\'',
	START_UPDATE_NEW_VERSION: 'New Z-Uno version released',
	START_UPDATE_LATER: 'Remind me later',
	START_UPDATE_SKIP: 'Skip this version',
/*-------------------------------*/
	INSTALL_SUCCESS: 'Installation was successful',
	INSTALL_TITLE: 'Z-Uno: Install',
	INSTALL_REPORT_PACK: 'Get the necessary component',
	INSTALL_REPORT_MOVE: 'Move all the components',
	INSTALL_CONTINUE: 'Not installed the components necessary for assembly, install now?',
	INSTALL_DELETE_NOT_INSTALL: 'Uninstall the current version without installing a new one?',
	INSTALL_PLACEHOLDER: 'Select the version to install',
	INSTALL_INVALID_CORE: 'There are problems with the installed components. Reinstall them',
/*-------------------------------*/
	PORT_NOT_AVIABLE: 'No serial port is available',
	PORT_PLACEHOLDER: 'Select a serial port',
	PORT_BAR_TEXT: '<Select port>',
/*-------------------------------*/
	MONITOR_TOOLTIP: 'Open serial monitor',
	MONITOR_BAR_TEXT: '$(plug)',
/*-------------------------------*/
	BOOTLOADER_TOOLTIP: 'Burn bootloader',
	BOOTLOADER_BAR_TEXT: '$(triangle-up)',
/*-------------------------------*/
	SETTINGS_TOOLTIP: 'Additional settings and features',
	SETTING_BAR_TEXT: '$(settings-gear)',
/*-------------------------------*/
	CPP_TOOLS_ADD_CONFIG: 'There was an added configuration ${name} to allow Z-Uno to work with IntelliSense, now you need to select this config',
	CPP_TOOLS_INCOMPLETE_CONFIG: 'There are Z-Uno settings for working with IntelliSense, but they are not complete. What do we do?',
/*-------------------------------*/
	SERIALMONITOR_LIMITS_OPEN: 'Exceeded the limit on the simultaneous open number of monitors.',
	SERIALMONITOR_NOT_OPEN: 'Could not open port',
	SERIALMONITOR_FALIED_READ: 'Error reading port: ${port}, the monitor stops working.',
	SERIALMONITOR_CHANNEL: 'Serial monitor',
	SERIALMONITOR_BAR_TEXT_MONITOR: 'Monitor',
	SERIALMONITOR_BAR_TOOLTIP_MONITOR: 'Additional settings and features',
	SERIALMONITOR_CURRENTOPTIONS_NOT_UPLOAD: 'You cannot configure the monitor while the port is being used for loading',
	SERIALMONITOR_CURRENTOPTIONS_TEXT_CLOSE: 'Close monitor',
	SERIALMONITOR_CURRENTOPTIONS_TEXT_CLOSE_DECRIPTION: 'Completely closes the monitor',
	SERIALMONITOR_CURRENTOPTIONS_TEXT_PAUSE: 'Pause',
	SERIALMONITOR_CURRENTOPTIONS_TEXT_PAUSE_DECRIPTION: 'Pause monitor',
	SERIALMONITOR_CURRENTOPTIONS_TEXT_RESUME: 'Resume',
	SERIALMONITOR_CURRENTOPTIONS_TEXT_RESUME_DECRIPTION: 'Resume monitor',
	SERIALMONITOR_OPTIONS_TEXT: 'Open monitor',
	SERIALMONITOR_OPTIONS_DECRIPTION: 'Stop changing settings',
	SERIALMONITOR_OPTIONS_PLACEHOLDER: 'Open the monitor with the current settings or change them',
	SERIALMONITOR_OPTIONS_PORT_DECRIPTION: 'Serial port',
	SERIALMONITOR_OPTIONS_NOT_PORT: 'To open the monitor you need to select the port. Would you like to specify it?',
	SERIALMONITOR_OPTIONS_BAUDRATE_CHANGE: 'Failed to change baudrate',
	SERIALMONITOR_OPTIONS_BAUDRATE_DECRIPTION: 'Baudrate',
	SERIALMONITOR_OPTIONS_BAUDRATE_MANUAL: 'Select manually...',
	SERIALMONITOR_OPTIONS_BAUDRATE_MANUAL_PLACEHOLDER: 'Enter the baudrate manually',
	SERIALMONITOR_OPTIONS_BAUDRATE_MANUAL_NUMBER: 'You need to enter only numbers',
/*-------------------------------*/
	SYSTEM_EXIT_CODE: 'Exit with code',
	SYSTEM_PROCESS_BUSY: 'You cannot start because the required component is busy in another task.',
	SYSTEM_NOT_SUPPORT: 'Your system is not supported!',
	SYSTEM_PATH_CONTINUE: 'The path to the files necessary for assembly is not specified. Continue?',
	SYSTEM_NOT_PATH: 'The path to the files required for installation is not specified!',
/*-------------------------------*/
	SKETCH_PLACEHOLDER: 'Select sketch file',
	SKETCH_BAR_TEXT: '<Select sketch>',
	SKETCH_TOO_FIND: 'Sketch files found',
	SKETCH_NOT_REGULAR: 'Invalid sketch file name. Should be *.ino',
/*-------------------------------*/
	UPLOAD_SELECT_SKETH: 'First you need to choose sketch',
	UPLOAD_SELECT_PORT: 'Need to choose a serial port',
	UPLOAD_VERIFY_TITLE: 'Z-Uno: Verify...',
	UPLOAD_VERIFY_START: 'Verify sketch - ',
	UPLOAD_VERIFY_END: 'Finished verify sketch - ',
	UPLOAD_BOOTLOADER_TITLE: 'Z-Uno: Burn...',
	UPLOAD_BOOTLOADER_START: 'Burn bootloader - ',
	UPLOAD_BOOTLOADER_END: 'Finished burn bootloader - ',
	UPLOAD_TITLE: 'Z-Uno: Upload...',
	UPLOAD_START: 'Upload sketch - ',
	UPLOAD_END: 'Finished upload sketch - ',
	UPLOAD_STORAGE_BIG: 'Section \'text\' exceeds available space in board, sketch too big.',
	UPLOAD_DYNAMIC_BIG: 'Section \'data\' exceeds available space in board, not enough memory.',
	UPLOAD_USAGE_MEMORY_STORAGE: 'Sketch uses ${STORAGE_USE} bytes (${STORAGE_USE_RATE}%) of program storage space. Maximum is ${STORAGE_MAX} bytes.',
	UPLOAD_USAGE_MEMORY_DYNAMIC: 'Global variables use ${DYNAMIC_USE} bytes (${DYNAMIC_USE_RATE}%) of dynamic memory, leaving ${DYNAMIC_LOCAL} bytes for local variables. Maximum is ${DYNAMIC_MAX} bytes.',
/*-------------------------------*/
	STATUS: 'Status',
	STATUS_ACTIVE: 'Active',
	STATUS_PAUSE: 'Pause',
	STATUS_INSTALL: 'Installed',
	STATUS_NOT_INSTALL: 'Not installed',
/*-------------------------------*/
	SECURITY_DEFAULT: ['S0', 'Disabled'],
	SECURITY_PLACEHOLDER: 'Select a security',
	SECURITY:
	[
		['S0', 'Disabled'],
		['S1', 'Enabled']
	],
/*-------------------------------*/
	FREQUENCY_DEFAULT: ['EU', 'Europe'],
	FREQUENCY_PLACEHOLDER: 'Select a frequency',
	FREQUENCY:
	[
		['ANZ', 'Australia & New Zealand, Brazil'],
		['CN', 'China'],
		['EU', 'Europe'],
		['HK', 'Hong Kong'],
		['IL', 'Israel'],
		['IN', 'India'],
		['JP', 'Japan'],
		['KR', 'Korea'],
		['RU', 'Russian'],
		['US', 'USA']
	]
}

module.exports = _this;
/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const Os = require("os");

const _this = {
/*-------------------------------*/
	Z_UNO_DESCRIPTION: ' - first generation of Z-Uno board.',
	Z_UNO2_DESCRIPTION: ' - the second generation of the Z-Uno2 board.',
	Z_UNO2_BETA_DESCRIPTION: ' - the second generation of the Z-Uno2 board beta.',

/*-------------------------------*/
	OUTPUT_START: '[Starting]',
	OUTPUT_END: '[Done]',
	OUTPUT_INFO: '[Info]',
	OUTPUT_ERROR: '[Error]',
	OUTPUT_WARNING: '[Warning]',
/*-------------------------------*/
	START_NOT_SUPPORT: `Not supported platform '${Os.platform()}' and CPU architecture '${Os.arch()}'`,
	START_KEY_QUESTION: 'Want to customize keyboard shortcuts for Z-Uno?',
	START_KEY_FIND: 'To sort in: \'Z-Uno\'',
	START_UPDATE_NEW_VERSION: 'New Z-Uno version released',
	START_UPDATE_NEW_HOW: 'Update how',
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
	BOARD_PLACEHOLDER: 'Select board type',
	BOARD_BAR_TEXT: '<Select board>',
/*-------------------------------*/
	COMPLIER_OPTIONS_PLACEHOLDER: 'Enter compilation options through ";"',
/*-------------------------------*/
	BOOTLOADER_TOOLTIP: 'Burn bootloader',
	BOOTLOADER_BAR_TEXT: '$(triangle-up)',
/*-------------------------------*/
	SETTINGS_TOOLTIP: 'Additional settings and features',
	SETTING_BAR_TEXT: '$(settings-gear)',
/*-------------------------------*/
	CPP_TOOLS_ADD_CONFIG: 'There was an added configuration "${name}" to allow Z-Uno to work with IntelliSense, now you need to select this config',
	CPP_TOOLS_INCOMPLETE_CONFIG: 'The "${name}" settings for IntelliSense to work are incomplete. What do we do?',
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
	SERIALMONITOR_OPTIONS_PAUSE_CHANGE: 'Unable to suspend the monitor',
	SERIALMONITOR_OPTIONS_RESUME_CHANGE: 'Unable to resume monitor',
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
	SECURITY_DEFAULT: ['S0', 'Disabled', '0'],
	SECURITY_PLACEHOLDER: 'Select a security',
	SECURITY:
	[
		['S0', 'Disabled', '0'],
		['S1', 'S1', '1'],
		['S2', 'Enabled', '2']
	],
	SECURITY2:
	[
		['S0', 'Disabled', '0'],
		['S2', 'Enabled', '2']
	],
/*-------------------------------*/
	RF_LOGGING_DEFAULT: ['Off', 'Disabled', '0'],
	RF_LOGGING_PLACEHOLDER: 'Enables radio logging',
	RF_LOGGING:
	[
		['Off', 'Disabled', '0'],
		['On', 'Enabled', '1']
	],
/*-------------------------------*/
	UTILITES_DEFAULT: 'Utilities - ',
	UTILITES_PLACEHOLDER: 'List of additional commands',
	UTILITES_ERASENVM_PLACEHOLDER: 'Erases device NVM data completely',
	UTILITES_ERASENVM_TITLE: 'Z-Uno: Erasing NVM...',
	UTILITES_ERASENVM_START: 'Erasing NVM - ',
	UTILITES_ERASENVM_END: 'Completed erase NVM - ',
	UTILITES_PTI_PLACEHOLDER: 'PTI Tracer tool',
	UTILITES_PTI_OPTIONS_TEXT: 'Open PTI',
	UTILITES_PTI_OPTIONS_DECRIPTION: 'Stop changing settings',
	UTILITES_PTI_OPTIONS_PLACEHOLDER: 'Open the PTI with the current settings or change them',
	UTILITES_PTI_OPTIONS_BAUDRATE_DECRIPTION: 'Baudrate',
	UTILITES_PTI_OPTIONS_BAUDRATE_MANUAL: 'Select manually...',
	UTILITES_PTI_OPTIONS_BAUDRATE_MANUAL_PLACEHOLDER: 'Enter the baudrate manually',
	UTILITES_PTI_OPTIONS_BAUDRATE_MANUAL_NUMBER: 'You need to enter only numbers',
	UTILITES_PTI_OPTIONS_BAUDRATE_MANUAL_NUMBER_LESS: 'Less than 230400 is not supported',
	UTILITES_PTI_OPTIONS_INPUT_DECRIPTION: 'Uses JSON file instead of real PTI-device. Prints packages',
	UTILITES_PTI_OPTIONS_OUTPUT_DECRIPTION: 'Dumps all received packages to specified file',
	UTILITES_PTI_OPTIONS_JSON_FILTR: {'Json file': ['json']},
	UTILITES_PTI_OPTIONS_VALID_ONLY_DECRIPTION: 'Prints only packages with right CRC',
	UTILITES_PTI_OPTIONS_NOT_PORT: 'To open PTI you need to select a port. Do you want to choose?',
	UTILITES_BOARDINFO_PLACEHOLDER: 'Extracts metadata from connected Z-Uno board',
	UTILITES_BOARDINFO_OPTIONS_TEXT: 'Get Info',
	UTILITES_BOARDINFO_OPTIONS_DECRIPTION: 'Stop changing settings',
	UTILITES_BOARDINFO_OPTIONS_PLACEHOLDER: 'Get Info with the current settings or change them',
	UTILITES_BOARDINFO_TITLE: 'Z-Uno: Board Info...',
	UTILITES_BOARDINFO_START: 'Board Info - ',
	UTILITES_BOARDINFO_END: 'Completed Board Info - ',
	UTILITES_BOARDINFO_NOT_PORT: 'To get information, you need to select a port. Do you want to choose?',
	UTILITES_LICENSE_PLACEHOLDER: 'Set license',
	UTILITES_LICENSE_MANUAL_PLACEHOLDER: 'Enter 48 digit license number',
	UTILITES_LICENSE_MANUAL_LENGTH_PLACEHOLDER: 'Number of characters must be 48',
	UTILITES_LICENSE_MANUAL_SYMBOL_PLACEHOLDER: 'Only the following characters can be used: 0 - 9, A - F',
	UTILITES_LICENSE_TITLE: 'Z-Uno: License...',
	UTILITES_LICENSE_START: 'License - ',
	UTILITES_LICENSE_END: 'Completed License - ',
	UTILITES_LICENSE_NOT_PORT: 'To install a license, you need to select a port. Do you want to choose?',
	/*-------------------------------*/
	MULTI_CHIP_PLACEHOLDER: 'Choose the chip you want to work with',
	/*-------------------------------*/
	POWER_PLACEHOLDER: 'Select RF power from %min% to %max%',
	POWER_NOT_REGULAR: 'Enter a number between %min% and %max%',
/*-------------------------------*/
	UART_BAUDRATE_PLACEHOLDER: 'Select the desired speed from the supported ones: %baudrate%',
/*-------------------------------*/
	FREQUENCY_PLACEHOLDER: 'Select a frequency',
/*-------------------------------*/
	SKETCH_ENCRYPTION_PLACEHOLDER: 'Select a key',
}

module.exports = _this;
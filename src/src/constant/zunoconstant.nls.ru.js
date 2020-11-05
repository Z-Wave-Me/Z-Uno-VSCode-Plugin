/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const Os = require("os");

const _this = {
/*-------------------------------*/
	OUTPUT_START: '[Начало]',
	OUTPUT_END: '[Готово]',
	OUTPUT_INFO: '[Информация]',
	OUTPUT_ERROR: '[Ошибка]',
	OUTPUT_WARNING: '[Внимание]',
/*-------------------------------*/
	START_NOT_SUPPORT: `Не поддерживает платформу '${Os.platform()}' и архитектуру процессора '${Os.arch()}'`,
	START_KEY_QUESTION: 'Желаете настроить сочетания клавиш для Z-Uno?',
	START_KEY_FIND: 'Чтобы отсортировать в ведите: \'Z-Uno\'',
	START_UPDATE_NEW_VERSION: 'Вышла новая версия Z-Uno',
	START_UPDATE_LATER: 'Позже напомнить',
	START_UPDATE_SKIP: 'Пропустить эту версию',
/*-------------------------------*/
	INSTALL_SUCCESS: 'Установка прошла успешно!',
	INSTALL_TITLE: 'Z-Uno: Установка',
	INSTALL_REPORT_PACK: 'Получаем необходимый компонент',
	INSTALL_REPORT_MOVE: 'Перемещаем все компоненты',
	INSTALL_CONTINUE: 'Не установлены компоненты, необходимые для сборки, установить сейчас?',
	INSTALL_DELETE_NOT_INSTALL: 'Удалить текущую версию, не устанавливая новую?',
	INSTALL_PLACEHOLDER: 'Выберите версию для установки',
	INSTALL_INVALID_CORE: 'Кажется, есть некоторые проблемы с установленными компонентами. Переустановите их!',
/*-------------------------------*/
	PORT_NOT_AVIABLE: 'Последовательный порт недоступен',
	PORT_PLACEHOLDER: 'Выберите последовательный порт',
	PORT_BAR_TEXT: '<Выбрать порт>',
/*-------------------------------*/
	MONITOR_TOOLTIP: 'Открыть последовательный порт',
	MONITOR_BAR_TEXT: '$(plug)',
/*-------------------------------*/
	BOOTLOADER_TOOLTIP: 'Записать загрузчик',
	BOOTLOADER_BAR_TEXT: '$(triangle-up)',
/*-------------------------------*/
	SETTINGS_TOOLTIP: 'Дополнительные настройки и функции',
	SETTING_BAR_TEXT: '$(settings-gear)',
/*-------------------------------*/
	CPP_TOOLS_ADD_CONFIG: 'Что бы Z-Uno мог работать с IntelliSense была добавленная конфигурация ${name}, теперь нужно выбрать, что бы стала текущей',
	CPP_TOOLS_INCOMPLETE_CONFIG: 'Настройки Z-Uno для работы с IntelliSense есть, но они не полные. Что будем делать?',
/*-------------------------------*/
	SERIALMONITOR_LIMITS_OPEN: 'Превышен лимит на одновременное открытое количество мониторов.',
	SERIALMONITOR_NOT_OPEN: 'Не удалось открыть порт',
	SERIALMONITOR_FALIED_READ: 'Ошибка чтения порта: ${port}, монитор прекращает свою работу.',
	SERIALMONITOR_CHANNEL: 'Последовательный монитор',
	SERIALMONITOR_BAR_TEXT_MONITOR: 'Монитор',
	SERIALMONITOR_BAR_TOOLTIP_MONITOR: 'Дополнительные настройки и функции',
	SERIALMONITOR_CURRENTOPTIONS_NOT_UPLOAD: 'Покуда используемый монитором порт используется для загрузки - настраивать монитор нельзя',
	SERIALMONITOR_CURRENTOPTIONS_TEXT_CLOSE: 'Закрыть монитор',
	SERIALMONITOR_CURRENTOPTIONS_TEXT_CLOSE_DECRIPTION: 'Полностью закрывает монитор',
	SERIALMONITOR_CURRENTOPTIONS_TEXT_PAUSE: 'Пауза',
	SERIALMONITOR_CURRENTOPTIONS_TEXT_PAUSE_DECRIPTION: 'Приостановить работу монитора',
	SERIALMONITOR_CURRENTOPTIONS_TEXT_RESUME: 'Возобновить',
	SERIALMONITOR_CURRENTOPTIONS_TEXT_RESUME_DECRIPTION: 'Возобновить работу монитора',
	SERIALMONITOR_OPTIONS_TEXT: 'Открыть монитор',
	SERIALMONITOR_OPTIONS_DECRIPTION: 'Прекращает изменения настроек',
	SERIALMONITOR_OPTIONS_PLACEHOLDER: 'Откройте монитор с текущими настройками или измените их',
	SERIALMONITOR_OPTIONS_PORT_DECRIPTION: 'Последовательный порт',
	SERIALMONITOR_OPTIONS_NOT_PORT: 'Чтобы открыть монитор нужно выбрать порт. Желаете указать его?',
	SERIALMONITOR_OPTIONS_BAUDRATE_CHANGE: 'Не удалось изменить скорость передачи данных',
	SERIALMONITOR_OPTIONS_BAUDRATE_DECRIPTION: 'Скорость передачи данных',
	SERIALMONITOR_OPTIONS_BAUDRATE_MANUAL: 'Указать в ручную...',
	SERIALMONITOR_OPTIONS_BAUDRATE_MANUAL_PLACEHOLDER: 'Введите скорость передачи данных в ручную',
	SERIALMONITOR_OPTIONS_BAUDRATE_MANUAL_NUMBER: 'Вводить нужно только цифры',
/*-------------------------------*/
	SYSTEM_EXIT_CODE: 'Завершила работу с кодом',
	SYSTEM_PROCESS_BUSY: 'Вы не можете запустить, потому что необходимый компонент занят в другой задаче.',
	SYSTEM_NOT_SUPPORT: 'Ваша система не поддерживается!',
	SYSTEM_PATH_CONTINUE: 'Путь к файлам, необходимым для сборки, не указан. Продолжить?',
	SYSTEM_NOT_PATH: 'Путь к файлам, необходимым для установки, не указан!',
/*-------------------------------*/
	SKETCH_PLACEHOLDER: 'Выберите скетч файл',
	SKETCH_BAR_TEXT: '<Выбрать скетч>',
	SKETCH_TOO_FIND: 'Скетч файлов найдено',
	SKETCH_NOT_REGULAR: 'Неверное имя файла скетча. Должно быть *.ino',
/*-------------------------------*/
	UPLOAD_SELECT_SKETH: 'Сначала нужно выбрать sketch',
	UPLOAD_SELECT_PORT: 'Вам нужно выбрать последовательный порт',
	UPLOAD_VERIFY_TITLE: 'Z-Uno: Проверка...',
	UPLOAD_VERIFY_START: 'Проверка скетча - ',
	UPLOAD_VERIFY_END: 'Завершена проверка скетча - ',
	UPLOAD_BOOTLOADER_TITLE: 'Z-Uno: Запись...',
	UPLOAD_BOOTLOADER_START: 'Запись загрузчика - ',
	UPLOAD_BOOTLOADER_END: 'Завершена запись загрузчика - ',
	UPLOAD_TITLE: 'Z-Uno: Загрузка...',
	UPLOAD_START: 'Загрузка скетча - ',
	UPLOAD_END: 'Завершена загрузка скетча - ',
	UPLOAD_STORAGE_BIG: 'Секция \'text\' превышает доступное пространство на плате, скетч слишком большой.',
	UPLOAD_DYNAMIC_BIG: 'Секция \'data\' превышает доступное место на плате, недостаточно памяти.',
	UPLOAD_USAGE_MEMORY_STORAGE: 'Скетч использует ${STORAGE_USE} байт (${STORAGE_USE_RATE}%) памяти устройства. Всего доступно ${STORAGE_MAX} байт.',
	UPLOAD_USAGE_MEMORY_DYNAMIC: 'Глобальные переменные используют ${DYNAMIC_USE} байт (${DYNAMIC_USE_RATE}%) динамической памяти, оставляя ${DYNAMIC_LOCAL} байт для локальных переменных. Максимум: ${DYNAMIC_MAX} байт.',
/*-------------------------------*/
	STATUS: 'Статус',
	STATUS_ACTIVE: 'Активный',
	STATUS_PAUSE: 'Пауза',
	STATUS_INSTALL: 'Установленно',
	STATUS_NOT_INSTALL: 'Не установленно',
/*-------------------------------*/
	SECURITY_DEFAULT: ['S0', 'Отключено'],
	SECURITY_PLACEHOLDER: 'Выберите режим безопастности',
	SECURITY:
	[
		['S0', 'Отключено'],
		['S1', 'Включено']
	],
/*-------------------------------*/
	FREQUENCY_DEFAULT: ['EU', 'Europe'],
	FREQUENCY_PLACEHOLDER: 'Выберите частоту',
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
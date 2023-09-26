/* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license. */
"use strict";

//Подключаем необходимые модули
const Os = require("os");

const _this = {
/*-------------------------------*/
	Z_UNO_DESCRIPTION: ' - первое поколение платы Z-Uno.',
	Z_UNO2_DESCRIPTION: ' - второе поколение платы Z-Uno2.',
	Z_UNO2_BETA_DESCRIPTION: ' - второе поколение платы Z-Uno2 бета.',

/*-------------------------------*/
	OUTPUT_START: '[Начало]',
	OUTPUT_END: '[Готово]',
	OUTPUT_INFO: '[Информация]',
	OUTPUT_ERROR: '[Ошибка]',
	OUTPUT_WARNING: '[Внимание]',
/*-------------------------------*/
	START_NOT_SUPPORT: `Не поддерживает платформу '${Os.platform()}' и архитектуру процессора '${Os.arch()}'`,
	START_KEY_QUESTION: 'Хотите настроить сочетания клавиш для Z-Uno?',
	START_KEY_FIND: 'Чтобы отсортировать введите: \'Z-Uno\'',
	START_UPDATE_NEW_VERSION: 'Вышла новая версия Z-Uno',
	START_UPDATE_NEW_HOW: 'Обновить сейчас',
	START_UPDATE_LATER: 'Напомнить позже',
	START_UPDATE_SKIP: 'Пропустить эту версию',
/*-------------------------------*/
	INSTALL_SUCCESS: 'Установка прошла успешно',
	INSTALL_TITLE: 'Z-Uno: Установка',
	INSTALL_REPORT_PACK: 'Получаем необходимый компонент',
	INSTALL_REPORT_MOVE: 'Перемещаем все компоненты',
	INSTALL_CONTINUE: 'Не установлены компоненты, необходимые для сборки, установить сейчас?',
	INSTALL_DELETE_NOT_INSTALL: 'Удалить текущую версию, не устанавливая новую?',
	INSTALL_PLACEHOLDER: 'Выберите версию для установки',
	INSTALL_INVALID_CORE: 'Есть проблемы с установленными компонентами. Переустановите их',
/*-------------------------------*/
	PORT_NOT_AVIABLE: 'Последовательный порт недоступен',
	PORT_PLACEHOLDER: 'Выберите последовательный порт',
	PORT_BAR_TEXT: '<Выбрать порт>',
/*-------------------------------*/
	MONITOR_TOOLTIP: 'Открыть последовательный порт',
	MONITOR_BAR_TEXT: '$(plug)',
/*-------------------------------*/
	BOARD_PLACEHOLDER: 'Выберите тип платы',
	BOARD_BAR_TEXT: '<Выберите плату>',
/*-------------------------------*/
	COMPLIER_OPTIONS_PLACEHOLDER: 'Введите опции компилирования через ";"',
/*-------------------------------*/
	BOOTLOADER_TOOLTIP: 'Записать загрузчик',
	BOOTLOADER_BAR_TEXT: '$(triangle-up)',
/*-------------------------------*/
	SETTINGS_TOOLTIP: 'Дополнительные настройки и функции',
	SETTING_BAR_TEXT: '$(settings-gear)',
/*-------------------------------*/
	CPP_TOOLS_ADD_CONFIG: 'Чтобы Z-Uno могла работать с IntelliSense была добавленная конфигурация "${name}", теперь нужно выбрать эту конфигурацию',
	CPP_TOOLS_INCOMPLETE_CONFIG: 'Настройки "${name}" для работы IntelliSense не полные. Что будем делать?',
/*-------------------------------*/
	SERIALMONITOR_LIMITS_OPEN: 'Превышен лимит на одновременное открытое количество мониторов.',
	SERIALMONITOR_NOT_OPEN: 'Не удалось открыть порт',
	SERIALMONITOR_FALIED_READ: 'Ошибка чтения порта: ${port}, монитор прекращает свою работу.',
	SERIALMONITOR_CHANNEL: 'Последовательный монитор',
	SERIALMONITOR_BAR_TEXT_MONITOR: 'Монитор',
	SERIALMONITOR_BAR_TOOLTIP_MONITOR: 'Дополнительные настройки и функции',
	SERIALMONITOR_CURRENTOPTIONS_NOT_UPLOAD: 'Нельзя настраивать монитор, пока порт используется для загрузки',
	SERIALMONITOR_CURRENTOPTIONS_TEXT_CLOSE: 'Закрыть монитор',
	SERIALMONITOR_CURRENTOPTIONS_TEXT_CLOSE_DECRIPTION: 'Полностью закрывает монитор',
	SERIALMONITOR_CURRENTOPTIONS_TEXT_PAUSE: 'Пауза',
	SERIALMONITOR_CURRENTOPTIONS_TEXT_PAUSE_DECRIPTION: 'Приостановить работу монитора',
	SERIALMONITOR_CURRENTOPTIONS_TEXT_RESUME: 'Возобновить',
	SERIALMONITOR_CURRENTOPTIONS_TEXT_RESUME_DECRIPTION: 'Возобновить работу монитора',
	SERIALMONITOR_OPTIONS_TEXT: 'Открыть монитор',
	SERIALMONITOR_OPTIONS_DECRIPTION: 'Прекращает изменение настроек',
	SERIALMONITOR_OPTIONS_PLACEHOLDER: 'Откройте монитор с текущими настройками или измените их',
	SERIALMONITOR_OPTIONS_PORT_DECRIPTION: 'Последовательный порт',
	SERIALMONITOR_OPTIONS_NOT_PORT: 'Чтобы открыть монитор нужно выбрать порт. Хотите выбрать?',
	SERIALMONITOR_OPTIONS_PAUSE_CHANGE: 'Не удалось приостановить работу монитора',
	SERIALMONITOR_OPTIONS_RESUME_CHANGE: 'Не удалось возобновить работу монитора',
	SERIALMONITOR_OPTIONS_BAUDRATE_CHANGE: 'Не удалось изменить скорость передачи данных',
	SERIALMONITOR_OPTIONS_BAUDRATE_DECRIPTION: 'Скорость передачи данных',
	SERIALMONITOR_OPTIONS_BAUDRATE_MANUAL: 'Выбрать вручную...',
	SERIALMONITOR_OPTIONS_BAUDRATE_MANUAL_PLACEHOLDER: 'Введите скорость передачи данных в ручную',
	SERIALMONITOR_OPTIONS_BAUDRATE_MANUAL_NUMBER: 'Вводить нужно только цифры',
/*-------------------------------*/
	SYSTEM_EXIT_CODE: 'Завершить работу с кодом',
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
	UPLOAD_SELECT_SKETH: 'Сначала нужно выбрать скетч',
	UPLOAD_SELECT_PORT: 'Нужно выбрать последовательный порт',
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
	SECURITY_DEFAULT: ['S0', 'Отключено', '0'],
	SECURITY_PLACEHOLDER: 'Выберите режим шифрования',
	SECURITY:
	[
		['S0', 'Отключено', '0'],
		['S1', 'S1', '1'],
		['S2', 'Включено', '2']
	],
	SECURITY2:
	[
		['S0', 'Отключено', '0'],
		['S2', 'Включено', '2']
	],
/*-------------------------------*/
	RF_LOGGING_DEFAULT: ['Off', 'Отключено', '0'],
	RF_LOGGING_PLACEHOLDER: 'Включает логирование по радио',
	RF_LOGGING:
	[
		['Off', 'Отключено', '0'],
		['On', 'Включено', '1']
	],
/*-------------------------------*/
	UTILITES_DEFAULT: 'Утилиты - ',
	UTILITES_PLACEHOLDER: 'Список дополнительных команд',
	UTILITES_ERASENVM_PLACEHOLDER: 'Полностью стирает данные NVM устройства',
	UTILITES_ERASENVM_TITLE: 'Z-Uno: Cтираем NVM...',
	UTILITES_ERASENVM_START: 'Cтираем NVM - ',
	UTILITES_ERASENVM_END: 'Завершено стирание NVM - ',
	UTILITES_PTI_PLACEHOLDER: 'PTI Tracer tool',
	UTILITES_PTI_OPTIONS_TEXT: 'Открыть PTI',
	UTILITES_PTI_OPTIONS_DECRIPTION: 'Прекращает изменение настроек',
	UTILITES_PTI_OPTIONS_PLACEHOLDER: 'Откройте PTI с текущими настройками или измените их',
	UTILITES_PTI_OPTIONS_BAUDRATE_DECRIPTION: 'Скорость передачи данных',
	UTILITES_PTI_OPTIONS_BAUDRATE_MANUAL: 'Выбрать вручную...',
	UTILITES_PTI_OPTIONS_BAUDRATE_MANUAL_PLACEHOLDER: 'Введите скорость передачи данных в ручную',
	UTILITES_PTI_OPTIONS_BAUDRATE_MANUAL_NUMBER: 'Вводить нужно только цифры',
	UTILITES_PTI_OPTIONS_BAUDRATE_MANUAL_NUMBER_LESS: 'Меньше 230400 не поддерживается',
	UTILITES_PTI_OPTIONS_INPUT_DECRIPTION: 'Использует файл JSON вместо реального PTI-устройства. Распечатывает пакеты',
	UTILITES_PTI_OPTIONS_OUTPUT_DECRIPTION: 'Сбрасывает все полученные пакеты в указанный файл ',
	UTILITES_PTI_OPTIONS_JSON_FILTR: {'Json файл': ['json']},
	UTILITES_PTI_OPTIONS_VALID_ONLY_DECRIPTION: 'Печатает только пакеты с правильным CRC',
	UTILITES_PTI_OPTIONS_NOT_PORT: 'Чтобы открыть PTI нужно выбрать порт. Хотите выбрать?',
	UTILITES_BOARDINFO_PLACEHOLDER: 'Извлекает метаданные из подключенной платы Z-Uno',
	UTILITES_BOARDINFO_OPTIONS_TEXT: 'Получить информацию',
	UTILITES_BOARDINFO_OPTIONS_DECRIPTION: 'Прекращает изменение настроек',
	UTILITES_BOARDINFO_OPTIONS_PLACEHOLDER: 'Получитt информацию с текущими настройками или измените их',
	UTILITES_BOARDINFO_TITLE: 'Z-Uno: Board Info...',
	UTILITES_BOARDINFO_START: 'Board Info - ',
	UTILITES_BOARDINFO_END: 'Завершено Board Info - ',
	UTILITES_BOARDINFO_NOT_PORT: 'Чтобы получить информацию нужно выбрать порт. Хотите выбрать?',
	UTILITES_LICENSE_PLACEHOLDER: 'Устанавливает лицензию',
	UTILITES_LICENSE_MANUAL_PLACEHOLDER: 'Введите 48 значный номер лицензии',
	UTILITES_LICENSE_MANUAL_LENGTH_PLACEHOLDER: 'Количество символов должно быть 48',
	UTILITES_LICENSE_MANUAL_SYMBOL_PLACEHOLDER: 'Использовать можно только такие символы: 0 - 9, A - F',
	UTILITES_LICENSE_TITLE: 'Z-Uno: License...',
	UTILITES_LICENSE_START: 'License - ',
	UTILITES_LICENSE_END: 'Завершено License - ',
	UTILITES_LICENSE_NOT_PORT: 'Чтобы установить лицензию нужно выбрать порт. Хотите выбрать?',
	/*-------------------------------*/
	MULTI_CHIP_PLACEHOLDER: 'Выберите чип с которым хотите работать',
	/*-------------------------------*/
	POWER_PLACEHOLDER: 'Выберите мощность радиосигнала от %min% до %max%',
	POWER_NOT_REGULAR: 'Введите число от %min% до %max%',
/*-------------------------------*/
	UART_BAUDRATE_PLACEHOLDER: 'Выберите нужную скорость из поддерживаемых: %baudrate%',
/*-------------------------------*/
	FREQUENCY_PLACEHOLDER: 'Выберите частоту'
}

module.exports = _this;
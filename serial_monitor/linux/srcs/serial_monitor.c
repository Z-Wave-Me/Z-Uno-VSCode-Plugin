/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.c                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: amatilda <amatilda@student.21-school.ru>   +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2019/06/21 21:58:20 by amatilda          #+#    #+#             */
/*   Updated: 2021/09/20 02:07:46 by amatilda         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include <stdbool.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <dirent.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <pthread.h>
#include <termios.h>

typedef enum								serial_monitor_error_e
{
	SERIAL_MONITOR_ERROR_OK,
	SERIAL_MONITOR_ERROR_USAGE,
	SERIAL_MONITOR_ERROR_CHDIR,
	SERIAL_MONITOR_ERROR_LSTAT,
	SERIAL_MONITOR_ERROR_READLINK,
	SERIAL_MONITOR_ERROR_REALPATCH,
	SERIAL_MONITOR_ERROR_WRITE,
	SERIAL_MONITOR_ERROR_PARAMETR,
	SERIAL_MONITOR_ERROR_OPEN_FILE,
	SERIAL_MONITOR_ERROR_COM_OPTION,
	SERIAL_MONITOR_ERROR_READ,
	SERIAL_MONITOR_ERROR_UNCNOWN_CMD,
	SERIAL_MONITOR_ERROR_THREAD,
	SERIAL_MONITOR_ERROR_PORT_READ,
	SERIAL_MONITOR_ERROR_CLOSE_HANDLE,
	SERIAL_MONITOR_ERROR_COM_NOT_AVIABLE_PORT
}											serial_monitor_error_t;

typedef struct								serial_monitor_buffer_s
{
	char									patch1[0x800];
	char									patch2[0x20];
	char									buffer[0x800];
}											serial_monitor_buffer_t;

typedef struct								serial_monitor_write_s
{
	size_t									count;
	uint8_t									buffer[0x2000];
}											serial_monitor_write_t;

#define SERIAL_MONITOR_STATUS_OPEN						0x0
#define SERIAL_MONITOR_STATUS_PAUSE						0x1

typedef struct								serial_monitor_open_s
{
	int										hPort;
	pthread_t								hThread;
	size_t									baudrate;
	size_t									ok_len;
	const char								*ok;
	char									*device;
	size_t									status;
	struct termios							options;
}											serial_monitor_open_t;

static void _write(serial_monitor_write_t *write_byffer, void *b, size_t count)
{
	size_t							i;
	size_t							offset;

	
	offset = write_byffer->count;
	while (true)
	{
		if (sizeof(write_byffer->buffer) == offset)
		{
			write(STDOUT_FILENO, &write_byffer->buffer[0x0], sizeof(write_byffer->buffer));
			offset = 0x0;
		}
		if ((i = sizeof(write_byffer->buffer) - offset) >= count)
			break ;
		memcpy(&write_byffer->buffer[offset], b, i);
		offset = offset + i;
		count = count - i;
		b = (uint8_t *)b + i;
	}
	memcpy(&write_byffer->buffer[offset], b, count);
	write_byffer->count = offset + count;
}

static uint8_t _alphabet(uint8_t value) {
	if (value > 9)
		return (value - 10 + 'A');
	return (value + 0x30);
}

static size_t _utoa_base(size_t value, void *str, size_t base) {
	uint8_t				*b;
	uint8_t				*e;
	size_t				count;
	size_t				tempos;
	
	e = (uint8_t *)str;
	if (base >= 2 && base <= 36) {
		while (0xFF) {
			e++[0] = _alphabet(value % base);
			value = value / base;
			if (value == 0)
				break ;
		}
	}
	b = (uint8_t *)str;
	count = e - b;
	e[0] = 0;
	e--;
	while (b < e) {
		tempos = e[0];
		e[0] = b[0];
		b[0] = tempos;
		b++;
		e--;
	}
	return (count);
}

static char *_ultoa(unsigned long value, char *str, int base) {
	if (_utoa_base(value, str, base) == 0)
		return (0);
	return (str);
}

static void _number(serial_monitor_write_t *write_byffer, serial_monitor_buffer_t *buff)
{
	char							buffer[0x10];
	size_t							number;
	ssize_t							count;
	int								fd;

	if ((fd = open(&buff->patch1[0x0], O_RDONLY)) != -1)
	{
		if ((count = read(fd, &buff->buffer[0x0], sizeof(buff->buffer))) == -1 || count == 0x0)
		{
			buff->buffer[0x0] = '0';
			count = 0x1;
		}
		close(fd);
	}
	else
	{
		buff->buffer[0x0] = '0';
		count = 0x1;
	}
	buff->buffer[count] = 0x0;
	number = strtol(&buff->buffer[0x0], 0x0, 0x10);
	_ultoa(number, &buffer[0x0], 0xA);
	_write(write_byffer, &buffer[0x0], strlen(&buffer[0x0]));
}

static int _usage(void)
{
	write(STDERR_FILENO, "Usage: list-ports\n", 18);
	return (SERIAL_MONITOR_ERROR_USAGE);
}

static int _list_ports(void)
{
	static serial_monitor_buffer_t	buff;
	static serial_monitor_write_t	write_byffer;
	DIR								*dirp;
	struct dirent					*dp;
	struct stat						st;
	ssize_t							count;
	char							*tmp;
	int								fd;
	size_t							i;

	if ((dirp = opendir("/sys/class/tty/")) == 0x0)
		return (SERIAL_MONITOR_ERROR_COM_NOT_AVIABLE_PORT);
	if (chdir("/sys/class/tty/") == -1)
		return (SERIAL_MONITOR_ERROR_CHDIR);
	_write(&write_byffer, "[", 0x1);
	i = 0x0;
	while ((dp = readdir(dirp)) != 0x0)
	{
		if (lstat(&dp->d_name[0x0], &st) == -1)
			return (SERIAL_MONITOR_ERROR_LSTAT);
		if ((st.st_mode & S_IFMT) != S_IFLNK)
			continue ;
		if ((count = readlink(&dp->d_name[0x0], &buff.patch1[0x0], (sizeof(buff.patch1) - 0x1))) == -1)
			return (SERIAL_MONITOR_ERROR_READLINK);
		if ((size_t)count < sizeof("../../devices/") || strncmp(&buff.patch1[0x0], "../../devices/", sizeof("../../devices/") - 0x1) != 0x0)
			continue ;
		tmp = &buff.patch1[count - 0x1];
		while (true)
		{
			while (tmp > &buff.patch1[0x0] && tmp[0x0] != '/')
				tmp--;
			tmp[0x1] = 0x0;
			if (strcmp(&buff.patch1[0x0], "../../devices/") == 0x0)
				break ;
			memcpy(&tmp[0x1], "manufacturer", sizeof("manufacturer"));
			if ((fd = open(&buff.patch1[0x0], O_RDONLY)) != -1)
			{
				if ((count = read(fd, &buff.buffer[0x0], sizeof(buff.buffer))) != -1 && count != 0x0)
				{
					close(fd);
					if (i++ != 0x0)
						_write(&write_byffer, ", ", 0x2);
					_write(&write_byffer, "{\"device\": \"/dev/", 0x11);
					_write(&write_byffer, &dp->d_name[0x0], strlen(&dp->d_name[0x0]));
					_write(&write_byffer, "\", \"manufacturer\": \"", 0x14);
					while (count != 0 && buff.buffer[count - 0x1] <= ' ')
						count--;
					_write(&write_byffer, &buff.buffer[0x0], count);
					_write(&write_byffer, "\", \"pid\": ", 0xA);
					memcpy(&tmp[0x1], "idProduct", sizeof("idProduct"));
					_number(&write_byffer, &buff);
					_write(&write_byffer, ", \"vid\": ", 0x9);
					memcpy(&tmp[0x1], "idVendor", sizeof("idVendor"));
					_number(&write_byffer, &buff);
					_write(&write_byffer, "}", 0x1);
				}
				else
					close(fd);
				break ;
			}
			tmp--;
		}
	}
	_write(&write_byffer, "]", 0x1);
	if ((count = write_byffer.count) != 0x0)
		if (write(STDOUT_FILENO, &write_byffer.buffer[0x0], count) == -1)
			return (SERIAL_MONITOR_ERROR_WRITE);
	return (SERIAL_MONITOR_ERROR_OK);
}

static void *_readPort(void *lpParam)
{
	serial_monitor_open_t			*array;
	static uint8_t					buffer[0x100];
	int								hPort;
	ssize_t							len;

	array = lpParam;
	hPort = array->hPort;
	while (true)
	{
		if ((len = read(hPort, &buffer[0x0], sizeof(buffer))) == -1)
			break ;
		if (array->status == SERIAL_MONITOR_STATUS_PAUSE)
			return (0x0);
		if (len != 0x0)
			if (write(STDOUT_FILENO, &buffer[0x0], len) == -1)
				break ;
	}
	if (array->status == SERIAL_MONITOR_STATUS_PAUSE)
		return (0x0);
	exit(SERIAL_MONITOR_ERROR_PORT_READ);
}

static int _resume(serial_monitor_open_t *array)
{
	int									hPort;

	if ((hPort = open(array->device, O_RDWR | O_NOCTTY)) == -1)
		return (SERIAL_MONITOR_ERROR_OPEN_FILE);
	if (tcgetattr(hPort, &array->options) == -1)
		return (SERIAL_MONITOR_ERROR_COM_OPTION);
	cfmakeraw(&array->options);
	if (cfsetispeed(&array->options, array->baudrate) == -1) /*установка скорости порта*/
		return (SERIAL_MONITOR_ERROR_COM_OPTION);
	if (cfsetospeed(&array->options, array->baudrate) == -1) /*установка скорости порта*/
		return (SERIAL_MONITOR_ERROR_COM_OPTION);
	array->options.c_cc[VMIN] = 0;
	array->options.c_cc[VTIME] = 1;// 1 * 0.1c
	if (tcsetattr(hPort, TCSANOW, &array->options) == -1)
		return (SERIAL_MONITOR_ERROR_COM_OPTION);
	if (tcflush(hPort, TCIOFLUSH) == -1)
		return (SERIAL_MONITOR_ERROR_COM_OPTION);
	array->hPort = hPort;
	array->status = SERIAL_MONITOR_STATUS_OPEN;
	if	(pthread_create(&array->hThread, 0x0, _readPort, array) != 0x0)
		return (SERIAL_MONITOR_ERROR_THREAD);
	return (SERIAL_MONITOR_ERROR_OK);
}

static size_t _readLine(uint8_t *b, size_t len)
{
	uint8_t						*e;
	uint8_t						*save;

	save = b;
	e = b + len;
	while (true)
	{
		if (read(STDIN_FILENO, b, 0x1) == -1)
			return (0x0);
		if (b[0x0] == '\n')
		{
			if (b > save && b[-1] == '\r')
				b[-1] = 0x0;
			b[0x0] = 0x0;
			return (0x1);
		}
		b++;
		if (b == e)
			return (0x0);
	}
	return (0x0);
}

static size_t _get_baud(size_t baud)
{
	switch (baud) {
		case 50:
			return (B50);
		case 75:
			return (B75);
		case 110:
			return (B110);
		case 134:
			return (B134);
		case 150:
			return (B150);
		case 200:
			return (B200);
		case 300:
			return (B300);
		case 600:
			return (B600);
		case 1200:
			return (B1200);
		case 1800:
			return (B1800);
		case 2400:
			return (B2400);
		case 4800:
			return (B4800);
		case 9600:
			return (B9600);
		case 19200:
			return (B19200);
		case 38400:
			return (B38400);
		case 57600:
			return (B57600);
		case 115200:
			return (B115200);
		case 230400:
			return (B230400);
		case 460800:
			return (B460800);
		case 500000:
			return (B500000);
		case 576000:
			return (B576000);
		case 921600:
			return (B921600);
		case 1000000:
			return (B1000000);
		case 1152000:
			return (B1152000);
		case 1500000:
			return (B1500000);
		case 2000000:
			return (B2000000);
		case 2500000:
			return (B2500000);
		case 3000000:
			return (B3000000);
		case 3500000:
			return (B3500000);
		case 4000000:
			return (B4000000);
		default: 
			return (0x0);
	}
}

static int _open_port(serial_monitor_open_t *array)
{
	static char						buffer_read_line[0x30];
	int								ret;
	size_t							len;
	size_t							baudrate;
	char							*tmp;

	if ((ret = _resume(array)) != SERIAL_MONITOR_ERROR_OK)
		return (ret);
	if (write(STDERR_FILENO, array->ok, array->ok_len) == -1)
		return (SERIAL_MONITOR_ERROR_WRITE);
	while (true)
	{
		if (_readLine((uint8_t *)&buffer_read_line[0x0], sizeof(buffer_read_line)) == 0x0)
			return (SERIAL_MONITOR_ERROR_READ);
		if (strcmp(&buffer_read_line[0x0], "close") == 0x0)
			break ;
		else if (strcmp(&buffer_read_line[0x0], "pause") == 0x0)
		{
			if (array->status == SERIAL_MONITOR_STATUS_OPEN)
			{
				array->status = SERIAL_MONITOR_STATUS_PAUSE;
				if (close(array->hPort) == -1)
					return (SERIAL_MONITOR_ERROR_CLOSE_HANDLE);
				if (pthread_detach(array->hThread) != 0x0)
					return (SERIAL_MONITOR_ERROR_CLOSE_HANDLE);
			}
		}
		else if (strcmp(&buffer_read_line[0x0], "resume") == 0x0)
		{
			if (array->status == SERIAL_MONITOR_STATUS_PAUSE)
				if ((ret = _resume(array)) != SERIAL_MONITOR_ERROR_OK)
					return (ret);
		}
		else
		{
			len = strlen(&buffer_read_line[0x0]);
			if (len > sizeof("baudrate") && strncmp(&buffer_read_line[0x0], "baudrate", (sizeof("baudrate") - 0x1)) == 0x0)
			{
				baudrate = _get_baud(strtoul(&buffer_read_line[(sizeof("baudrate") - 0x1)], &tmp, 0xA));
				if (tmp[0x0] != 0x0 || baudrate == 0x0)
					return (SERIAL_MONITOR_ERROR_PARAMETR);
				if (baudrate != array->baudrate)
				{
					array->baudrate = baudrate;
					if (cfsetispeed(&array->options, baudrate) == -1) /*установка скорости порта*/
						return (SERIAL_MONITOR_ERROR_COM_OPTION);
					if (cfsetospeed(&array->options, baudrate) == -1) /*установка скорости порта*/
						return (SERIAL_MONITOR_ERROR_COM_OPTION);
					if (tcsetattr(array->hPort, TCSANOW, &array->options) == -1)
						return (SERIAL_MONITOR_ERROR_COM_OPTION);
				}
			}
			else
				return (SERIAL_MONITOR_ERROR_UNCNOWN_CMD);
		}
		if (write(STDERR_FILENO, array->ok, array->ok_len) == -1)
			return (SERIAL_MONITOR_ERROR_WRITE);
	}
	if (write(STDERR_FILENO, array->ok, array->ok_len) == -1)
		return (SERIAL_MONITOR_ERROR_WRITE);
	return (SERIAL_MONITOR_ERROR_OK);
}

static int _open_port_parametr(char **argv)
{
	char					*str1;
	char					*str2;
	char					*tmp;
	size_t					count;
	serial_monitor_open_t	array;

	count = 0x0;
	while (true)
	{
		if ((str1 = argv++[0x0]) == 0x0)
			break ;
		if ((str2 = argv++[0x0]) == 0x0)
			return (SERIAL_MONITOR_ERROR_PARAMETR);
		if (strcmp(str1, "-d") == 0x0)
			array.device = str2;
		else if (strcmp(str1, "-b") == 0x0)
		{
			if ((array.baudrate = _get_baud(strtoul(str2, &tmp, 0xA))) == 0x0)
				return (SERIAL_MONITOR_ERROR_PARAMETR);
			if (tmp[0x0] != 0x0)
				return (SERIAL_MONITOR_ERROR_PARAMETR);
		}
		else if (strcmp(str1, "-o") == 0x0) {
			array.ok = str2;
			array.ok_len= strlen(str2);
		}
		else
			return (SERIAL_MONITOR_ERROR_PARAMETR);
		count++;
	}
	if (count != 0x3)
		return (SERIAL_MONITOR_ERROR_PARAMETR);
	return (_open_port(&array));
}

int	main(int argc, char **argv)
{
	char					*tmp;

	if (argc < 2)
		return (_usage());
	tmp = argv[0x1];
	if (argc == 0x2 && strcmp(tmp, "list-ports") == 0x0)
		return (_list_ports());
	if (argc >= 0x8 && strcmp(tmp, "open") == 0x0)
		return (_open_port_parametr(argv + 0x2));
	return (_usage());
}
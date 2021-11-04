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
#include <stdio.h>

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

static void _number(serial_monitor_write_t *write_byffer, size_t number)
{
	char							buffer[0x10];

	if (number == 0x0)
		_write(write_byffer, "null", 0x4);
	else
	{
		_ultoa(number, &buffer[0x0], 0xA);
		_write(write_byffer, &buffer[0x0], strlen(&buffer[0x0]));
	}
}

static int _usage(void)
{
	write(STDERR_FILENO, "Usage: list-ports\n", 18);
	return (SERIAL_MONITOR_ERROR_USAGE);
}

#include <IOKit/IOKitLib.h>
#include <IOKit/IOBSD.h>
#include <IOKit/usb/IOUSBLib.h>
#include <IOKit/IOCFPlugIn.h>
#include <IOKit/serial/IOSerialKeys.h>
#include <CoreFoundation/CFBase.h>
#include <CoreFoundation/CFNumber.h>

#include <sys/param.h>
#include <paths.h>
#include <string.h>

void print_cfstringref(const char* prefix, CFStringRef cfVal)
{
	char* cVal = malloc(CFStringGetLength(cfVal) * sizeof(char));
	if (!cVal) {
		return;
	}

	if (CFStringGetCString(cfVal, cVal, CFStringGetLength(cfVal) + 1, kCFStringEncodingASCII)) {
		printf("%s %s\n", prefix, cVal);
	}

	free(cVal);
}

void print_cfnumberref(const char* prefix, CFNumberRef cfVal)
{
	int result;
	if (CFNumberGetValue(cfVal, kCFNumberSInt32Type, &result)) {
		printf("%s %i\n", prefix, result);
	}
}

static bool _getRegisterNumber(io_service_t usbDevice, CFStringRef str, uint32_t *number) {
	CFNumberRef						numberString;
	bool							ret;

	if ((numberString = IORegistryEntryCreateCFProperty(usbDevice, str, kCFAllocatorDefault, 0x0)) == 0x0)
		return (false);
	ret = CFNumberGetValue(numberString, kCFNumberSInt32Type, number) ;
	CFRelease(numberString);
	return (ret);
}


static int _list_ports(void)
{
	static serial_monitor_write_t	write_byffer;
	static char						bsdPatchBuffer[0x400];
	static char						manufactureBuffer[0x400];
	size_t							i;
	ssize_t							count;
	io_iterator_t					deviceIterator;
	CFMutableDictionaryRef			matchingDict;
	io_service_t					usbDevice;
	uint32_t						idVendor;
	uint32_t						idProduct;
	CFStringRef						bsdPatch;
	CFStringRef						manufacture;
	io_service_t					device;
	io_iterator_t					iterator;
	uint32_t						tempos;

	if ((matchingDict = IOServiceMatching(kIOSerialBSDServiceValue)) == 0x0)//kIOUSBDeviceClassName    kIOSerialBSDServiceValue
		return (SERIAL_MONITOR_ERROR_COM_NOT_AVIABLE_PORT);
	if (IOServiceGetMatchingServices(kIOMasterPortDefault, matchingDict, &deviceIterator) != KERN_SUCCESS)
		return (SERIAL_MONITOR_ERROR_COM_NOT_AVIABLE_PORT);
	_write(&write_byffer, "[", 0x1);
	i = 0x0;
	while ((usbDevice = IOIteratorNext(deviceIterator)) != 0x0)
	{
		if (IORegistryEntryGetParentIterator(usbDevice, kIOServicePlane, &iterator) != KERN_SUCCESS)
		{
			IOObjectRelease(usbDevice);
			continue ;
		}
		if ((device = IOIteratorNext(iterator)) == 0x0)
		{
			IOObjectRelease(iterator);
			IOObjectRelease(usbDevice);
			continue ;
		}
		if (_getRegisterNumber(device, CFSTR(kUSBVendorID), &idVendor) == false)
			idVendor = 0x0;
		if (_getRegisterNumber(device, CFSTR(kUSBProductID), &idProduct) == false)
			idProduct = 0x0;
		if (idVendor != 0x0)
		{
			IOObjectRelease(device);
			while ((device = IOIteratorNext(iterator)) != 0x0)
			{
				if ((manufacture = (CFStringRef)IORegistryEntryCreateCFProperty(device, CFSTR(kUSBVendorString), kCFAllocatorDefault, 0x0)) == 0x0)
				{
					IOObjectRelease(device);
					continue ;
				}
				if (CFStringGetCString(manufacture, &manufactureBuffer[0x0], sizeof(manufactureBuffer), kCFStringEncodingUTF8) == false)
				{
					CFRelease(manufacture);
					IOObjectRelease(device);
					continue ;
				}
				CFRelease(manufacture);
				if (_getRegisterNumber(device, CFSTR(kUSBVendorID), &tempos) == false)
					tempos = 0x0;
				if (tempos == idVendor)
					break ;
			}
		}
		else
			memcpy(&manufactureBuffer[0x0], "null", 0x5);
		IOObjectRelease(iterator);
		if (device != 0x0)
			IOObjectRelease(device);
		else
			memcpy(&manufactureBuffer[0x0], "null", 0x5);
		if ((bsdPatch = (CFStringRef)IORegistryEntryCreateCFProperty(usbDevice,  CFSTR(kIOCalloutDeviceKey), kCFAllocatorDefault, 0x0)) == 0x0)
		{
			IOObjectRelease(usbDevice);
			continue ;
		}
		if (CFStringGetCString(bsdPatch, &bsdPatchBuffer[0x0], sizeof(bsdPatchBuffer), kCFStringEncodingUTF8) == false)
		{
			CFRelease(bsdPatch);
			IOObjectRelease(usbDevice);
			continue ;
		}
		CFRelease(bsdPatch);

		IOObjectRelease(usbDevice);
		if (i++ != 0x0)
			_write(&write_byffer, ", ", 0x2);
			_write(&write_byffer, "{\"device\": \"", 0xC);
			_write(&write_byffer, &bsdPatchBuffer[0x0], strlen(&bsdPatchBuffer[0x0]));
			_write(&write_byffer, "\", \"manufacturer\": \"", 0x14);
			_write(&write_byffer, &manufactureBuffer[0x0], strlen(&manufactureBuffer[0x0]));
			_write(&write_byffer, "\", \"pid\": ", 0xA);
			_number(&write_byffer, idProduct);
			_write(&write_byffer, ", \"vid\": ", 0x9);
			_number(&write_byffer, idVendor);
			_write(&write_byffer, "}", 0x1);
	}
	IOObjectRelease(deviceIterator);
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
			return (460800);
		case 500000:
			return (500000);
		case 576000:
			return (576000);
		case 921600:
			return (921600);
		case 1000000:
			return (1000000);
		case 1152000:
			return (1152000);
		case 1500000:
			return (1500000);
		case 2000000:
			return (2000000);
		case 2500000:
			return (2500000);
		case 3000000:
			return (3000000);
		case 3500000:
			return (3500000);
		case 4000000:
			return (4000000);
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
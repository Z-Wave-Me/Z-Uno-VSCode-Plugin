#include "serial_monitor.h"

#define SERIAL_MONITOR_ERROR_OK							0x0
#define SERIAL_MONITOR_ERROR_TERMINAL					0x1
#define SERIAL_MONITOR_ERROR_USAGE						0x2
#define SERIAL_MONITOR_ERROR_LIST_PORTS					0x3
#define SERIAL_MONITOR_ERROR_HEAP						0x4
#define SERIAL_MONITOR_ERROR_PARAMETR					0x5
#define SERIAL_MONITOR_ERROR_OPEN_FILE					0x6
#define SERIAL_MONITOR_ERROR_CODEPAGE					0x7
#define SERIAL_MONITOR_ERROR_COM_OPTION					0x8
#define SERIAL_MONITOR_ERROR_COM_NOT_AVIABLE_PORT		0x9
#define SERIAL_MONITOR_ERROR_WRITE						0xA
#define SERIAL_MONITOR_ERROR_PORT_WRITE					0xB
#define SERIAL_MONITOR_ERROR_READ						0xC
#define SERIAL_MONITOR_ERROR_PORT_READ					0xD
#define SERIAL_MONITOR_ERROR_THREAD						0xE
#define SERIAL_MONITOR_ERROR_UNCNOWN_CMD				0xF
#define SERIAL_MONITOR_ERROR_CLOSE_HANDLE				0x10
#define SERIAL_MONITOR_ERROR_EVENT						0x11


#define SERIAL_MONITOR_STATUS_OPEN						0x0
#define SERIAL_MONITOR_STATUS_PAUSE						0x1

typedef struct								serial_monitor_open_s
{
	HANDLE									hStdOutput;
	HANDLE									hStdError;
	HANDLE									hStdInput;
	HANDLE									hPort;
	HANDLE									hThread;
	size_t									baudrate;
	size_t									ok_len;
	const char								*ok;
	WCHAR									*device;
	size_t									status;
	DCB										dcb;
	OVERLAPPED								overl_port;
}											serial_monitor_open_t;

typedef struct								serial_monitor_write_s
{
	HANDLE									hStdOutput;
	size_t									count;
	uint8_t									buffer[0x2000];
}											serial_monitor_write_t;

static void _write(serial_monitor_write_t *write_byffer, void *b, size_t count)
{
	size_t							i;
	size_t							offset;
	DWORD							nNumberOfBytesToWrite;

	
	offset = write_byffer->count;
	while (true)
	{
		if (sizeof(write_byffer->buffer) == offset)
		{
			WriteFile(write_byffer->hStdOutput, &write_byffer->buffer[0x0], sizeof(write_byffer->buffer), &nNumberOfBytesToWrite, 0x0);
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

static void _number(serial_monitor_write_t *write_byffer, WCHAR *str, WCHAR *substr)
{
	char										buffer[0x10];
	size_t										number;

	if ((str = wcsstr(str, substr)) == 0x0)
	{
		_write(write_byffer, "null", 0x4);
		return ;
	}
	number = wcstoul(str + 0x4, 0x0, 0x10);
	_ultoa_s(number, &buffer[0x0], sizeof(buffer), 0xA);
	_write(write_byffer, &buffer[0x0], strlen(&buffer[0x0]));
}

static int _list_ports(HANDLE hStdOutput)
{
	static serial_monitor_write_t				write_byffer;
	static uint64_t								tmp_buffer[0x200];
	static const GUID							guid_ports = { 0x86E0D1E0, 0x8089 , 0x11D0, {0x9C, 0xE4, 0x08, 0x00, 0x3E, 0x30, 0x1F, 0x73} };//"86E0D1E0-8089-11D0-9CE4-08003E301F73";
	SP_DEVICE_INTERFACE_DATA					deviceInterfaceData;
	SP_DEVINFO_DATA								DeviceInfoData;
	SP_DEVICE_INTERFACE_DETAIL_DATA_W			*DeviceInterfaceDetailData;
	DWORD										requiredSize;
	DWORD										typeKey;
	HKEY										hKeyDev;
	HDEVINFO									hDevInfo;
	size_t										i;
	WCHAR										*src;
	uint8_t										*dst;
	DWORD										nNumberOfBytesToWrite;


	write_byffer.hStdOutput = hStdOutput;
	write_byffer.count = 0x0;
	if ((hDevInfo = SetupDiGetClassDevsExW(&guid_ports, 0x0, 0x0,DIGCF_PRESENT | DIGCF_DEVICEINTERFACE, 0x0, 0x0, 0x0)) == INVALID_HANDLE_VALUE)
		return (SERIAL_MONITOR_ERROR_LIST_PORTS);
	_write(&write_byffer, "[", 0x1);
	i = 0x0;
	while (true)
	{
		deviceInterfaceData.cbSize = sizeof(SP_DEVICE_INTERFACE_DATA);
		if (SetupDiEnumDeviceInterfaces(hDevInfo, 0, &guid_ports, i, &deviceInterfaceData) == false)
			break ;
		DeviceInterfaceDetailData = (SP_DEVICE_INTERFACE_DETAIL_DATA_W *)&tmp_buffer[0x0];
		DeviceInterfaceDetailData->cbSize = sizeof(SP_DEVICE_INTERFACE_DETAIL_DATA_W);
		DeviceInfoData.cbSize = sizeof(SP_DEVINFO_DATA);
		if (SetupDiGetDeviceInterfaceDetailW(hDevInfo, &deviceInterfaceData, DeviceInterfaceDetailData, sizeof(tmp_buffer), 0x0, &DeviceInfoData) == false)
			return (SERIAL_MONITOR_ERROR_LIST_PORTS);
		if (i != 0x0)
			_write(&write_byffer, ", ", 0x2);
		_write(&write_byffer, "{ \"vid\": ", 0x9);
		_number(&write_byffer, &DeviceInterfaceDetailData->DevicePath[0x0], L"vid_");
		_write(&write_byffer, ", \"pid\": ", 0x9);
		_number(&write_byffer, &DeviceInterfaceDetailData->DevicePath[0x0], L"pid_");
		if ((hKeyDev = SetupDiOpenDevRegKey(hDevInfo, &DeviceInfoData, DICS_FLAG_GLOBAL, 0x0, DIREG_DEV, KEY_READ)) == INVALID_HANDLE_VALUE)
			return (SERIAL_MONITOR_ERROR_LIST_PORTS);
		requiredSize = sizeof(tmp_buffer);
		if (RegQueryValueExW(hKeyDev, L"PortName", 0x0, &typeKey, (void *)&tmp_buffer[0x0], &requiredSize) != ERROR_SUCCESS || typeKey != REG_SZ || requiredSize >= (sizeof(tmp_buffer)) || requiredSize == 0x0)
		{
			RegCloseKey(hKeyDev);
			return (SERIAL_MONITOR_ERROR_LIST_PORTS);
		}
		RegCloseKey(hKeyDev);
		_write(&write_byffer, ", \"device\": \"", 0xD);
		requiredSize = requiredSize >> 0x1;
		src = (WCHAR *)&tmp_buffer[0x0];
		if (src[requiredSize - 0x1] == 0x0)
			requiredSize--;
		dst = (uint8_t *)(src + requiredSize);
		if ((requiredSize = WideCharToMultiByte(CP_UTF8, 0x0, src, requiredSize, (LPSTR)(dst), ((uint8_t *)&tmp_buffer[(sizeof(tmp_buffer) / sizeof(tmp_buffer[0x0]))] - dst), 0x0, 0x0)) == 0x0)
			return (SERIAL_MONITOR_ERROR_CODEPAGE);
		_write(&write_byffer, dst, requiredSize);
		_write(&write_byffer, "\"", 0x1);
		if (SetupDiGetDeviceRegistryPropertyW(hDevInfo, &DeviceInfoData, SPDRP_MFG, 0x0, (void *)&tmp_buffer[0x0], sizeof(tmp_buffer), 0x0) == false)
			return (SERIAL_MONITOR_ERROR_LIST_PORTS);
		_write(&write_byffer, ", \"manufacturer\": \"", 0x13);
		requiredSize = wcslen(src);
		dst = (uint8_t *)(src + requiredSize);
		if ((requiredSize = WideCharToMultiByte(CP_UTF8, 0x0, src, requiredSize, (LPSTR)(dst), ((uint8_t *)&tmp_buffer[(sizeof(tmp_buffer) / sizeof(tmp_buffer[0x0]))] - dst), 0x0, 0x0)) == 0x0)
			return (SERIAL_MONITOR_ERROR_CODEPAGE);
		_write(&write_byffer, dst, requiredSize);
		_write(&write_byffer, "\"}", 0x2);
		i++;
	}
	SetupDiDestroyDeviceInfoList(hDevInfo);
	_write(&write_byffer, "]", 0x1);
	if ((nNumberOfBytesToWrite = write_byffer.count) != 0x0)
		if (WriteFile(hStdOutput, &write_byffer.buffer[0x0], nNumberOfBytesToWrite, &nNumberOfBytesToWrite, 0x0) == 0x0)
			return (SERIAL_MONITOR_ERROR_WRITE);
	return (SERIAL_MONITOR_ERROR_OK);
}

static size_t _readLine(HANDLE h, uint8_t *b, size_t len)
{
	DWORD						nNumberOfBytesToRead;
	uint8_t						*e;
	uint8_t						*save;

	save = b;
	e = b + len;
	while (true)
	{
		if (ReadFile(h, b, 0x1, &nNumberOfBytesToRead, 0x0) == 0x0)
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

static DWORD WINAPI _readPort(LPVOID lpParam)
{
	static uint8_t					buffer[0x100];
	serial_monitor_open_t			*array;
	HANDLE							hPort;
	HANDLE							hEvent;
	DWORD							mask;
	DWORD							nNumberOfBytesToRead;

	array = lpParam;
	hPort = array->hPort;
	hEvent = array->overl_port.hEvent;
	while (true)
	{
		memset(&array->overl_port, 0x0, sizeof(array->overl_port));
		array->overl_port.hEvent = hEvent;
		if (WaitCommEvent(hPort, &mask, &array->overl_port) == 0x0 && GetLastError() != ERROR_IO_PENDING)
			break ;
		if (WaitForSingleObject(hEvent, INFINITE) == WAIT_FAILED)
			break ;
		memset(&array->overl_port, 0x0, sizeof(array->overl_port));
		array->overl_port.hEvent = hEvent;
		if (ReadFile(hPort, &buffer[0x0], sizeof(buffer), 0x0, &array->overl_port) == 0x0 && (mask = GetLastError()) != ERROR_IO_PENDING)
			break ;
		if (WaitForSingleObject(hEvent, INFINITE) == WAIT_FAILED)
			break ;
		if(GetOverlappedResult(hPort, &array->overl_port, &nNumberOfBytesToRead, false) == 0x0)
			break ;
		if (nNumberOfBytesToRead != 0x0)
			if (WriteFile(array->hStdOutput, &buffer[0x0], nNumberOfBytesToRead, &nNumberOfBytesToRead, 0x0) == 0x0)
				break ;
	}
	if (array->status == SERIAL_MONITOR_STATUS_PAUSE)
		return (0x0);
	ExitProcess(SERIAL_MONITOR_ERROR_PORT_READ);
}

static int _resume(serial_monitor_open_t *array)
{
	static COMMTIMEOUTS				comm_timeouts = {.ReadIntervalTimeout = MAXDWORD, .ReadTotalTimeoutConstant = 0x80, .ReadTotalTimeoutMultiplier = 0x0, .WriteTotalTimeoutConstant = 0x0, .WriteTotalTimeoutMultiplier = 0x0};
	HANDLE							hPort;

	if ((hPort = CreateFileW(array->device, GENERIC_READ | GENERIC_WRITE, 0x0, 0x0, OPEN_EXISTING, FILE_FLAG_OVERLAPPED, 0x0)) == INVALID_HANDLE_VALUE)
		return (SERIAL_MONITOR_ERROR_OPEN_FILE);
	SetupComm(hPort, 0x800, 0x40);
	PurgeComm(hPort, PURGE_RXCLEAR | PURGE_TXCLEAR);
	if (GetCommState(hPort, &array->dcb) == 0x0)
		return (SERIAL_MONITOR_ERROR_COM_OPTION);
	array->dcb.BaudRate = array->baudrate;
	array->dcb.ByteSize = 8;
	array->dcb.StopBits = ONESTOPBIT;
	array->dcb.Parity = NOPARITY;
	if (SetCommState(hPort, &array->dcb) == 0x0)
		return (SERIAL_MONITOR_ERROR_COM_OPTION);
	if (SetCommTimeouts(hPort, &comm_timeouts) == 0x0)
		return (SERIAL_MONITOR_ERROR_COM_OPTION);
	if (SetCommMask(hPort, EV_RXCHAR) == 0x0)
		return (SERIAL_MONITOR_ERROR_COM_OPTION);
	array->hPort = hPort;
	array->status = SERIAL_MONITOR_STATUS_OPEN;
	if ((array->overl_port.hEvent = CreateEvent(NULL,TRUE,FALSE,NULL)) == 0x0)
		return (SERIAL_MONITOR_ERROR_EVENT);
	if ((array->hThread = CreateThread(0x0, 0x0, _readPort, array, 0x0, 0x0)) == 0x0)
		return (SERIAL_MONITOR_ERROR_THREAD);
	return (SERIAL_MONITOR_ERROR_OK);
}

static int _open_port(serial_monitor_open_t *array)
{
	static char						buffer_read_line[0x30];
	DWORD							nNumberOfBytesToWrite;
	int								ret;
	size_t							len;
	size_t							baudrate;
	char							*tmp;

	if ((ret = _resume(array)) != SERIAL_MONITOR_ERROR_OK)
		return (ret);
	if (WriteFile(array->hStdError, array->ok, array->ok_len, &nNumberOfBytesToWrite, 0x0) == 0x0)
		return (SERIAL_MONITOR_ERROR_WRITE);
	while (true)
	{
		if (_readLine(array->hStdInput, (uint8_t *)&buffer_read_line[0x0], sizeof(buffer_read_line)) == 0x0)
			return (SERIAL_MONITOR_ERROR_READ);
		if (strcmp(&buffer_read_line[0x0], "close") == 0x0)
			break ;
		else if (strcmp(&buffer_read_line[0x0], "pause") == 0x0)
		{
			if (array->status == SERIAL_MONITOR_STATUS_OPEN)
			{
				array->status = SERIAL_MONITOR_STATUS_PAUSE;
				if (CloseHandle(array->overl_port.hEvent) == 0x0)
					return (SERIAL_MONITOR_ERROR_CLOSE_HANDLE);
				if (CloseHandle(array->hThread) == 0x0)
					return (SERIAL_MONITOR_ERROR_CLOSE_HANDLE);
				if (CloseHandle(array->hPort) == 0x0)
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
				baudrate = strtoul(&buffer_read_line[(sizeof("baudrate") - 0x1)], &tmp, 0xA);
				if (tmp[0x0] != 0x0)
					return (SERIAL_MONITOR_ERROR_PARAMETR);
				if (baudrate != array->dcb.BaudRate)
				{
					array->dcb.BaudRate = baudrate;
					if (SetCommState(array->hPort, &array->dcb) == 0x0)
						return (SERIAL_MONITOR_ERROR_COM_OPTION);
				}
			}
			else
				return (SERIAL_MONITOR_ERROR_UNCNOWN_CMD);
		}
		if (WriteFile(array->hStdError, array->ok, array->ok_len, &nNumberOfBytesToWrite, 0x0) == 0x0)
			return (SERIAL_MONITOR_ERROR_WRITE);
	}
	if (WriteFile(array->hStdError, array->ok, array->ok_len, &nNumberOfBytesToWrite, 0x0) == 0x0)
		return (SERIAL_MONITOR_ERROR_WRITE);
	return (SERIAL_MONITOR_ERROR_OK);
}

static int _open_port_parametr(char **argv, HANDLE hStdOutput, HANDLE hStdError, HANDLE hStdInput)
{
	static WCHAR			device_w[0x100] = L"\\??\\";
	char					*str1;
	char					*str2;
	char					*device;
	char					*tmp;
	size_t					count;
	serial_monitor_open_t	array;

	count = 0x0;
	device = 0x0;
	while (true)
	{
		if ((str1 = argv++[0x0]) == 0x0)
			break ;
		if ((str2 = argv++[0x0]) == 0x0)
			return (SERIAL_MONITOR_ERROR_PARAMETR);
		if (strcmp(str1, "-d") == 0x0)
			device = str2;
		else if (strcmp(str1, "-b") == 0x0)
		{
			array.baudrate = strtoul(str2, &tmp, 0xA);
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
	array.hStdOutput = hStdOutput;
	array.hStdError = hStdError;
	array.hStdInput = hStdInput;
	array.device = &device_w[0x0];
	if (MultiByteToWideChar(CP_UTF8, 0x0, device, -1, &device_w[(sizeof("\\??\\") - 0x1)], (sizeof(device_w) - sizeof(L"\\??\\"))) == 0x0)
		return (SERIAL_MONITOR_ERROR_CODEPAGE);
	return (_open_port(&array));
}

static int _usage(HANDLE hStdError)
{
	WriteConsoleW(hStdError, L"Usage: list-ports\n", 17, 0, 0);
	return (SERIAL_MONITOR_ERROR_USAGE);
}

int	main(int argc, char **argv)
{
	HANDLE					hStdError;
	HANDLE					hStdOutput;
	HANDLE					hStdInput;
	char					*tmp;

	if ((hStdError = GetStdHandle(STD_ERROR_HANDLE)) == INVALID_HANDLE_VALUE)
		return (SERIAL_MONITOR_ERROR_TERMINAL);
	if ((hStdOutput = GetStdHandle(STD_OUTPUT_HANDLE)) == INVALID_HANDLE_VALUE)
		return (SERIAL_MONITOR_ERROR_TERMINAL);
	if ((hStdInput = GetStdHandle(STD_INPUT_HANDLE)) == INVALID_HANDLE_VALUE)
		return (SERIAL_MONITOR_ERROR_TERMINAL);
	if (argc < 2)
		return (_usage(hStdError));
	tmp = argv[0x1];
	if (argc == 0x2 && strcmp(tmp, "list-ports") == 0x0)
		return (_list_ports(hStdOutput));
	if (argc >= 0x8 && strcmp(tmp, "open") == 0x0)
		return (_open_port_parametr(argv + 0x2, hStdOutput, hStdError, hStdInput));
	return (_usage(hStdError));
}
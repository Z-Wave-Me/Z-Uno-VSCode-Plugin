import argparse
import platform
import json
import sys
import threading
import os
import signal

import serial
from serial.tools.list_ports import comports

MY_VERSION = "00.01.01"

ERROR_OKEY = 0x0
ERROR_OPEN = 0x1
ERROR_READ = 0x2
ERROR_PAUSE = 0x3
ERROR_BAUDRATE = 0x4
ERROR_UNCNOWN_CMD = 0xA

class SerialMonitor:
	def __init__(self, portname, baudrate = 115200):
		self.ser = serial.Serial()
		self.ser.port = portname
		self.ser.baudrate = baudrate
		pass

	def Open(self):
		try:
			if self.ser.is_open == False:
				self.ser.open()
				self.thread = threading.Thread(target=self.tredRead, args=[os.getpid()], daemon=True)
				self.thread_while = True
				self.thread_time = 0.1
				self.thread.start()
				pass
		except Exception as e:
			sys.exit(ERROR_OPEN)
		pass

	def resume(self):
		self.Open()
		pass

	def pause(self):
		try:
			if self.ser.is_open == True:
				self.thread_while = False
				while self.thread_while == False:
					pass
				self.ser.close()
		except Exception as e:
			sys.exit(ERROR_PAUSE)
		pass

	def baudrate(self, baudrate):
		try:
			self.ser.baudrate = baudrate
		except Exception as e:
			sys.exit(ERROR_BAUDRATE)
		
		pass

	def Read(self, size, timeout = 0.1):
		try:
			self.ser.timeout = timeout
			data = self.ser.read(size)
		except Exception as e:
			sys.exit(ERROR_READ)
		return data

	def tredRead(self, pid):
		while self.thread_while:
			try:
				self.ser.timeout = self.thread_time
				data = self.ser.read(0x100)
			except Exception as e:
				os.kill(pid, signal.SIGTERM)
				sys.exit(ERROR_READ)
			data_len = len(data)
			if data_len != 0x0:
				sys.stdout.write(data.decode(encoding="utf-8", errors="ignore"))
				sys.stdout.flush()
			pass
		self.thread_while = True
		pass

	@staticmethod
	def get_port_list() -> list:
		"""Return list of available serial ports and devices."""
		port_list = []
		for item in sorted(comports()):
			port_list.append({'device': item.device, 'description': item.description, 'hwid': item.hwid, 'manufacturer': item.manufacturer, 'vid': item.vid, 'pid': item.pid})
			pass
		return port_list

if __name__ == "__main__":
	def dummyFunc(args):
		print("*** Platform: %s Version: %s ***"%(platform.system(), MY_VERSION))
		pass

	def list_ports_Func(args):
		sys.stdout.write(json.dumps(SerialMonitor.get_port_list()))
		sys.stdout.flush()
		pass

	def open_Func(args):
		usart = SerialMonitor(args.device, int(args.baudrate))
		usart.Open()
		sys.stderr.write(args.ok)
		sys.stderr.flush()
		while True:
			data = sys.stdin.readline().strip()
			cmd = data.split()
			cmd_len = len(cmd)
			if cmd_len == 0x1 and cmd[0x0] == "close":
				sys.stderr.write(args.ok)
				sys.stderr.flush()
				sys.exit(ERROR_OKEY)
			elif cmd_len == 0x2 and cmd[0x0] == "baudrate":
				usart.baudrate(int(cmd[0x1]))
				pass
			elif cmd_len == 0x1 and cmd[0x0] == "pause":
				usart.pause()
				pass
			elif cmd_len == 0x1 and cmd[0x0] == "resume":
				usart.resume()
				pass
			else:
				sys.exit(ERROR_UNCNOWN_CMD)
			pass
			sys.stderr.write(args.ok)
			sys.stderr.flush()
		pass

	def Main():
		parser = argparse.ArgumentParser(description='Serial Port for Z-Uno for Visual Studio Code:)')
		parser.set_defaults(func=dummyFunc)
		subparsers = parser.add_subparsers()

		parser_func = subparsers.add_parser('list-ports', help="")
		parser_func.set_defaults(func=list_ports_Func)

		parser_func = subparsers.add_parser('open', help="")
		parser_func.add_argument('-d', '--device', help="Device file (UNIX) or COM-port (WINDOWS)", required=True)
		parser_func.add_argument('-b', '--baudrate', help="Baud rate such as 9600 or 115200 etc.", required=True)
		parser_func.add_argument('-o', '--ok', help="The code confirming that the command was executed correctly.", required=True)
		parser_func.set_defaults(func=open_Func)

		args = parser.parse_args()
		args.func(args)

	Main()
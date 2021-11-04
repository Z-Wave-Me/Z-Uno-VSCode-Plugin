#include <IOKit/usb/IOUSBLib.h>
#include <CoreFoundation/CFBase.h>
#include <CoreFoundation/CFNumber.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>

static IONotificationPortRef notificationPort;

void usb_device_added(void* refcon, io_iterator_t iterator);
void usb_device_removed(void* refcon, io_iterator_t iterator);

void init_notifier()
{
	notificationPort = IONotificationPortCreate(kIOMasterPortDefault);
	CFRunLoopAddSource(CFRunLoopGetCurrent(), IONotificationPortGetRunLoopSource(notificationPort), kCFRunLoopDefaultMode);
	printf("init_notifier ---> Ok\n");
}

void configure_and_start_notifier()
{
	printf("Starting notifier...\n\n");

	CFMutableDictionaryRef matchDict = (CFMutableDictionaryRef) CFRetain(IOServiceMatching(kIOUSBDeviceClassName));

	if (!matchDict) {
		fprintf(stderr, "Failed to create matching dictionary for kIOUSBDeviceClassName\n");
		return;
	}

	kern_return_t addResult;

	io_iterator_t deviceAddedIter;
	addResult = IOServiceAddMatchingNotification(notificationPort, kIOMatchedNotification, matchDict, usb_device_added, NULL, &deviceAddedIter);

	if (addResult != KERN_SUCCESS) {
		fprintf(stderr, "IOServiceAddMatchingNotification failed for kIOMatchedNotification\n");
		return;
	}

	usb_device_added(NULL, deviceAddedIter);

	io_iterator_t deviceRemovedIter;
	addResult = IOServiceAddMatchingNotification(notificationPort, kIOTerminatedNotification, matchDict, usb_device_removed, NULL, &deviceRemovedIter);

	if (addResult != KERN_SUCCESS) {
		fprintf(stderr, "IOServiceAddMatchingNotification failed for kIOTerminatedNotification\n");
		return;
	}

	usb_device_removed(NULL, deviceRemovedIter);

	CFRunLoopRun();
}

void deinit_notifier()
{
	CFRunLoopRemoveSource(CFRunLoopGetCurrent(), IONotificationPortGetRunLoopSource(notificationPort), kCFRunLoopDefaultMode);
	IONotificationPortDestroy(notificationPort);
	printf("deinit_notifier ---> Ok\n");
}

void signal_handler(int signum)
{
	printf("\ngot signal, signnum=%i  stopping current RunLoop\n", signum);
	CFRunLoopStop(CFRunLoopGetCurrent());
}

void init_signal_handler()
{
	signal(SIGINT,  signal_handler);
	signal(SIGQUIT, signal_handler);
	signal(SIGTERM, signal_handler);
}

int main()
{
	init_signal_handler();
	init_notifier();

	configure_and_start_notifier();	

	deinit_notifier();

	return 0;
}

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

void get_usb_device_info(io_service_t device, int newdev)
{
	io_name_t devicename;
	io_name_t entrypath;
	io_name_t classname;

	if (IORegistryEntryGetName(device, devicename) != KERN_SUCCESS) {
		fprintf(stderr, "%s unknown device (unable to get device name)\n", newdev ? "Added " : " Removed");
		return;
	}

	printf("USB device %s: %s\n", newdev ? "FOUND" : "REMOVED", devicename);

	if (IORegistryEntryGetPath(device, kIOServicePlane, entrypath) == KERN_SUCCESS) {
		printf("\tDevice entry path: %s\n", entrypath);
	}

	if (IOObjectGetClass(device, classname) == KERN_SUCCESS) {
		printf("\tDevice class name: %s\n", classname);
	}

	CFStringRef vendorname = (CFStringRef) IORegistryEntrySearchCFProperty(device
							, kIOServicePlane
							, CFSTR("USB Vendor Name")
							, NULL
							, kIORegistryIterateRecursively | kIORegistryIterateParents);

	if (vendorname) {
		print_cfstringref("\tDevice vendor name:", vendorname);
	}

	CFNumberRef vendorId = (CFNumberRef) IORegistryEntrySearchCFProperty(device
							, kIOServicePlane
							, CFSTR("idVendor")
							, NULL
							, kIORegistryIterateRecursively | kIORegistryIterateParents);

	if (vendorId) {
		print_cfnumberref("\tVendor id:", vendorId);
	}

	CFNumberRef productId = (CFNumberRef) IORegistryEntrySearchCFProperty(device
							, kIOServicePlane
							, CFSTR("idProduct")
							, NULL
							, kIORegistryIterateRecursively | kIORegistryIterateParents);

	if (productId) {
		print_cfnumberref("\tProduct id:", productId);
	}

	printf("\n");
}

void iterate_usb_devices(io_iterator_t iterator, int newdev)
{
	io_service_t usbDevice;

	while ((usbDevice = IOIteratorNext(iterator))) {
		get_usb_device_info(usbDevice, newdev);
		IOObjectRelease(usbDevice);
	}
}

void usb_device_added(void* refcon, io_iterator_t iterator)
{
	iterate_usb_devices(iterator, 1);
}

void usb_device_removed(void* refcon, io_iterator_t iterator)
{
	iterate_usb_devices(iterator, 0);
}
#pragma once
#define COMPILER_PRAGMA(text) __pragma(text)
#define STORE_COMPILER_WARNINGS COMPILER_PRAGMA(warning(push))
#define RESTORE_COMPILER_WARNINGS COMPILER_PRAGMA(warning(pop))
#define DISABLE_SPECIFIC_COMPILER_WARNING(warningCode) COMPILER_PRAGMA(warning (diable: warningCode))

#define DISABLE_COMPILER_WARNINGS COMPILER_PRAGMA(warning(push, 0)) // Set /W0

DISABLE_COMPILER_WARNINGS
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

#include <windows.h>
#include <SetupAPI.h>
RESTORE_COMPILER_WARNINGS

#pragma comment (lib, "Setupapi.lib")
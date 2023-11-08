# Change Log
All notable changes to this project will be documented in this file.

## Version 0.2.17
- *Release date:* Wed Nov 8 16:29:51 2023 +0300
- *Commit:* ae90888a157c1ca888e83f0c9367a1c24f10c994
### Fix
1. Fix create "c_cpp_properties.json"

## Version 0.2.16
- *Release date:* Wed Sep 27 01:53:59 2023 +0300
- *Commit:* 47c657ae0ec201da2670b3556112dcff983d212b
### Fix
1. Mode "terminal"

### Add
1. '-i' - for compatibility Arduino
2. Now the frequency is taken from board.txt

## Version 0.2.15
- *Release date:* Tue Sep 19 18:22:56 2023 +0300
- *Commit:* 5e19071d6cf972c8a9d383521053ff85b9159a78
### Add
1. Small, temporary and quick addition - US_LR


## Version 0.2.14
- *Release date:* Wed Sep 13 19:35:59 2023 +0300
- *Commit:* 69316be109fa38bd8d8f820945659dc0e4948ed0
### Change
1. Now the power is not dB, but in raw - integers.
### Fix
1. Now the default power is not zero - which led to the fact that there was no radio signal.
### Add
1. Added the ability to change the sketch loading speed


## Version 0.2.13
- *Release date:* 24.05.2023
- *Commit:* e949d8b9fe667b6c1b1060542cc2434de865d6ec
### Change
1. Now temporary files created during the build are stored not in the folder created each time, but in 'z-waveme.vscode-zuno'. Also, for each chip, a folder is created in which the sketches are collected.
2. Now, when changing the board, it does not display a message with a suggestion to restart the project, but does it automatically.
3. Now the configuration for each chip is added to c_cpp_properties.json.

### Add
1. Added support for multiple chips.
2. Now when changing the board, installing a new version of the files and changing the chip - reloads the window.


## Version 0.2.12
- *Release date:* 22.04.2023
- *Commit:* 82497c36dbaf415409275c720e296c4d5dfec990

### Added
- Added: Now we get the path to the compiler libraries from platform.txt



## Version 0.2.11
- *Release date:* 10.01.2023
- *Commit:* d620a2d16f1d90df21a08c7e3721afe4c07c703d
### Change

#### Fix
1. Fixed a problem that occurred when selecting a sketch using "select sketch"



## Version 0.2.10
- Release date: 05.12.2022

### Added
- Added: Compiler Options for Z-Uno-2G



## Version 0.2.9
- Release date: 12.03.2022

### Added
- Added: boardInfo, license and PTI command for Zuno Z-Uno2
- Added: Now the size is taken from them boards.txt



## Version 0.2.8
- Release date: 11.01.2022

### Added
- Added: logging option and eraseNVM command



## Version 0.2.7
- Release date: 15.11.2021

### Added
- Fix: update bootloader



## Version 0.2.6
- Release date: 04.11.2021

### Added
- Added support multiple boards.



## Version 0.2.4
- Release date: 03.10.2021

### Changed
- Now use the Serial monitor based on C for Linux.
- Distribution download path has changed.

### Added
- Added the ability to adjust the power of the tx Z-Uno-2G radio.



## Version 0.2.1
- Release date: 28.09.2021

### Changed
- Now the plugin configures intellisense in a slightly different way - it adds its own "Zyno" setting - by analogy with "Win32"...



## Version 0.2.0
- Release date: 22.09.2021

### Changed
- Now use their Serial monitor based on python/C.

### Added
- Added display of folders with examples. 



## Version 0.1.13
- Add: Examples
- Release date: 06.09.2021



## Version 0.1.12
- Change README.md
- Release date: August 27, 2021



## Version 0.1.11
- Fix: Rebuilding node-usb-native - as a temporary solution - https://github.com/microsoft/vscode-arduino/issues/1312 - node v14.4.0
- Release date: August 24, 2021



## Version 0.1.9
- Fix serial monitor text output
- Release date: May 26, 2021



## Version 0.1.8
- Update node-usb-native to v0.0.20 to fix serial and port selecting
- Release date: May 26, 2021



## Version 0.1.7
- Update node-usb-native
- Release date: March 24, 2021



## Version 0.1.6
- Release date: January 30, 2021



## Version 0.1.4
- Release date: January 29, 2021



## Version 0.1.2
- Release date: January 27, 2021



## Version 0.1.0

- Release date: January 23, 2021
- Release status: Public Preview

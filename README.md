# Visual Studio Code extension for Z-Uno

## Commands
This extension provides several commands in the Command Palette (<kbd>F1</kbd> or <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>) for working with `*.ino` files:

- **Z-Uno: Burn bootloader**: Update the bootloader to get new features and fixes.
- **Z-Uno: Install the necessary components**: Components for compilation and debugging.
- **Z-Uno: Open serial monitor**: Serial monitor displays debugging information.
- **Z-Uno: Select serial port**: Change the current serial port to flash the firmware.
- **Z-Uno: Select mode security**: Security mode can be S0, S2, without security.
- **Z-Uno: Select frequency**: Select the radio frequency according to your region (EU, US, RU, etc.)
- **Z-Uno: Upload**: Build sketch and upload to Z-Uno board.
- **Z-Uno: Verify**: Build sketch.

## Keybindings
- **Z-Uno: Burn bootloader** <kbd>Alt</kbd> + <kbd>Cmd</kbd> + <kbd>L</kbd> *or* <kbd>Alt</kbd> + <kbd>Ctrl</kbd> + <kbd>L</kbd>
- **Z-Uno: Upload** <kbd>Alt</kbd> + <kbd>Cmd</kbd> + <kbd>U</kbd> *or* <kbd>Alt</kbd> + <kbd>Ctrl</kbd> + <kbd>U</kbd>
- **Z-Uno: Verify** <kbd>Alt</kbd> + <kbd>Cmd</kbd> + <kbd>R</kbd> *or* <kbd>Alt</kbd> + <kbd>Ctrl</kbd> + <kbd>R</kbd>

## Options
| Option | Description |
| --- | --- |
| `zuno.path`  | The path where the Z-Uno components will be installed. Example: `C:\\<user>\\Documents\\Z-Uno` for Windows, `/Users/<user>/Documents` for Mac,`/home/$user/Documents/Z-Uno` for Linux. (Requires a reboot of VsCode after the change, as well as access to the specified folder without administrative rights) |
| `zuno.outputTerminal` |If enabled: information is displayed instead of the output in the terminal. |
| `zuno.autoUpdate` | Auto update. |
| `zuno.autoUpdateTime` |How to regularly check for new versions. For example: `86400` seconds is one day. |
| `zuno.baudRate` | Default baud rate for the serial port monitor. The default value is 115200. Supported values are 115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300, 200, 150, 134, 110, 75 and 50. | 
| `zuno.keyBindings` | If enabled, at startup it suggests reassigning keys. |

The following Visual Studio Code settings are available for the Z-Uno extension. These can be set in global user preferences <kbd>Ctrl</kbd> + <kbd>,</kbd> or workspace settings (`.vscode/settings.json`). The latter overrides the former.

```json
{
    "zuno.path": "D:/Z-Uno",
    "zuno.outputTerminal": "Disabled",
    "zuno.autoUpdate": "Enabled",
    "zuno.baudRate": "115200", 
    "zuno.keyBindings": "Disabled"
}
```
*Note:* You only need to set `zuno.path` in Visual Studio Code settings, other options are not required.

The following settings are as per sketch settings of the Z-Uno extension. You can find them in
`.vscode/zuno.json` under the workspace.

```json
{
    "sketch": "example.ino",
    "port": "COM5",
    "frequency": "EU",
    "security": "Disabled",
    "cppIgnored": "Disabled"
}
```
- `sketch` - The main sketch file for Z-Uno to be used.
- `port` - Serial port through which the sketch and bootloader will be loaded".
- `frequency` - Radio frequency on which the sketch will work, by default: `EU` - `Europe`.
- `security` - Security mode in which the sketch will work, by default: disabled.
- `cppIgnored` - If enabled, then errors in the settings for IntelliSense.

## Change Log
See the [Change log](https://github.com/Z-Wave-Me/Z-Uno-VSCode-Plugin/blob/main/CHANGELOG.md) for details about the changes in each version.

## Supported Operating Systems
Currently this extension supports the following operating systems:

- Windows 7 and later (32-bit and 64-bit)
- macOS 10.10 and later
- Ubuntu 16.04 (64-bit)

## Support
You can find the full list of issues on the [Issue Tracker](https://github.com/Z-Wave-Me/Z-Uno-VSCode-Plugin/issues). You can submit a [bug or feature suggestion](https://github.com/Z-Wave-Me/Z-Uno-VSCode-Plugin/issues/new), and participate in community driven [forum](https://forum.z-wave.me/index.php).

## License
This extension is licensed under the [MIT License](https://github.com/Z-Wave-Me/Z-Uno-VSCode-Plugin/blob/main/LICENSE.txt). Please see the [Third Party Notice](https://github.com/Z-Wave-Me/Z-Uno-VSCode-Plugin/blob/main/ThirdPartyNotices.txt) file for additional copyright notices and terms.

## Contact Us
If you would like to help build the best Z-Uno experience with VS Code, you can reach us directly at [forum](https://forum.z-wave.me/index.php).
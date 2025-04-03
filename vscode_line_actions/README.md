# Line Cut for Google Docs

A Chrome extension that adds VS Code-like line cutting functionality to Google Docs. When no text is selected, pressing Ctrl+X will cut the entire current line and copy it to your clipboard.

## Features

- Press Ctrl+X with no text selection to cut the entire line where your cursor is located
- Works seamlessly with Google Docs
- Mimics the behavior of VS Code's line cut feature

## Installation Instructions

### From Chrome Web Store (Coming Soon)
1. Visit the Chrome Web Store (link will be provided when published)
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation (Developer Mode)
1. Download or clone this repository to your computer
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top right corner
4. Click "Load unpacked" and select the folder containing this extension
5. The extension is now installed and active

## Usage

1. Open a Google Docs document
2. Place your cursor on any line
3. Press Ctrl+X (without selecting any text)
4. The entire line will be cut and copied to your clipboard

## Notes

- If you have text selected, the extension will not interfere with normal cut operations
- The extension only activates on Google Docs URLs
- Requires the "clipboardWrite" permission to copy text to your clipboard

## License

MIT

## Contributing

Feel free to submit issues or pull requests if you have suggestions for improvements or encounter any bugs. 
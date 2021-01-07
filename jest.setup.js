// Backup of the native console object for later re-use
global._console = global.console;

// Force mute console by returning a mock object that mocks the props we use
global.muteConsole = () => {
  return {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
  };
};

// Force mute console by returning a mock object that mocks the props we use, except for "log"
global.muteConsoleButLog = () => {
  return {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    log: _console.log,
    warn: jest.fn(),
  };
};

// Restore previously made "console" object
global.unmuteConsole = () => _console;

// Mock __non_webpack_require__ to use the standard node.js "require"
global['__non_webpack_require__'] = require;

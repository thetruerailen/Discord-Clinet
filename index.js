const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let settingsWindow;

app.on('ready', () => {
  // Create the main application window
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      partition: 'persist:main', // Use the main session
    },
  });

  mainWindow.loadURL('https://discord.com/app');

  mainWindow.on('closed', () => {
    // Save session state when the main window is closed
    mainWindow.webContents.session.cookies.get({}, (error, cookies) => {
      if (!error) {
        const userDataPath = app.getPath('userData');
        const cookiesPath = path.join(userDataPath, 'cookies.json');

        const cookiesToSave = {};

        cookies.forEach((cookie) => {
          if (!cookiesToSave[cookie.domain]) {
            cookiesToSave[cookie.domain] = [];
          }
          cookiesToSave[cookie.domain].push(cookie);
        });

        fs.writeFileSync(cookiesPath, JSON.stringify(cookiesToSave), 'utf-8');
      }
    });

    mainWindow = null;
  });

  // Define the menu with "Control + S" accelerator
  const template = [
    {
      label: 'Settings',
      submenu: [
        {
          label: 'Open Settings',
          accelerator: 'CmdOrCtrl+S', // Use 'Cmd' for macOS, 'Ctrl' for other platforms
          click: () => {
            if (!settingsWindow) {
              createSettingsWindow();
            }
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  settingsWindow.loadFile('settings.html');

  // Handle window close
  settingsWindow.on('closed', () => {
    // Perform any necessary cleanup
    settingsWindow = null;
  });
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

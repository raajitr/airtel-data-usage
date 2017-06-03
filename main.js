const electron = require('electron');
// Module to control application life.
const {app, Tray, Menu, ipcMain} = electron;
// Module to create native browser window.
const {BrowserWindow} = electron;
const path = require('path')
// const fetchData = require('./nightmarejsAirtel');
const isOnline = require('is-online');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let tray=undefined;
let win;
var val=undefined;


app.on('ready', function(){
  createWindow();
  createTray();
  console.log(tray.getBounds());
});

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 400,
    height: 400,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    skipTaskbar: true,
    webPreferences: {
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false
    }
  });
  if (process.platform === 'darwin') {
    app.dock.hide()
  }

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/app/index.html`);
  
  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
  console.log(win.getBounds());

  win.on('blur', () => {
    if (!win.webContents.isDevToolsOpened()) {
      win.hide();
    }
  })

  win.openDevTools({mode: 'detach'})

  // When UI has finish loading
  ipcMain.on('did-finish-load', () => {
      // Send the timer value
      ipcMain.send('timer-change', timerTime);
  });
}

function createTray(){
tray = new Tray(path.join(path.join(__dirname, 'assets'), 'iconTemplate.png'));
tray.on('click', function(){
  console.log('clicked');
  toggleWindow();
  // showWindow();
});
}

function toggleWindow(){
  if (win.isVisible()){
    win.hide();
  }else{
    isOnline().then(online => {
      console.log(online);
      win.webContents.send('connection-status', online);
    });
    showWindow();
  }
}

function getPosition(){
  let windowBounds = win.getBounds();
  let trayBounds = tray.getBounds();
  let space = 4;
  if(process.platform === 'win32') {space = 0};

  let x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
  let y = Math.round(trayBounds.y + trayBounds.height + space);

  return {x: x, y: y}
}

function showWindow(){
  let position = getPosition();
  win.setPosition(position.x, position.y, false);
  win.show();
  win.focus();
}

ipcMain.on('get-data', (event, uname, pw) => {
  console.log(uname);
  console.log(pw);
  var exec = require('child_process').spawn;
  extractorProcess = exec('node', ['nightmarejsAirtel.js', uname, pw]);
  // extractorProcess.on()
  extractorProcess.stdout.setEncoding('utf8');
  extractorProcess.stdout.on('data', function (data) {
    console.log(data);
    event.sender.send('update-data', JSON.parse(data));
  });
});

ipcMain.on('quit', (event) => {
  app.quit();
});

app.on('activate', () => {

  if (win === null) {
    createWindow();
  }
});

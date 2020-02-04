import path from 'path';
import fs from 'fs';
import { remote } from 'electron';
import parser from './parser';
import url from 'url';

const { BrowserWindow, app } = remote;

let view = null;

view = new BrowserWindow({
  show: false,
  width: 1024,
  height: 728,
  webPreferences: {
    nodeIntegration: true
  }
});
view.webContents.on('did-finish-load', () => {
  if (!view) {
    throw new Error('"view" is not defined');
  }
  if (process.env.START_MINIMIZED) {
    view.minimize();
  }
});

view.on('closed', () => {
  view = null;
});
export default async function createViewFrame(mode, page) {
  if (mode === 'json') {
    const parsed = parser(JSON.parse(page).content);
    const html = `<html><head><title>Sharabiz Page View</title><meta http-equiv="Content-Security-Policy" content="script-src 'self';"></head><body>${parsed.toString()}</body></html>`;
    console.log(encodeURI( path.join(app.getPath('appData'), 'sheditor', 'view.html')))
    if (!fs.existsSync(path.join(app.getPath('appData'), 'sheditor'))) {
      fs.mkdirSync(path.join(app.getPath('appData'), 'sheditor'));
    }
    console.log(path.join(app.getPath('appData'), 'sheditor', 'view.html'))
    fs.writeFile(
      url.format({
        pathname:path.join(app.getPath('appData'), 'sheditor', 'view.html'),
        protocol:'file:'
        })
     ,
      html,
      () => {
        if (!view) {
          view = new BrowserWindow({
            show: false,
            width: 1024,
            height: 728,
            webPreferences: {
              nodeIntegration: true
            }
          });
        }
        view.loadURL(
          url.format({
            pathname:path.join(app.getPath('appData'), 'sheditor', 'view.html'),
            protocol:'file:'
            })
        );
        view.show();
        view.focus();
      }
    );
  }
}

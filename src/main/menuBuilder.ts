import { app, Menu, MenuItemConstructorOptions, BrowserWindow, shell } from 'electron';
import { AccountManager } from './accountManager';
import { Store } from './store';
import { APP_NAME, PRIVACY_POLICY_URL, SUPPORT_URL } from '../shared/constants';

export class MenuBuilder {
  constructor(
    private win: BrowserWindow,
    private accountManager: AccountManager,
    private store: Store,
    private onActivateWindow: () => void = () => {}
  ) {}

  buildMenu(): void {
    const template = this.buildTemplate();
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private buildTemplate(): MenuItemConstructorOptions[] {
    const accounts = this.accountManager.listAccounts();
    const settings = this.accountManager.getSettings();

    const accountItems: MenuItemConstructorOptions[] = accounts.map((acc, idx) => ({
      label: `${acc.label}${acc.unreadCount ? ` (${acc.unreadCount})` : ''}`,
      type: 'radio' as const,
      checked: acc.id === settings.activeAccountId,
      accelerator: idx < 9 ? `CmdOrCtrl+${idx + 1}` : undefined,
      click: () => {
        this.win.webContents.send('menu:switch-account', acc.id);
      },
    }));

    return [
      // ── App Menu ─────────────────────────────────────────────────────────
      {
        label: APP_NAME,
        submenu: [
          { label: `About ${APP_NAME}`, role: 'about' },
          { type: 'separator' },
          {
            label: 'Preferences…',
            accelerator: 'Cmd+,',
            click: () => this.win.webContents.send('menu:open-preferences'),
          },
          {
            label: 'Upgrade to Premium…',
            click: () => this.win.webContents.send('menu:open-upgrade'),
            enabled: !settings.isPremium,
          },
          { type: 'separator' },
          {
            label: 'Launch at Login',
            type: 'checkbox',
            checked: settings.autoLaunch,
            click: (item) => {
              this.win.webContents.send('menu:set-auto-launch', item.checked);
            },
          },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit', label: `Quit ${APP_NAME}` },
        ],
      },
      // ── Accounts ─────────────────────────────────────────────────────────
      {
        label: 'Accounts',
        submenu: [
          ...accountItems,
          { type: 'separator' },
          {
            label: 'Add Account…',
            accelerator: 'CmdOrCtrl+N',
            click: () => this.win.webContents.send('menu:add-account'),
          },
          {
            label: 'Manage Accounts…',
            click: () => this.win.webContents.send('menu:open-preferences'),
          },
        ],
      },
      // ── Edit ─────────────────────────────────────────────────────────────
      // Required on macOS: without this, Cmd+C/V/X/A don't work in renderer
      // textareas (inputs, contenteditable). The role:'editMenu' adds the full
      // standard Edit menu (Undo, Redo, Cut, Copy, Paste, Select All).
      { role: 'editMenu' },
      // ── View ─────────────────────────────────────────────────────────────
      {
        label: 'View',
        submenu: [
          {
            label: 'Toggle Sidebar',
            accelerator: 'CmdOrCtrl+\\',
            click: () => this.win.webContents.send('menu:toggle-sidebar'),
          },
          {
            label: 'Focus Mode',
            type: 'checkbox',
            checked: settings.focusMode,
            accelerator: 'CmdOrCtrl+Shift+F',
            click: (item) => this.win.webContents.send('menu:set-focus-mode', item.checked),
          },
          { type: 'separator' },
          { role: 'reload' },
          { role: 'forceReload' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
      // ── Window ───────────────────────────────────────────────────────────
      {
        label: 'Window',
        submenu: [
          // Always available so the user can reopen the main window after closing
          // it — required by Apple Guideline 4 (no orphaned, unreachable app).
          {
            label: `Show ${APP_NAME} Window`,
            accelerator: 'CmdOrCtrl+0',
            click: () => this.onActivateWindow(),
          },
          { type: 'separator' },
          { role: 'minimize' },
          { role: 'zoom' },
          { type: 'separator' },
          { role: 'front' },
        ],
      },
      // ── Help ─────────────────────────────────────────────────────────────
      {
        label: 'Help',
        submenu: [
          {
            label: `${APP_NAME} Support`,
            click: () => shell.openExternal(SUPPORT_URL),
          },
          {
            label: 'Privacy Policy',
            click: () => shell.openExternal(PRIVACY_POLICY_URL),
          },
          {
            label: 'Disclaimer',
            click: () => {
              this.win.webContents.send('menu:show-disclaimer');
            },
          },
        ],
      },
    ];
  }
}

import fs from 'fs-extra';
import loadPkg from 'load-pkg';
import { pick } from 'lodash-es';

export default async ({ browser }) => {
  const packageConfig = await loadPkg();
  const config = await fs.readJson('config.json').catch(() => ({}));
  const iconExists = await fs.exists('public/icon.png');
  const popupExists = await fs.exists('popup.html');
  return {
    name: config.name,
    ...pick(packageConfig, ['version', 'description']),
    manifest_version: 3,
    ...(iconExists && {
      icons: {
        128: 'icon.png',
      },
    }),
    ...(('action' in config || popupExists) && {
      action: {
        ...(iconExists && { default_icon: { 128: 'icon.png' } }),
        ...(popupExists && { default_popup: 'popup.html' }),
        ...(typeof config.action === 'object' && config.action),
      },
    }),
    ...(((await fs.exists('content.js')) || config.css?.length > 0) && {
      content_scripts: [
        {
          js: ['content.js'],
          ...(config.css?.length > 0 && { css: config.css }),
          matches: config.matches || ['<all_urls>'],
        },
      ],
    }),
    ...((await fs.exists('background.js')) && {
      background: {
        ...(browser === 'firefox'
          ? { scripts: ['background.js'] }
          : { service_worker: 'background.js' }),
      },
    }),
    ...(process.env.FIREFOX_EXTENSION_ID &&
      browser === 'firefox' && {
        browser_specific_settings: {
          gecko: {
            id: process.env.FIREFOX_EXTENSION_ID,
          },
        },
      }),
    ...pick(
      config,
      Object.keys({
        css: true,
        host_permissions: true,
        optional_host_permissions: true,
        optional_permissions: true,
        permissions: true,
        web_accessible_resources: true,
      }),
    ),
  };
};

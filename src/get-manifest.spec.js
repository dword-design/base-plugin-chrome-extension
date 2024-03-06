import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import outputFiles from 'output-files'

import self from './get-manifest.js'

export default tester(
  {
    'browser action': {
      files: {
        'config.json': JSON.stringify({
          action: {
            foo: 'bar',
          },
        }),
      },
      result: {
        action: {
          foo: 'bar',
        },
        manifest_version: 3,
      },
    },
    'browser action and icon': {
      files: {
        'public/icon.png': '',
        'config.json': JSON.stringify({
          action: {
            foo: 'bar',
          },
        }),
      },
      result: {
        action: {
          default_icon: 'icon.png',
          foo: 'bar',
        },
        icons: {
          128: 'icon.png',
        },
        manifest_version: 3,
      },
    },
    'browser action true': {
      files: {
        'config.json': JSON.stringify({
          action: true,
        }),
      },
      result: {
        action: {},
        manifest_version: 3,
      },
    },
    'browser specific settings': {
      files: {
        'config.json': JSON.stringify({
          browser_specific_settings: {
            gecko: {
              id: '{071e944b-8d1c-4b48-8bba-4c2519deee01}',
            },
          },
        }),
      },
      result: {
        browser_specific_settings: {
          gecko: {
            id: '{071e944b-8d1c-4b48-8bba-4c2519deee01}',
          },
        },
        manifest_version: 3,
      },
    },
    'content script': {
      files: {
        'content.js': '',
      },
      result: {
        content_scripts: [
          {
            js: ['content.js'],
            matches: ['<all_urls>'],
          },
        ],
        manifest_version: 3,
      },
    },
    empty: {
      result: {
        manifest_version: 3,
      },
    },
    icon: {
      files: {
        'public/icon.png': '',
      },
      result: {
        icons: {
          128: 'icon.png',
        },
        manifest_version: 3,
      },
    },
    matches: {
      files: {
        'config.json': JSON.stringify({
          matches: ['foo'],
        }),
        'content.js': '',
      },
      result: {
        content_scripts: [
          {
            js: ['content.js'],
            matches: ['foo'],
          },
        ],
        manifest_version: 3,
      },
    },
    name: {
      files: {
        'config.json': JSON.stringify({
          name: 'Foo',
        }),
      },
      result: {
        manifest_version: 3,
        name: 'Foo',
      },
    },
    package: {
      files: {
        'package.json': JSON.stringify({
          description: 'foo',
          version: '1.0.0',
        }),
      },
      result: {
        description: 'foo',
        manifest_version: 3,
        version: '1.0.0',
      },
    },
    permissions: {
      files: {
        'config.json': JSON.stringify({
          permissions: ['storage'],
        }),
      },
      result: {
        manifest_version: 3,
        permissions: ['storage'],
      },
    },
    'popup.html': {
      files: {
        'popup.html': '',
      },
      result: {
        action: {
          default_popup: 'popup.html',
        },
        manifest_version: 3,
      },
    },
    'service worker': {
      files: {
        'background.js': '',
      },
      result: {
        background: {
          service_worker: 'background.js',
        },
        manifest_version: 3,
      },
    },
    'service worker firefox': {
      browser: 'firefox',
      files: {
        'background.js': '',
      },
      result: {
        background: {
          persistent: false,
          scripts: ['background.js'],
        },
        manifest_version: 3,
      },
    },
  },
  [
    testerPluginTmpDir(),
    {
      transform:
        ({ files = {}, result, browser = 'chrome' } = {}) =>
        async () => {
          await outputFiles(files)
          expect(await self({ browser })).toEqual(result)
        },
    },
  ],
)

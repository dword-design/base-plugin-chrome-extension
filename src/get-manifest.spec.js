import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import outputFiles from 'output-files'

import self from './get-manifest.js'

export default tester(
  {
    'background script': {
      files: {
        'background.js': '',
      },
      result: {
        background: {
          persistent: false,
          scripts: ['background.js'],
        },
        manifest_version: 2,
      },
    },
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
        manifest_version: 2,
      },
    },
    'browser action and icon': {
      files: {
        'assets/icon.png': '',
        'config.json': JSON.stringify({
          action: {
            foo: 'bar',
          },
        }),
      },
      result: {
        action: {
          default_icon: 'assets/icon.png',
          foo: 'bar',
        },
        icons: {
          128: 'assets/icon.png',
        },
        manifest_version: 2,
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
        manifest_version: 2,
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
        manifest_version: 2,
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
        manifest_version: 2,
      },
    },
    empty: {
      result: {
        manifest_version: 2,
      },
    },
    icon: {
      files: {
        'assets/icon.png': '',
      },
      result: {
        icons: {
          128: 'assets/icon.png',
        },
        manifest_version: 2,
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
        manifest_version: 2,
      },
    },
    name: {
      files: {
        'config.json': JSON.stringify({
          name: 'Foo',
        }),
      },
      result: {
        manifest_version: 2,
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
        manifest_version: 2,
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
        manifest_version: 2,
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
        manifest_version: 2,
      },
    },
  },
  [
    testerPluginTmpDir(),
    {
      transform:
        ({ files = {}, result } = {}) =>
        async () => {
          await outputFiles(files)
          expect(await self()).toEqual(result)
        },
    },
  ],
)

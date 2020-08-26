import { mapValues } from '@dword-design/functions'
import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'

import subject from './config-to-manifest'

const runTest = options => () =>
  withLocalTmpDir(async () => {
    const files = options.files || {}
    const config = options.config || {}
    await outputFiles(files)
    expect(config |> JSON.stringify |> subject |> await |> JSON.parse).toEqual(
      options.result
    )
  })

export default {
  'background script': {
    files: {
      'background.js': '',
    },
    result: {
      background: {
        persistent: false,
        scripts: ['browser-polyfill.js', 'background.js'],
      },
      manifest_version: 2,
    },
  },
  'browser action': {
    config: {
      browser_action: {
        foo: 'bar',
      },
    },
    result: {
      browser_action: {
        foo: 'bar',
      },
      manifest_version: 2,
    },
  },
  'browser action and icon': {
    config: {
      browser_action: {
        foo: 'bar',
      },
    },
    files: {
      'assets/icon.png': '',
    },
    result: {
      browser_action: {
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
    config: {
      browser_action: true,
    },
    result: {
      browser_action: {},
      manifest_version: 2,
    },
  },
  'browser specific settings': {
    config: {
      browser_specific_settings: {
        gecko: {
          id: '{071e944b-8d1c-4b48-8bba-4c2519deee01}',
        },
      },
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
          js: ['browser-polyfill.js', 'content.js'],
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
    config: {
      matches: ['foo'],
    },
    files: {
      'content.js': '',
    },
    result: {
      content_scripts: [
        {
          js: ['browser-polyfill.js', 'content.js'],
          matches: ['foo'],
        },
      ],
      manifest_version: 2,
    },
  },
  name: {
    config: {
      name: 'Foo',
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
    config: {
      permissions: ['storage'],
    },
    result: {
      manifest_version: 2,
      permissions: ['storage'],
    },
  },
} |> mapValues(runTest)

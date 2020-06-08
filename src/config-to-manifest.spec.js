import withLocalTmpDir from 'with-local-tmp-dir'
import outputFiles from 'output-files'
import { mapValues } from '@dword-design/functions'
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
  empty: {
    result: {
      manifest_version: 2,
    },
  },
  name: {
    config: {
      name: 'Foo',
    },
    result: {
      name: 'Foo',
      manifest_version: 2,
    },
  },
  package: {
    files: {
      'package.json': JSON.stringify({
        version: '1.0.0',
        description: 'foo',
      }),
    },
    result: {
      manifest_version: 2,
      version: '1.0.0',
      description: 'foo',
    },
  },
  icon: {
    files: {
      'assets/icon.png': '',
    },
    result: {
      manifest_version: 2,
      icons: {
        '128': 'assets/icon.png',
      },
    },
  },
  'browser action': {
    config: {
      browser_action: {
        foo: 'bar',
      },
    },
    result: {
      manifest_version: 2,
      browser_action: {
        foo: 'bar',
      },
    },
  },
  'browser action true': {
    config: {
      browser_action: true,
    },
    result: {
      manifest_version: 2,
      browser_action: {},
    },
  },
  'browser action and icon': {
    files: {
      'assets/icon.png': '',
    },
    config: {
      browser_action: {
        foo: 'bar',
      },
    },
    result: {
      manifest_version: 2,
      browser_action: {
        default_icon: 'assets/icon.png',
        foo: 'bar',
      },
      icons: {
        '128': 'assets/icon.png',
      },
    },
  },
  'content script': {
    files: {
      'content.js': '',
    },
    result: {
      manifest_version: 2,
      content_scripts: [
        {
          js: ['browser-polyfill.js', 'content.js'],
          matches: ['<all_urls>'],
        },
      ],
    },
  },
  matches: {
    files: {
      'content.js': '',
    },
    config: {
      matches: ['foo'],
    },
    result: {
      manifest_version: 2,
      content_scripts: [
        {
          js: ['browser-polyfill.js', 'content.js'],
          matches: ['foo'],
        },
      ],
    },
  },
  'background script': {
    files: {
      'background.js': '',
    },
    result: {
      manifest_version: 2,
      background: {
        scripts: ['browser-polyfill.js', 'background.js'],
        persistent: false,
      },
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
  'browser specific settings': {
    config: {
      browser_specific_settings: {
        gecko: {
          id: '{071e944b-8d1c-4b48-8bba-4c2519deee01}',
        },
      },
    },
    result: {
      manifest_version: 2,
      browser_specific_settings: {
        gecko: {
          id: '{071e944b-8d1c-4b48-8bba-4c2519deee01}',
        },
      },
    },
  },
} |> mapValues(runTest)

import { endent, noop } from '@dword-design/functions'
import puppeteer from '@dword-design/puppeteer'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import execa from 'execa'
import express from 'express'
import globby from 'globby'
import outputFiles from 'output-files'
import P from 'path'

export default tester(
  {
    valid: {
      files: {
        'assets/foo.png': '',
        'background.js': '',
        'config.json': JSON.stringify({ name: 'Foo' }, undefined, 2),
        'content.js': endent`
        import './model/foo'

        document.querySelector('body').style.background = 'red'

      `,
        'model/foo.js': 'export default 1',
        'node_modules/base-config-self/index.js':
          "module.exports = require('../../../src')",
        'options.html': '',
        'options.js': '',
        'package.json': JSON.stringify(
          {
            baseConfig: 'self',
            description: 'foo bar',
            version: '2.0.0',
          },
          undefined,
          2
        ),
        'popup.html': '',
        'popup.js': '',
      },
      async test() {
        expect(await globby('*', { onlyFiles: false })).toEqual(
          expect.arrayContaining([
            'artifacts',
            'assets',
            'background.js',
            'content.js',
            'dist',
            'config.json',
            'model',
            'options.html',
            'options.js',
            'popup.html',
            'popup.js',
          ])
        )
        expect(await globby('*', { cwd: 'dist', onlyFiles: false })).toEqual([
          'assets',
          'background.js',
          'browser-polyfill.js',
          'content.js',
          'manifest.json',
          'options.html',
          'options.js',
          'popup.html',
          'popup.js',
        ])
        expect(require(P.join(process.cwd(), 'dist', 'manifest.json'))).toEqual(
          {
            background: {
              persistent: false,
              scripts: ['browser-polyfill.js', 'background.js'],
            },
            browser_action: {
              default_popup: 'popup.html',
            },
            content_scripts: [
              {
                js: ['browser-polyfill.js', 'content.js'],
                matches: ['<all_urls>'],
              },
            ],
            description: 'foo bar',
            manifest_version: 2,
            name: 'Foo',
            version: '2.0.0',
          }
        )
        await this.page.goto('http://localhost:3000')
        expect(await this.page.screenshot()).toMatchImageSnapshot(this)
      },
    },
  },
  [
    {
      transform: test =>
        async function () {
          test = { test: noop, ...test }
          await outputFiles(test.files)
          await execa.command('base prepare')
          await execa.command('base prepublishOnly')

          const browser = await puppeteer.launch({
            args: [
              `--load-extension=${P.join(process.cwd(), 'dist')}`,
              `--disable-extensions-except=${P.join(process.cwd(), 'dist')}`,
            ],
            headless: false,
          })
          this.page = await browser.newPage()

          const server = express()
            .get('/', (req, res) => res.send(''))
            .listen(3000)
          try {
            await test.test.call(this)
          } finally {
            await this.page.close()
            await browser.close()
            await server.close()
          }
        },
    },
    testerPluginTmpDir(),
  ]
)

import { endent } from '@dword-design/functions'
import puppeteer from '@dword-design/puppeteer'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { execaCommand } from 'execa'
import express from 'express'
import fs from 'fs-extra'
import { globby } from 'globby'
import outputFiles from 'output-files'
import P from 'path'
import Xvfb from 'xvfb'

const xvfb = new Xvfb()

export default tester(
  {
    'browser variable': {
      files: {
        'background.js': endent`
          browser.browserAction.onClicked.addListener(
            () => browser.storage.local.set({ enabled: true })
          )
        `,
        'config.json': JSON.stringify({
          browser_action: {},
          name: 'Foo',
          permissions: ['storage'],
        }),
        'content.js': endent`
          browser.storage.onChanged.addListener((changes, area) => {
            if (area === 'local' && changes.enabled?.newValue) {
              const body = document.querySelector('body')
              body.classList.add('foo')
              body.style.background = 'red'
            }
          })
        `,
        'package.json': JSON.stringify({
          baseConfig: P.resolve('src', 'index.js'),
          description: 'foo bar',
          type: 'module',
          version: '2.0.0',
        }),
      },
      async test() {
        await this.page.goto('http://localhost:3000')

        // https://github.com/puppeteer/puppeteer/issues/2486#issuecomment-602116047
        const backgroundTarget = await this.browser.waitForTarget(
          t => t.type() === 'background_page',
        )

        const backgroundPage = await backgroundTarget.page()
        await backgroundPage.evaluate(() => {
          window.chrome.tabs.query({ active: true }, tabs =>
            window.chrome.browserAction.onClicked.dispatch(tabs[0]),
          )
        })
        await this.page.waitForSelector('.foo')
        expect(await this.page.screenshot()).toMatchImageSnapshot(this)
      },
    },
    'linting error': {
      error: "error  'foo' is assigned a value but never used  no-unused-vars",
      files: {
        'config.json': JSON.stringify({ name: 'Foo' }),
        'content.js': 'const foo = 1',
        'package.json': JSON.stringify({
          baseConfig: P.resolve('src', 'index.js'),
          description: 'foo bar',
          type: 'module',
          version: '2.0.0',
        }),
      },
    },
    'linting error fixable': {
      files: {
        'config.json': JSON.stringify({ name: 'Foo' }),
        'content.js': "console.log('foo');",
        'package.json': JSON.stringify({
          baseConfig: P.resolve('src', 'index.js'),
          description: 'foo bar',
          type: 'module',
          version: '2.0.0',
          }),
      },
    },
    sass: {
      files: {
        'assets/style.scss': endent`
          $color: red;

          body {
            background: $color;
          }
        `,
        'config.json': JSON.stringify({ name: 'Foo' }),
        'content.js': endent`
          import styleCode from './assets/style.scss'

          const style = document.createElement('style')
          style.type = 'text/css'
          style.appendChild(document.createTextNode(styleCode))
          document.getElementsByTagName('head')[0].appendChild(style)
        `,
        'package.json': JSON.stringify({
          baseConfig: P.resolve('src', 'index.js'),
          description: 'foo bar',
          type: 'module',
          version: '2.0.0',
        }),
      },
      async test() {
        await this.page.goto('http://localhost:3000')
        expect(await this.page.screenshot()).toMatchImageSnapshot(this)
      },
    },
    simple: {
      files: {
        'config.json': JSON.stringify({
          browser_action: {},
          name: 'Foo',
          permissions: ['storage'],
        }),
        'content.js': "document.body.classList.add('foo')",
        'package.json': JSON.stringify({
          baseConfig: P.resolve('src', 'index.js'),
          description: 'foo bar',
          type: 'module',
          version: '2.0.0',
        }),
      },
      async test() {
        await this.page.goto('http://localhost:3000')
        await this.page.this.page.waitForSelector('.foo')
      },
    },
    valid: {
      files: {
        'assets/foo.png': '',
        'background.js': '',
        'config.json': JSON.stringify({ name: 'Foo' }),
        'content.js': endent`
          import './model/foo'

          document.querySelector('body').style.background = 'red'

        `,
        'model/foo.js': 'export default 1',
        'options.html': '',
        'options.js': '',
        'package.json': JSON.stringify({
          baseConfig: P.resolve('src', 'index.js'),
          description: 'foo bar',
          type: 'module',
          version: '2.0.0',
        }),
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
          ]),
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
        expect(await fs.readJson(P.join('dist', 'manifest.json'))).toEqual({
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
        })
        await this.page.goto('http://localhost:3000')
        expect(await this.page.screenshot()).toMatchImageSnapshot(this)
      },
    },
  },
  [
    {
      transform: test =>
        async function () {
          await outputFiles(test.files)
          await execaCommand('base prepare')
          if (test.error) {
            await expect(execaCommand('base prepublishOnly')).rejects.toThrow(
              test.error,
            )

            return
          }
          await execaCommand('base prepublishOnly')
          if (test.test) {
            xvfb.start()
            this.browser = await puppeteer.launch({
              args: [
                `--load-extension=${P.join(process.cwd(), 'dist')}`,
                `--disable-extensions-except=${P.join(process.cwd(), 'dist')}`,
              ],
              headless: false,
            })
            this.page = await this.browser.newPage()

            const server = express()
              .get('/', (req, res) => res.send(''))
              .listen(3000)
            try {
              await test.test.call(this)
            } finally {
              await this.page.close()
              await this.browser.close()
              await server.close()
              xvfb.stop()
            }
          }
        },
    },
    testerPluginTmpDir(),
  ],
)

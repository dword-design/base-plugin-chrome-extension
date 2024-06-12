import { endent } from '@dword-design/functions'
import puppeteer from '@dword-design/puppeteer'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import packageName from 'depcheck-package-name'
import { execaCommand } from 'execa'
import express from 'express'
import fs from 'fs-extra'
import { globby } from 'globby'
import outputFiles from 'output-files'
import P from 'path'

export default tester(
  {
    'action with icon': {
      files: {
        'config.json': JSON.stringify({
          action: {},
          name: 'Foo',
          permissions: ['storage'],
        }),
        'content.js': '',
        'package.json': JSON.stringify({
          baseConfig: P.resolve('src', 'index.js'),
          description: 'foo bar',
          type: 'module',
          version: '2.0.0',
        }),
        'public/icon.png': '',
      },
    },
    'babel in js': {
      files: {
        'config.json': JSON.stringify({ name: 'Foo' }),
        'content.js': 'console.log(1 |> x => x * 2)',
        'package.json': JSON.stringify({
          baseConfig: P.resolve('src', 'index.js'),
          description: 'foo bar',
          type: 'module',
          version: '2.0.0',
        }),
      },
      test: async () =>
        expect(
          await fs.readFile(P.join('dist', 'chrome', 'content.js'), 'utf8'),
        ).toEqual(
          '(function(){"use strict";var o;console.log((o=1,o*2))})();\n',
        ),
    },
    'babel in vue': {
      files: {
        'background.js': '',
        'config.json': JSON.stringify({ name: 'Foo' }),
        'package.json': JSON.stringify({
          baseConfig: P.resolve('src', 'index.js'),
          dependencies: {
            vue: '*',
          },
          description: 'foo bar',
          type: 'module',
          version: '2.0.0',
        }),
        'popup.html': endent`
          <div id="app"></div>
          <script type="module" src="./popup.js"></script>
        `,
        'popup.js': endent`
          import { createApp } from 'vue';

          import Popup from './popup.vue';

          createApp(Popup).mount('#app');
        `,
        'popup.vue': endent`
          <template>
            <div class="foo">{{ foo }}</div>
          </template>

          <script setup>
          const foo = 1 |> x => x * 2
          </script>
        `,
      },
      async test() {
        const target = await this.browser.waitForTarget(
          t => t.type() === 'service_worker',
        )

        const worker = await target.worker()

        const extensionId = worker.url().split('/')[2]
        await this.page.goto(`chrome-extension://${extensionId}/popup.html`)
        expect(await this.page.$eval('.foo', _ => _.innerText)).toEqual('2')
      },
    },
    'browser variable': {
      files: {
        'background.js': endent`
          import browser from '${packageName`webextension-polyfill`}'

          browser.action.onClicked.addListener(
            () => browser.storage.local.set({ enabled: true })
          )
        `,
        'config.json': JSON.stringify({
          action: {},
          name: 'Foo',
          permissions: ['storage'],
        }),
        'content.js': endent`
          import browser from '${packageName`webextension-polyfill`}'

          browser.storage.onChanged.addListener((changes, area) => {
            if (area === 'local' && changes.enabled?.newValue) {
              document.body.classList.add('foo')
            }
          })
        `,
        'package.json': JSON.stringify({
          baseConfig: P.resolve('src', 'index.js'),
          dependencies: {
            'webextension-polyfill': '*',
          },
          description: 'foo bar',
          type: 'module',
          version: '2.0.0',
        }),
      },
      async test() {
        await this.page.goto('http://localhost:3000')

        // https://github.com/puppeteer/puppeteer/issues/2486#issuecomment-1159705685
        const target = await this.browser.waitForTarget(
          t => t.type() === 'service_worker',
        )

        const worker = await target.worker()
        await worker.evaluate(() => {
          self.chrome.tabs.query({ active: true }, tabs =>
            self.chrome.action.onClicked.dispatch(tabs[0]),
          )
        })
        await this.page.waitForSelector('.foo')
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
    'linting error in vue': {
      error: "'foo' is not defined",
      files: {
        'Popup.vue': endent`
          <template>
            <div class="foo" />
          </template>

          <script setup>
          foo
          </script>
        `,
        'background.js': '',
        'config.json': JSON.stringify({ name: 'Foo' }),
        'package.json': JSON.stringify({
          baseConfig: P.resolve('src', 'index.js'),
          dependencies: {
            vue: '*',
          },
          description: 'foo bar',
          type: 'module',
          version: '2.0.0',
        }),
        'popup.html': endent`
          <div id="app"></div>
          <script type="module" src="./popup.js"></script>
        `,
        'popup.js': endent`
          import { createApp } from 'vue';

          import Popup from './popup.vue';

          createApp(Popup).mount('#app');
        `,
      },
    },
    sass: {
      files: {
        'assets/style.scss': endent`
          $color: red;

          body {
            color: $color;
          }
        `,
        'config.json': JSON.stringify({
          css: ['assets/style.scss'],
          name: 'Foo',
        }),
        'content.js': '',
        'package.json': JSON.stringify({
          baseConfig: P.resolve('src', 'index.js'),
          description: 'foo bar',
          type: 'module',
          version: '2.0.0',
        }),
      },
      async test() {
        await this.page.goto('http://localhost:3000')
        expect(
          await this.page.evaluate(
            () => window.getComputedStyle(document.body).color,
          ),
        ).toEqual('rgb(255, 0, 0)')
      },
    },
    svg: {
      files: {
        'Popup.vue': endent`
          <template>
            <svg-icon />
          </template>

          <script setup>
          import SvgIcon from '${packageName`@mdi/svg`}/svg/checkbox-marked-circle.svg';
          </script>
        `,
        'background.js': '',
        'config.json': JSON.stringify({ name: 'Foo' }),
        'package.json': JSON.stringify({
          baseConfig: P.resolve('src', 'index.js'),
          dependencies: {
            '@mdi/svg': '*',
            vue: '*',
          },
          description: 'foo bar',
          type: 'module',
          version: '2.0.0',
        }),
        'popup.html': endent`
          <div id="app"></div>
          <script type="module" src="./popup.js"></script>
        `,
        'popup.js': endent`
          import { createApp } from 'vue';

          import Popup from './Popup.vue';

          createApp(Popup).mount('#app');
        `,
      },
      async test() {
        await this.page.goto('http://localhost:3000')

        // https://github.com/puppeteer/puppeteer/issues/2486#issuecomment-1159705685
        const target = await this.browser.waitForTarget(
          t => t.type() === 'service_worker',
        )

        const worker = await target.worker()

        const extensionId = worker.url().split('/')[2]
        await this.page.goto(`chrome-extension://${extensionId}/popup.html`)
        expect(await this.page.$('svg')).not.toBeNull()
      },
    },
    valid: {
      files: {
        'assets/foo.png': '',
        'background.js': '',
        'config.json': JSON.stringify({ name: 'Foo' }),
        'content.js': endent`
          import model from './model/foo.js'

          document.body.classList.add(model)
        `,
        'model/foo.js': "export default 'foo'",
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
          'chrome',
        ])
        expect(
          await globby('*', {
            cwd: P.join('dist', 'chrome'),
            onlyFiles: false,
          }),
        ).toEqual([
          'background.js',
          'content.js',
          'manifest.json',
          'popup.html',
        ])
        expect(
          await fs.readJson(P.join('dist', 'chrome', 'manifest.json')),
        ).toEqual({
          action: {
            default_popup: 'popup.html',
          },
          background: {
            service_worker: 'background.js',
          },
          content_scripts: [
            {
              js: ['content.js'],
              matches: ['<all_urls>'],
            },
          ],
          description: 'foo bar',
          manifest_version: 3,
          name: 'Foo',
          version: '2.0.0',
        })
        await this.page.goto('http://localhost:3000')
        await this.page.waitForSelector('.foo')
      },
    },
    vue: {
      files: {
        'Popup.vue': endent`
          <template>
            <div class="foo" />
          </template>
        `,
        'background.js': '',
        'config.json': JSON.stringify({ name: 'Foo' }),
        'package.json': JSON.stringify({
          baseConfig: P.resolve('src', 'index.js'),
          dependencies: {
            vue: '*',
          },
          description: 'foo bar',
          type: 'module',
          version: '2.0.0',
        }),
        'popup.html': endent`
          <div id="app"></div>
          <script type="module" src="./popup.js"></script>
        `,
        'popup.js': endent`
          import { createApp } from 'vue';

          import Popup from './Popup.vue';

          createApp(Popup).mount('#app');
        `,
      },
      async test() {
        await this.page.goto('http://localhost:3000')

        // https://github.com/puppeteer/puppeteer/issues/2486#issuecomment-1159705685
        const target = await this.browser.waitForTarget(
          t => t.type() === 'service_worker',
        )

        const worker = await target.worker()

        const extensionId = worker.url().split('/')[2]
        await this.page.goto(`chrome-extension://${extensionId}/popup.html`)
        expect(await this.page.$('.foo')).not.toBeNull()
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
            this.browser = await puppeteer.launch({
              args: [
                '--load-extension=dist/chrome',
                '--disable-extensions-except=dist/chrome',
              ],
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
            }
          }
        },
    },
    testerPluginTmpDir(),
  ],
)

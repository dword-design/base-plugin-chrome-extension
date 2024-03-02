import browser from 'webextension-polyfill'

browser.action.onClicked.addListener(async () => {
  browser.storage.local.set({
    enabled: !(await browser.storage.local.get(['enabled'])).enabled,
  })
})

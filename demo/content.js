import browser from 'webextension-polyfill'

document.querySelector('body').style.backgroundColor = 'lightblue'
browser.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') {
    return
  }
  console.log(changes.enabled?.newValue)
  document.body.classList[changes.enabled?.newValue ? 'add' : 'remove']('foo')
})

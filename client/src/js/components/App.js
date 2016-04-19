import {Observable} from 'rx'
import {
  addQueryStringValueToPath,
  stripQueryStringValueFromPath,
  getQueryStringValueFromPath,
} from '../pathUtils'
import render from './view'
import renderAssistant from './viewAssistant'
require('../../css/normalize.css')
require('../../css/main.css')

/*
function model() {
  return Observable.just(
    {title: 'hello',
      cards: [
        {image: 'img/montie.jpg', label: 'Montie at rest', link: 'start'},
        {image: 'img/032.jpg', label: 'Totem Pole', link: 'start'},
        {image: 'https://i.ytimg.com/vi/hSU-PvQBx0A/maxresdefault.jpg', label: 'Pimp my pooch', link: 'start'},
        {image: 'https://i.ytimg.com/vi/19nm5_nAwQg/hqdefault.jpg', label: 'Native Indian Musician', link: 'start'}
      ]
    })
}
*/

function updateQueryStringValueFromPath(path, item, value) {
  const path2 = stripQueryStringValueFromPath(path, item)
  return addQueryStringValueToPath(path2, item, value)
}

const EDIT_KEY = 'edit'
const LEVEL_KEY = 'level'
const ITEM_KEY = 'item'
function _pathItem(path) {
  const item = parseInt(getQueryStringValueFromPath(path, ITEM_KEY), 10)
  return (isNaN(item)) ? 0 : item
}
function _setPathItem(path, item) {
  return updateQueryStringValueFromPath(path, ITEM_KEY, item)
}
function _pathLevel(path) {
  return getQueryStringValueFromPath(path, LEVEL_KEY)
}
function _setPathLevel(path, level) {
  return updateQueryStringValueFromPath(path, LEVEL_KEY, level)
}
function _isPathEdit(path) {
  return getQueryStringValueFromPath(path, EDIT_KEY) === 'true'
}
function _togglePathEdit(path) {
  return (_isPathEdit(path) ? stripQueryStringValueFromPath(path, 'edit')
                            : addQueryStringValueToPath(path, 'edit', 'true'))
}
function _albumPath(name) {
  return `/album/${name}`
}
function _albumNameFromPath(path) {
  return path === '/' ? 'start' : path === '/index.html' ? 'start' : path.split('/')[2]
}

function _albumConfig(config, album) {
  // console.log('ac', config, album)
  return config.albums.filter(({name}) => name === album.name)[0]
}

function _albumModel(config, album) {
  // console.log('model', album, album.showCard)
  const albumConfig = _albumConfig(config, album)
  return {name: albumConfig.name,
          title: `Touch the photos to see more. This is "${albumConfig.name}"`,
          cards: albumConfig.cards.map(({label, image, album}) => {
            const image2 = (image.slice(0, 4) === 'blob' ? image : `${image}`)
            return {label, image: image2, album}
          }),
          edit: album.edit,
          level: album.level,
          changes: album.changes,
          showCard: album.showCard}
}

function App({DOM, HTTP, history, speech, appConfig, settings}) {
  const navBack$ = DOM.select('[data-action="back"]').events('click')
  .map({type: 'go', value: -1})

  function _findAlbum(albums, albumName) {
    return albums.filter(({name}) => name === albumName)[0]
  }

  const navLevel$ = settings
    .map(({level}) => {
      const loc = window.location
      return _setPathLevel(`${loc.pathname}${loc.search}`, level)
    })

  const navHome$ = DOM.select('[data-action="home"]').events('click')
   .map('/')

  const navEditMode$ = DOM.select('[data-action="edit"]').events('click')
   .map(({currentTarget}) => {
     const loc = currentTarget.ownerDocument.location // bad developer !
     const path = `${loc.pathname}${loc.search}`
     return (_isPathEdit(path)) ?
     {type: 'go', value: -1} : _togglePathEdit(path)})

  const navNextItem$ = DOM.select('[data-action="next"]').events('click')
    .map(({currentTarget}) => {
      const loc = currentTarget.ownerDocument.location
      const path = `${loc.pathname}${loc.search}`
      const nextItem = (_pathItem(path) + 1) % 4
      return _setPathItem(path, nextItem)
    })

  const blurLabel$ = DOM.select('.cardLabel').events('blur')
    .map(({currentTarget}) => {
      console.dir('#', currentTarget)
      return {
        album: currentTarget.parentElement.dataset.album,
        index: currentTarget.parentElement.dataset.card,
        text: currentTarget.value
      }})
  .combineLatest(appConfig, (update, config) => {
    const newConfig = Object.assign({}, config)
    console.log('@', newConfig.albums, ':', update.album)
    const album = _findAlbum(newConfig.albums, update.album)
    album.cards[update.index].label = update.text
    return newConfig
  })

 /* const load$ = DOM.select('.cardImage').events('load')
    .do(({currentTarget}) => {window.URL.revokeObjectURL(currentTarget.src)})
    .subscribe(x => console.log('revoked', x))
*/

 // TODO find a way to persist links to local files - may be impossible
  const changeImage$ = DOM.select('.fileElem').events('change')
  .filter(({currentTarget}) => currentTarget.files.length)
    .map(({currentTarget}) => {
      const image = currentTarget.nextSibling
      const file = currentTarget.files[0]
      image.src = window.URL.createObjectURL(file) // eslint immutable/no-mutation: "off"
      return {album: currentTarget.parentElement.dataset.album,
              index: currentTarget.parentElement.dataset.card,
              URL: image.src,
      }})
  .combineLatest(appConfig, (update, config) => {
    const newConfig = Object.assign({}, config)
    const album = _findAlbum(newConfig.albums, update.album)
    album.cards[update.index].image = update.URL
    return newConfig
  })

  const touchSpeech$ = DOM.select('[data-action="speak"]').events('click')
  .map(({currentTarget}) => currentTarget.textContent)

  const key$ = DOM.select('.screen').events('keydown')
    .do(({target}) => console.log("key", target))
    .subscribe()

  // If editing hand click over to hidden file picker
  const selectImage$ = DOM.select('.cardImage').events('click')
   .filter(({target}) => target.previousSibling.className === 'fileElem')
   .do(e => {
     e.stopPropagation()
     e.target.previousSibling.click()
   })
   .subscribe()



  const cardClick$ = DOM.select('[data-view]').events('click')
    // stop being processed in capture phase so children get a look in
   .filter(({target}) => target.dataset.edit !== 'true')

  const navScreen$ = cardClick$
    .map(({currentTarget}) => {
      return {name: currentTarget.dataset.view}
    })
    .combineLatest(appConfig,
                   (album, config) => _albumConfig(config, album))
    .filter(x => x !== undefined)
    .map(albumConfig => _albumPath(albumConfig.name))

  const naveHome$ = history
      .filter(({pathname}) => pathname === '/' || pathname === '/index.html')
      .map(({search}) => `/album/start${search}`)

  const album$ = history
    .filter(({pathname}) => (pathname.slice(0, 6) === '/album' || pathname === '/' || pathname === '/index.html'))
    .combineLatest(settings, ({pathname, search, action}, {changes}) => ({pathname, search, action, changes}))
    .map(({pathname, search, action, changes}) => {
      return {name: _albumNameFromPath(pathname),
              edit: _isPathEdit(search),
              level: _pathLevel(search),
              changes,
              showCard: _pathItem(search)}})
  const screen$ = album$
    .combineLatest(appConfig,
                   (album, config) => _albumModel(config, album))


// Assistant
  const navAssistant$ = history
    .filter(({pathname}) => pathname === '/assistant.html')

  const intentLevel0$ = DOM.select('[data-action="level0"]').events('click')
    .map({level: 0})
  const intentLevel1$ = DOM.select('[data-action="level1"]').events('click')
    .map({level: 1})
  const levelSet$ = Observable.merge(intentLevel0$, intentLevel1$)
    .startWith({level: 1})

  const intentChangesN$ = DOM.select('[data-action="changesN"]').events('click')
    .map({changes: 0})
  const intentChangesY$ = DOM.select('[data-action="changesY"]').events('click')
    .map({changes: 1})
  const changesSet$ = Observable.merge(intentChangesN$, intentChangesY$)
    .startWith({changes: 1})

  const setting$ = Observable.combineLatest(changesSet$, levelSet$, ({changes}, {level}) => ({level, changes}))

  const intentReset$ = DOM.select('[data-action="reset"]').events('click')
    .do(e => e.stopPropagation()) // stop next event resetConf getting fired - prolly the driver and bubbling
  const intentResetConf$ = DOM.select('[data-action="resetConf"]').events('click')
    .map("Reset")

  const settingsResetClear$ = intentResetConf$
    .combineLatest(setting$, (x, settings) => ({assistant: true, resetReq: false, settings}))
  const settingsReset$ = intentReset$
    .combineLatest(setting$, (x, settings) => ({assistant: true, resetReq: true, settings}))
    .merge(settingsResetClear$)

  const screenAssistant$ = setting$
    .map(settings => ({assistant: true, resetReq: false, settings}))
    .merge(settingsReset$)

  const view$ = screen$.merge(screenAssistant$)
    .map(model => {
      const renderer = (model.assistant) ? renderAssistant : render
      return renderer(model)
    })
  const navigate$ = Observable.merge(navHome$, navBack$, navScreen$, navNextItem$, navEditMode$, naveHome$, navLevel$)
  const speech$ = Observable.merge(touchSpeech$)

  return {
    DOM: view$.do(x => console.log("view:", x)),
    history: navigate$.do(x => console.log("nav: ", x)),
    speech: speech$.do(x => console.log("spk: ", x)),
    appConfig: Observable.merge(blurLabel$, changeImage$, intentResetConf$).do(x => console.log("config: ", x)),
    settings: setting$.do(x => console.log("setting: ", x))
  }
}

export default App

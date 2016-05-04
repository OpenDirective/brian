import {Observable} from 'rx'
import {
  addQueryStringValueToPath,
  stripQueryStringValueFromPath,
  getQueryStringValueFromPath,
} from '../utilities/pathUtils'
import render from './view'

require('../../css/normalize.css')
require('../../css/main.css')

function updateQueryStringValueFromPath(path, item, value) {
  const path2 = stripQueryStringValueFromPath(path, item)
  return addQueryStringValueToPath(path2, item, value)
}

const EDIT_KEY = 'edit'
const ADDING_KEY = 'add'
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
  return (_isPathEdit(path) ? stripQueryStringValueFromPath(path, EDIT_KEY)
                            : addQueryStringValueToPath(path, EDIT_KEY, 'true'))
}
function _isPathAdding(path) {
  return getQueryStringValueFromPath(path, ADDING_KEY) === 'true'
}
function _togglePathAdding(path) {
  return (_isPathAdding(path) ? stripQueryStringValueFromPath(path, ADDING_KEY)
                            : addQueryStringValueToPath(path, ADDING_KEY, 'true'))
}
function _albumPath(id) {
  return `/album/${id}`
}
function _albumNameFromPath(path) {
  return path === '/' ? 'Home' : path === '/index.html' ? 'Home' : path.split('/')[2]
}
function _albumIdFromPath(path) {
  return path === '/' ? 1 : path === '/index.html' ? 1 : parseInt(path.split('/')[2], 10)
}


function _albumConfig(config, album) {
  return config.albums.filter(({id}) => id === album.id)[0]
}

function _albumModel(config, album) {
  //console.log('model', config, album, album.showCard)
  const albumConfig = _albumConfig(config, album)
  const albumList = config.albums.map(a => ({id: a.id, name: a.name})).concat([{id: 0, name: '[Show Nothing]'}])
                      .filter(({id}) => id !== albumConfig.id)

  const albumName = albumConfig.name || `Album_${albumConfig.id}`
  return {
    id: albumConfig.id,
    name: albumName,
    title: `${album.edit ? '' : `This is "${albumName}".  Touch the photos to see more.`}`,
    cards: albumConfig.cards.map(({label, image, album}) => {
      const image2 = (image.slice(0, 4) === 'blob' ? image : `${image}`)
      return {label, image: image2, album}
    }),
    edit: album.edit,
    adding: album.adding,
    level: album.level,
    changes: album.changes,
    showCard: album.showCard,
    albumList
  }
}

function _findAlbum(albums, albumId) {
  return albums.filter(({id}) => id === albumId)[0]
}

function _getParentCard(nodeStart) {
  let node = undefined
  for (node = nodeStart;
        node.id !== 'root';
        node = node.parentElement) {
    if (node.className === 'card') {
      break
    }
  }
  return node
}


function App({DOM, history, speech, appConfig, settings, activityLog}) {
  const navBack$ = DOM.select('[data-action="back"]').events('click')
  .map({type: 'go', value: -1})

  const cleanInstall$ = appConfig
    .filter(({cleanInstall}) => cleanInstall)
    .map(config => Object.assign({}, config, {cleanInstall: false}))

// log inputs
  const x = appConfig.do(x => console.log("in: appConfig`", x))
    .subscribe()
  const x1 = settings.do(x => console.log("in: settings", x))
    .subscribe()
  const x2 = history.do(x => console.log("in: history", x))
    .subscribe()

 // TODO stop this being called at startup
  const navLevel$ = settings
    .map(({level}) => {
      const loc = window.location
      return _setPathLevel(`${decodeURI(loc.pathname)}${loc.search}`, level)
    })

  const navHome$ = DOM.select('[data-action="home"]').events('click')
   .merge(cleanInstall$)
   .map('/')

  const navEditMode$ = DOM.select('[data-action="edit"]').events('click')
   .map(({currentTarget}) => {
     const loc = currentTarget.ownerDocument.location // bad developer !
     const path = `${decodeURI(loc.pathname)}${loc.search}`
     return (_isPathEdit(path)) ?
     {type: 'go', value: -1} : _togglePathEdit(path)})

  const navNextItem$ = DOM.select('[data-action="next"]').events('click')
    .map(({currentTarget}) => {
      const loc = currentTarget.ownerDocument.location
      const path = `${decodeURI(loc.pathname)}${loc.search}`
      const nextItem = (_pathItem(path) + 1) % 4
      return _setPathItem(path, nextItem)
    })

  const blurAlbumLabel$ = DOM.select('.labelEdit').events('blur')
    .map(({currentTarget}) => ({
      album: parseInt(currentTarget.dataset.album, 10),
      value: currentTarget.value
    }))
    .withLatestFrom(appConfig, (update, config) => {
      const newConfig = Object.assign({}, config)
      const album = _findAlbum(newConfig.albums, update.album)
      album.name = update.value
      return newConfig
    })

  const blurLabel$ = DOM.select('.cardLabelEdit').events('blur')
    .map(({currentTarget}) => {
      const card = _getParentCard(currentTarget)
      return {
        album: parseInt(card.dataset.album, 10),
        index: parseInt(card.dataset.card, 10),
        value: currentTarget.value
      }})
   .withLatestFrom(appConfig, (update, config) => {
     const newConfig = Object.assign({}, config)
     const album = _findAlbum(newConfig.albums, update.album)
     album.cards[update.index].label = update.value
     return newConfig
   })


  const blurOption$ = DOM.select('.cardOption').events('change')
    .do(e => e.stopPropagation())
    .map(({currentTarget}) => {
      const card = _getParentCard(currentTarget)
      return {
        album: parseInt(card.dataset.album, 10),
        index: parseInt(card.dataset.card, 10),
        value: parseInt(currentTarget.value, 10)
      }})
   .withLatestFrom(appConfig, (update, config) => {
     const newConfig = Object.assign({}, config)
     const album = _findAlbum(newConfig.albums, update.album)
     album.cards[update.index].album = update.value
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
      const card = _getParentCard(currentTarget)
      return {album: parseInt(card.dataset.album, 10),
              index: parseInt(card.dataset.card, 10),
              URL: image.src,
      }})
  .withLatestFrom(appConfig, (update, config) => {
    const newConfig = Object.assign({}, config)
    const album = _findAlbum(newConfig.albums, update.album)
    album.cards[update.index].image = update.URL
    return newConfig
  })

  const touchSpeech$ = DOM.select('[data-action="speak"]').events('click')
  .map(({currentTarget}) => currentTarget.textContent)

/*
     const key$ = DOM.select('.screen').events('keydown')
    .do(({target}) => console.log("key", target))
    .subscribe()
*/

  // If editing hand click over to hidden file picker
  const selectImage$ = DOM.select('.cardImage').events('click')
   .filter(({target}) => target.previousSibling.className === 'fileElem')
   .do(e => {
     e.stopPropagation()
     e.target.previousSibling.click()
   })
   .subscribe()


  const newAlbumClick$ = DOM.select('.addAlbum').events('click')
   .filter(({currentTarget}) => currentTarget.parentElement !== null) // filter strange second event after button is hidden

  const nextAlbumId$ = newAlbumClick$
    .flatMapLatest(() => appConfig.current())
    .map(({albums}) => albums.length + 1)

  const addNewAlbum$ = newAlbumClick$
   .map(({target}) => {
     const card = _getParentCard(target)
     return {
       album: parseInt(card.dataset.album, 10),
       index: parseInt(card.dataset.card, 10)
     }
   })
  .withLatestFrom(appConfig, nextAlbumId$, (update, config, nextID) => {
    const newConfig = Object.assign({}, config)
    newConfig.albums.push({
      id: nextID,
      name: `Album_${nextID}`,
      cards: [
        {label: `Image_${nextID}_1`, image: '', album: 0},
        {label: `Image_${nextID}_2`, image: '', album: 0},
        {label: `Image_${nextID}_3`, image: '', album: 0},
        {label: `Image_${nextID}_4`, image: '', album: 0}]})
    const album = _findAlbum(newConfig.albums, update.album)
    album.cards[update.index].album = nextID
    return newConfig
  })
  .share()  // DOM is cold

  const navNewAlbum$ = addNewAlbum$
    .withLatestFrom(nextAlbumId$, (config, nextID) => ({id: nextID}))
    .withLatestFrom(appConfig,
                   (album, config) => _albumConfig(config, album))
    .filter(x => x !== undefined)
    .map(albumConfig => _togglePathAdding(_togglePathEdit(_albumPath(albumConfig.id))))

  const cardClick$ = DOM.select('[data-view]').events('click')
    // stop being processed in capture phase so children get a look in
   .filter(({currentTarget}) => currentTarget.dataset.edit !== 'true')

  const navScreen$ = cardClick$
    .map(({currentTarget}) => {
      return {id: parseInt(currentTarget.dataset.view, 10)}
    })
    .withLatestFrom(appConfig,
                   (album, config) => _albumConfig(config, album))
    .filter(x => x !== undefined)
    .map(albumConfig => _albumPath(albumConfig.id))

  const album$ = history
    .filter(({pathname}) => pathname === '/' || (pathname.slice(0, 6) === '/album'))
    .withLatestFrom(settings, ({pathname, search, action}, {changes}) => ({pathname, search, action, changes}))
    .map(({pathname, search, action, changes}) => {
      return {id: _albumIdFromPath(decodeURI(pathname)),
              edit: _isPathEdit(search),
              adding: _isPathAdding(search),
              level: _pathLevel(search),
              changes,
              showCard: _pathItem(search)}})
      .share()

  const screen$ = album$
    .withLatestFrom(appConfig,
                   (album, config) => _albumModel(config, album))

  const activity$ = screen$
    .map(({name}, {edit}) => ({user: 'Jo', album: name, access: edit ? 'change' : 'view'}))

  // combine

  const view$ = screen$
    .map(model => {
      console.log('model', model)
      return render(model)
    })
  const navigate$ = Observable.merge(navHome$, navBack$, navScreen$, navNextItem$, navEditMode$, navLevel$, navNewAlbum$)
  const speech$ = Observable.merge(touchSpeech$)

  const anyClick$ = DOM.select('#root').events('click')
  const fullScreen$ = anyClick$
    .map({fullScreen: true})

  const config$ = Observable.merge(addNewAlbum$, cleanInstall$, blurLabel$, blurAlbumLabel$, blurOption$, changeImage$, addNewAlbum$)

  // nb order does matter her as main as cycle loops through
  return {
    activityLog: activity$.do(x => console.log("out: activityLog", x)),
    appConfig: config$.do(x => console.log("out: appConfig", x)),
    DOM: view$.do(x => console.log("out: DOM", x)),
    history: navigate$.do(x => console.log("out: history", x)),
    speech: speech$.do(x => console.log("out: speech", x)),
    //fullScreen: fullScreen$
  }
}

export default App

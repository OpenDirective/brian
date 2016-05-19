import {Observable} from 'rx'
import {
  getQueryStringValueFromPath,
  addQueryStringValueToPath,
  stripQueryStringValueFromPath,
} from '../utilities/path-utils'

function updateQueryStringValueFromPath(path, item, value) {
  const path2 = stripQueryStringValueFromPath(path, item)
  return addQueryStringValueToPath(path2, item, value)
}

const keys = {
  EDIT_KEY: 'edit',
  ADDING_KEY: 'add',
  LEVEL_KEY: 'level',
  ITEM_KEY: 'item',
}

// Routing
function _itemFromPath(path) {
  const item = parseInt(getQueryStringValueFromPath(path, keys.ITEM_KEY), 10)
  return (isNaN(item)) ? 0 : item
}
function _isPathEdit(path) {
  return getQueryStringValueFromPath(path, keys.EDIT_KEY) === 'true'
}
function _isPathAdding(path) {
  return getQueryStringValueFromPath(path, keys.ADDING_KEY) === 'true'
}
function _levelFromPath(path) {
  return getQueryStringValueFromPath(path, keys.LEVEL_KEY)
}


export const routing = {
  _levelFromPath,
  _itemFromPath,
  _isPathEdit,
  _isPathAdding
}

// Navigation
function _setPathItem(path, item) {
  return updateQueryStringValueFromPath(path, keys.ITEM_KEY, item)
}
function _setPathLevel(path, level) {
  return updateQueryStringValueFromPath(path, keys.LEVEL_KEY, level)
}
function _togglePathEdit(path) {
  return (_isPathEdit(path) ? stripQueryStringValueFromPath(path, keys.EDIT_KEY) :
                              addQueryStringValueToPath(path, keys.EDIT_KEY, 'true'))
}
function _togglePathAdding(path) {
  return (_isPathAdding(path) ? stripQueryStringValueFromPath(path, keys.ADDING_KEY) :
                                addQueryStringValueToPath(path, keys.ADDING_KEY, 'true'))
}
function _albumPath(id) {
  return `/album/${id}`
}
/*
function _albumNameFromPath(path) {
  return path === '/' ? 'Home' : path === '/index.html' ? 'Home' : path.split('/')[2]
}
*/

export function navigator(DOM, appConfig, settings, addNewAlbum$, nextAlbumId$, cleanInstall$, auth$) {
  const navBack$ = DOM.select('[data-action="back"]').events('click')
  .map({type: 'go', value: -1})

  // TODO stop this being called at startup
  const navLevel$ = settings
    .map(({level}) => {
      const loc = window.location
      return _setPathLevel(`${decodeURI(loc.pathname)}${loc.search}`, level)
    })

  const navHome$ = DOM.select('[data-action="home"]').events('click')
   .merge(cleanInstall$)
   .map('/album')

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
      const nextItem = (_itemFromPath(path) + 1) % 4 // TODO why using routing?
      return _setPathItem(path, nextItem)
    })

  const navNewAlbum$ = addNewAlbum$
    .withLatestFrom(nextAlbumId$, (x, nextID) => nextID)
/*    .withLatestFrom(appConfig,
                   (album, config) => _albumConfig(config, album))
    .filter(x => x !== undefined)*/
    .map(newAlbumId => _togglePathAdding(_togglePathEdit(_albumPath(newAlbumId))))

//  const cardClick$ = DOM.select('[data-view]').events('click')
    // stop being processed in capture phase so children get a look in
//   .filter(({currentTarget}) => currentTarget.dataset.edit !== 'true')
//     .filter(false)

  const intentViewLarge$ = DOM.select('[data-action="viewLarge"]').events('click')
  const navViewer$ = intentViewLarge$
    .map(({currentTarget}) => {
      const card = currentTarget.parentNode
      const album = parseInt(card.dataset.album, 10)
      const item = parseInt(card.dataset.card, 10)
      return {album, item}
    })
    .map(({album, item}) => `/viewer/${album}/${item}`)

  const cardClick$ = DOM.select('.cardImage').events('click')

  const navScreen$ = cardClick$
    .map(({currentTarget}) => {
      const card = currentTarget.parentNode
      return parseInt(card.dataset.view, 10)
    })
    .filter(albumId => albumId !== 0)
    .map(albumId => _albumPath(albumId))

  const navAuthChange$ = auth$
    .map(intent => `/${intent}`)

  const navigate$ = Observable.merge(navHome$, navBack$, navScreen$, navNextItem$,
                                     navEditMode$, navLevel$, navNewAlbum$, navAuthChange$, navViewer$)

  return navigate$
}


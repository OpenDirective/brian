import {Observable} from 'rx'
import {
  addQueryStringValueToPath,
  stripQueryStringValueFromPath,
  getQueryStringValueFromPath,
} from '../pathUtils'
import render from './view'
require('../../css/normalize.css')
require('../../css/main.css')


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

const EDIT_KEY = 'edit'
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
  return path === '/' ? 'start' : path.split('/')[2]
}

function _albumConfig(config, album) {
   //console.log('ac', config, album)
   return config.albums.filter(({name}) => name === album.name)[0]
}

function _albumModel(config, album) {
  const albumConfig = _albumConfig(config, album)
  return {title: `Touch the photos to see more. This is "${albumConfig.name}"`,
          cards: albumConfig.cards.map(({label, image, album}) =>
                { const image2 = (image.slice(0, 4) === 'blob' ? image : `${config.photoBasePath}${image}.jpg`)
                  console.log(image2)
                  return {label, image: image2, album}}),
          edit: album.edit}
}

function App({DOM, HTTP, history, speech, appConfig}) {
  const navBack$ = DOM.select('[data-action="back"]').events('click')
  .map({type: 'go', value: -1})

  function _findAlbum(albums, albumName) {
    return albums.filter(({name}) => name === albumName)[0]
  }

  const assist$ = DOM.select('[data-action="assist"]').events('click')
    .subscribe(() => alert('Your request for assistance request has been sent.\\r\\rThe people you asked for will soon be in contact'))

  const navHome$ = DOM.select('[data-action="home"]').events('click')
  .map('/')


  const navEditMode$ = DOM.select('[data-action="edit"]').events('click')
  .map(({currentTarget}) => { const loc = currentTarget.ownerDocument.location
                              const path = `${loc.pathname}${loc.search}`
                              return (_isPathEdit(path)) ?
                              {type: 'go', value: -1} : _togglePathEdit(path)})

  const blurLabel$ = DOM.select('.cardLabel').events('blur')
    .map(({currentTarget}) => {return {
      album: currentTarget.parentElement.dataset.album,
      index: currentTarget.parentElement.dataset.card,
      text: currentTarget.value
    }})
  .combineLatest(appConfig, (update, config) => {
    const newConfig = Object.assign({}, config)
    const album = _findAlbum(newConfig.albums, update.album)
    album.cards[update.index].label = update.text
    return newConfig
  })

 /* const load$ = DOM.select('.cardImage').events('load')
    .do(({currentTarget}) => {window.URL.revokeObjectURL(currentTarget.src)})
    .subscribe(x => console.log('revoked', x))
*/

 // simply hand click over to hidden file picker
 const selectImage$ = DOM.select('.cardImage').events('click')
   .do(({currentTarget}) => currentTarget.previousSibling.click())
   .subscribe()

 // TODO find a way to persist links to local files - may be impossible
  const changeImage$ = DOM.select('.fileElem').events('change')
    .filter(({currentTarget}) => currentTarget.files.length)
    .map(({currentTarget}) => { const image = currentTarget.nextSibling
                                const file = currentTarget.files[0]
                                image.src = window.URL.createObjectURL(file)
                                return {album: currentTarget.parentElement.dataset.album,
                                        index: currentTarget.parentElement.dataset.card,
                                        URL: image.src,
                                }})
  .combineLatest(appConfig, (update, config) => {
    console.log('u', update);
    const newConfig = Object.assign({}, config)
    const album = _findAlbum(newConfig.albums, update.album)
    album.cards[update.index].image = update.URL
    return newConfig
  })

  const speech$ = DOM.select('[data-action="speak"]').events('click')
  .map(({currentTarget}) => currentTarget.textContent)

  const cardImageClick$ = DOM.select('.cardImage').events('click')
    .do(x => console.dir(x, x.currentTarget))

  const edit$ = cardImageClick$
   .map(({currentTarget}) => {return {pathname: `/album/zzz/getImage`}})

  const cardClick$ = DOM.select('[data-view]').events('click')
    // stop being processed in capture phase so children get a look in
   .filter(({currentTarget}) => currentTarget.dataset.edit !== 'true')

  const navScreen$ = cardClick$
    .map(({currentTarget}) => {return {name: currentTarget.dataset.view}})
    .combineLatest(appConfig,
                   (album, config) => _albumConfig(config, album))
    .filter(x => x !== undefined)
    .map(albumConfig => _albumPath(albumConfig.name))

  const album$ = history
    .map(({pathname, search, action}) => {return {name: _albumNameFromPath(pathname),
                                          edit: _isPathEdit(search)}})

  const screen$ = album$
    .combineLatest(appConfig,
                   (album, config) => _albumModel(config, album))

  const view$ = screen$.combineLatest(render)
  const navigate$ = Observable.merge(navHome$, navBack$, navScreen$, navEditMode$)

  return {
    DOM: view$.do(x => console.log("view:", x)),
    history: navigate$.do(x => console.log("nav: ", x)),
    speech: speech$.do(x => console.log("spk: ", x)),
    appConfig: Observable.merge(blurLabel$, changeImage$).do(x => console.log("config: ", x))
  }
}

export default App

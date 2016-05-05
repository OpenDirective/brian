import {Observable} from 'rx'
import render from './view'
import {navigation, routing} from './navigation'
require('../../css/normalize.css')
require('../../css/main.css')



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

  const navigation$ = navigation(DOM, appConfig, settings, addNewAlbum$, nextAlbumId$, cleanInstall$)

 // log inputs
  const x = appConfig.do(x => console.log("in: appConfig`", x))
    .subscribe()
  const x1 = settings.do(x => console.log("in: settings", x))
    .subscribe()
  const x2 = history.do(x => console.log("in: history", x))
    .subscribe()

  const cleanInstall$ = appConfig
    .filter(({cleanInstall}) => cleanInstall)
    .map(config => Object.assign({}, config, {cleanInstall: false}))

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

  const album$ = history
    .filter(({pathname}) => pathname === '/' || (pathname.slice(0, 6) === '/album'))
    .withLatestFrom(settings, ({pathname, query, action}, {changes}) => ({pathname, query, action, changes}))
    .map(({pathname, query, action, changes}) => {
      return {id: routing._albumIdFromPath(decodeURI(pathname)),
              edit: routing._isPathEdit(query),
              adding: routing._isPathAdding(query),
              level: routing._levelFromPath(query),
              changes,
              showCard: routing._pathItem(query)}})
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
  const speech$ = Observable.merge(touchSpeech$)

  const anyClick$ = DOM.select('#root').events('click')
  const fullScreen$ = anyClick$
    .map({fullScreen: true})

  const config$ = Observable.merge(addNewAlbum$, cleanInstall$, blurLabel$, blurAlbumLabel$, blurOption$, changeImage$)

  // nb order does matter her as main as cycle loops through
  return {
    activityLog: activity$.do(x => console.log("out: activityLog", x)),
    appConfig: config$.do(x => console.log("out: appConfig", x)),
    DOM: view$.do(x => console.log("out: DOM", x)),
    history: navigation$.do(x => console.log("out: history", x)),
    speech: speech$.do(x => console.log("out: speech", x)),
    //fullScreen: fullScreen$
  }
}

export default App

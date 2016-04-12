import {Observable} from 'rx'
import {section, header, main, nav, div, button, img, p, input} from '@cycle/dom'
import {
  addQueryStringValueToPath,
  stripQueryStringValueFromPath,
  getQueryStringValueFromPath,
} from '../pathUtils'

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

function mkCard(name, link, edit) {
  return {image: `https://opendirective.github.io/brianMedia/DARTMockup/${name}.jpg`,
          label: name,
          link,
          edit}
}

function render(screen, edits) {
  const edit = screen.edit
  const btn = edit ? button : button
  let cardID = 0;
  return div('.screen', [
    header('.title', {dataset: {action: 'speak'}}, screen.title),
    main('.main', [
      section('.content',
        screen.cards.map(card =>
          btn('.card', {dataset: {edit, view: card.label, album: screen.title}}, [
            edit ? "Editing"
                  : "",
            img('.cardImage', {src: card.image}),
            edit ? input('.cardLabel', {type: "text", attributes: {value: card.label}, dataset: {card: ++cardID} })
                  : p('.cardLabel', card.label)
          ])
        )
      ),
      nav('.nav', [
        button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'back'}}, 'Back to previous screen'),
        button('.action', {dataset: {action: 'edit'}}, edit ? 'Finish changes' : 'Make changes')
      ])
    ])
  ])
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
   // console.log('ac', config, album)
   return config.albums.filter(({name}) => name === album.name)[0]
}

function _albumModel(config, album) {
  const albumConfig = _albumConfig(config, album)
  return {title: albumConfig.name,
          cards: albumConfig.photos.map(name => {return mkCard(name, name)}),
          edit: album.edit}
}

function App({DOM, HTTP, history, speech, localStorage}) {
  const navBack$ = DOM.select('[data-action="back"]').events('click')
  .map({type: 'go', value: -1})

  const navEditMode$ = DOM.select('[data-action="edit"]').events('click')
  .map(({currentTarget}) => { const loc = currentTarget.ownerDocument.location
                              const path = `${loc.pathname}${loc.search}`
                              return (_isPathEdit(path)) ?
                              {type: 'go', value: -1} : _togglePathEdit(path)})

  const blur$ = DOM.select('.cardLabel').events('blur')
  .map(({currentTarget}) => currentTarget.value)
  .do(x=>console.log(x))
  .subscribe(x => console.log(x))

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
    .combineLatest(localStorage,
                   (album, config) => _albumConfig(config, album))
    .filter(x => x !== undefined)
    .map(albumConfig => _albumPath(albumConfig.name))

  const album$ = history
    .do(x => console.log(x))
    .map(({pathname, search, action}) => {return {name: _albumNameFromPath(pathname),
                                          edit: _isPathEdit(search)}})
    .do(x => console.log('a', x))

  const screen$ = album$
    .combineLatest(localStorage,
                   (album, config) => _albumModel(config, album))

  const view$ = screen$.combineLatest(render)
  const navigate$ = Observable.merge(navBack$, navScreen$, navEditMode$)

  return {
    DOM: view$.do(x => console.log("view:", x)),
    history: navigate$.do(x => console.log("nav: ", x)),
    speech: speech$.do(x => console.dir("spk: ", x))
  }
}

export default App

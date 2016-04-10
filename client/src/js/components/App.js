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
  return div('.screen', [
    header('.title', {dataset: {action: 'speak'}}, screen.title),
    main('.main', [
      section('.content',
        screen.cards.map(card =>
          btn('.card', {dataset: {edit, view: card.label}}, [
            edit ? "Editing"
                  : "",
            img('.cardImage', {src: card.image}),
            edit ? input('.cardLabel', {type: "text", value: card.label})
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
function _albumFromPath(path) {
  return path === '/' ? 'start' : path.split('/')[2]
}


function App({DOM, HTTP, history, speech}) {
  const navBack$ = DOM.select('[data-action="back"]').events('click')
   .map(() => { return {type: 'go', value: -1}})

   const editMode$ = DOM.select('[data-action="edit"]').events('click')
   .map(({currentTarget}) => _togglePathEdit(currentTarget.ownerDocument.URL))

  const speech$ = DOM.select('[data-action="speak"]').events('click')
  .map(({currentTarget}) => currentTarget.textContent)

  const cardImageClick$ = DOM.select('.cardImage').events('click')
    .do(x => console.dir(x, x.currentTarget))

  const edit$ = cardImageClick$
   .map(({currentTarget}) => {return {pathname: `/album/zzz/getImage`}})

  const cardClick$ = DOM.select('.card').events('click')
   .filter(({currentTarget}) => currentTarget.dataset.edit !== 'true') // stop being processed in capture phase so children get a look in

  const navScreen$ = cardClick$
    .map(({currentTarget}) => {return {pathname: `/album/${currentTarget.dataset.view}`}})

  const album$ = history
    //.filter(({search}) => _isPathEdit(search) !== true)
    .map(({pathname, search}) => {return {name: _albumFromPath(pathname),
                                          edit: _isPathEdit(search)}})

  const request$ = album$
    .map(() => {
      return {
//        url: 'https://OpenDirective.github.io/brianMedia/media.json',
        url: '/media.json',
        category: 'media',
        method: 'GET'
      }
    })

  const config$ = HTTP
    .filter(res$ => res$.request.category === 'media')
    .mergeAll()
    .map(res => res.body)

  function albumFromConfig(config, album) {
    const albumConfig = config.albums.filter(({name}) => name === album.name)[0]
    return {title: albumConfig.name,
            cards: albumConfig.photos.map(name => {return mkCard(name, name)}),
            edit: album.edit
    }
  }

  const screen$ = config$
    .combineLatest(album$,
                   (config, album) => albumFromConfig(config, album))

  const view$ = screen$.combineLatest(render)
  const navigate$ = navBack$.merge(navScreen$).merge(editMode$)

  return {
    DOM: view$.do(x => console.log("view:", x)),
    HTTP: request$.do(x => console.log("req:", x)),
    history: navigate$.do(x => console.log("nav: ", x)),
    speech: speech$.do(x => console.dir("spk: ", x))
  }
}

export default App

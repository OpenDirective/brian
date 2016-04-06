import {Observable} from 'rx'
import {section, header, main, nav, div, button, img, p} from '@cycle/dom'

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

function mkCard(name, link) {
  return {image: `https://opendirective.github.io/brianMedia/DARTMockup/${name}.jpg`,
          label: name,
          link}
}

function render(screen) {
  return div('.screen', [
    header('.title', screen.title),
    main('.main', [
      section('.content',
        screen.cards.map(card =>
          div('.cell', [
            button('.card', {dataset: {view: card.label}}, [
              div(img({src: card.image})),
              p(card.label)
            ])
          ])
        )
      ),
      nav('.actions', [
        button('.action', {dataset: {action: 'back'}}, 'back')
      ])
    ])
  ])
}

function App({DOM, HTTP, history}) {
  const backClick$ = DOM.select('.action').events('click')
  const navBack$ = backClick$
    .map(() => { return {type: 'go', value: -1}})

  const cardClick$ = DOM.select('.card').events('click')
  const navScreen$ = cardClick$
    .map(({currentTarget}) => {return {pathname: `/album/${currentTarget.dataset.view}`, state: {some: 'state'}}})
    .startWith({pathname: `/album/start`})

  function albumFromPath(path) {
    return path.split('/')[2]
  }

  const album$ = history
    .map(({pathname}) => {return albumFromPath(pathname)})

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

  const screen$ = config$
    .combineLatest(album$,
                   (config, album) => config.albums.filter(({name}) => name === album)[0])
    .map(album => {
      return {title: album.name,
              cards: album.photos.map(name => {return mkCard(name, name)})
             }
    })

  const view$ = screen$.combineLatest(render)
  const navigate$ = navBack$.merge(navScreen$)

  return {
    DOM: view$,
    HTTP: request$.do(x => console.log("req:", x)),
    history: navigate$.do(x => console.log("nav", x))
  }
}

export default App

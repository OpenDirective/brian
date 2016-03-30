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

function view(state$) {
  return state$.map(screen =>
  div('.screen', [
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
        button('.action', 'back')
      ])
    ])
  ]))
}

function App(sources) {
  const cardClick$ = sources.DOM.select('.card').events('click')

  let desiredAlbum = 'start'
  const mediaRequest$ = cardClick$
    .map(({currentTarget}) => currentTarget.dataset.view)
    .do(x => desiredAlbum = x)
    .startWith('')
    .map(() => {
      return {
//        url: 'https://OpenDirective.github.io/brianMedia/media.json',
        url: '/media.json',
        category: 'media',
        method: 'GET'
      }
    })

  const mediaConfig$ = sources.HTTP
    .filter(res$ => res$.request.category === 'media')
    .mergeAll()
    .map(res => res.body)

  const screen$ = mediaConfig$
    .flatMap(config => {
      return Observable.from(config.albums)
             .filter(album => album.name === desiredAlbum)
    })
       .do(x => console.log(x))
  .map(album => {
      return {title: album.name,
              cards: album.photos.map(name => {return mkCard(name, name)})
             }
    })

  const state$ = screen$
  const vtree$ = view(state$)

  return {
    DOM: vtree$,
    HTTP: mediaRequest$
  }
}

export default App

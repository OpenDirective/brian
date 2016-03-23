import {Observable} from 'rx'
import {section, div, button, img, p} from '@cycle/dom'


function model() {
  return Observable.just({
                          one: {image: '/img/montie.jpg', label: 'Montie at rest'},
                          two: {image: '/img/032.jpg', label: 'Totem Pole'},
                          three: {image: 'https://i.ytimg.com/vi/hSU-PvQBx0A/maxresdefault.jpg', label: 'Pimp my pooch'},
                          four: {image: 'https://i.ytimg.com/vi/19nm5_nAwQg/hqdefault.jpg', label: 'Native Indian Musician'}
  }
  )
}

function view(state$) {
  return state$.map(({one, two, three, four}) =>
    section('.content', [
      div('.cell', [
        button('.card', [
          div(img({src: one.image})),
          p(one.label)
        ])
      ]),
      div('.cell', [
        button('.card', [
          div(img({src: two.image})),
          p(two.label)
        ])
      ]),
      div('.cell', [
        button('.card', [
          div(img({src: three.image})),
          p(three.label)
        ])
      ]),
      div('.cell', [
        button('.card', [
          div(img({src: four.image})),
          p(four.label)
        ])
      ]),
    ])
  )
}

function App(sources) {
  const state$ = model()
  const vtree$ = view(state$)

  return {
    DOM: vtree$
  }
}

export default App

import {Observable} from 'rx'
import {div, img} from '@cycle/dom'
import Card from './Card'

function App(sources) {
  const props = {
    image: '/img/cyclejs_logo.svg'
  }

  const CardComponent = Card({DOM: sources.DOM, props})
  const {DOM: CardVTree$,
         values$: CardValues$} = CardComponent

  const vTree$ = Observable
        .just(div({className: 'app',
                   style: {width: "100vw", height: "100vh"}
                  }, [
                    CardVTree$
                  ])
              )

  const sinks = {
    DOM: vTree$
  }

  return sinks
}

export default App

import {Observable} from 'rx'
import {div, img} from '@cycle/dom'
import Pad from './Pad'

function App(sources) {
  const props = {
    image: '/img/cyclejs_logo.svg'
  }

  const padComponent = Pad({DOM: sources.DOM, props})
  const {DOM: padVTree$,
         values$: padValues$} = padComponent

  const vTree$ = Observable
        .just(div({className: 'app',
                   style: {width: "100vw", height: "100vh"}
                  }, [
                    padVTree$
                  ])
              )

  const sinks = {
    DOM: vTree$
  }

  return sinks
}

export default App

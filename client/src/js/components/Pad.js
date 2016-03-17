import {Observable} from 'rx'
import {button, div, img, text} from '@cycle/dom'

function Pad(sources) {
/*  const image$ = sources.props$
    .map(props => props.image)
    .first()
*/
  const props = sources.props

  const intents$ = sources.DOM
    .select('.pad')
    .events('click')
    .do(v => console.log(v))
    .map(e => e.target.value)
    .subscribe()

  const vTree$ = Observable.just(
    button('.pad',
      div({style: {width: '100vw', height: '100vh'}},
        img({src: props.image})
      )
    )
  )

  const sinks = {
    DOM: vTree$
  }

  return sinks
}

export default Pad

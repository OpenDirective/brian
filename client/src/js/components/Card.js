import {Observable} from 'rx'
import {button, div, img, text} from '@cycle/dom'

function Card(sources) {
/*  const image$ = sources.props$
    .map(props => props.image)
    .first()
*/
  const props = sources.props

  const intents$ = sources.DOM
    .select('.Card')
    .events('click')
    .do(v => console.log(v))
    .map(e => e.target.value)
    .subscribe()

  const vTree$ = Observable.just(
    button('.Card',
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

export default Card

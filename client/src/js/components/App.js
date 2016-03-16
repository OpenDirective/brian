import {Observable} from 'rx'
import {div, img} from '@cycle/dom'
import AdjectiveInput from './AdjectiveInput'
import Sentence from './Sentence'

function App(sources) {
  const adjectiveInputComponent = AdjectiveInput({DOM: sources.DOM})
  const {DOM: adjectiveInputVTree$,
         inputValue$: adjectiveInputValue$} = adjectiveInputComponent

  const sentenceSources = {DOM: sources.DOM, prop$: {adjectiveInputValue$}}
  const sentenceComponent = Sentence(sentenceSources)
  const sentenceVTree$ = sentenceComponent.DOM

  const vTree$ = Observable
        .combineLatest(
          adjectiveInputVTree$,
          sentenceVTree$,
          (inputVTree, sentenceVTree) =>
            div({className: 'app'}, [
              img({src: 'img/cyclejs_logo.svg', width: 200}),
              sentenceVTree,
              inputVTree
            ])
        )

  const sinks = {
    DOM: vTree$
  }

  return sinks
}

export default App

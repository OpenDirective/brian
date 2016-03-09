import {Observable} from 'rx'
import {div, h1} from '@cycle/dom'

// view is what we'd like to display
const view = () => {
  return div('#layout', [
    h1('hello worlds')
  ])
}


// we need to pass our components to cycle and give them a "source" when they come from cycle
// creating this "cycle", here you can see that view$ is a Rx Observable containing out "view"
// we pass view our nav.DOM + Content.DOM which you can see in const view above become available
// variables. We return all of this in an Object with DOM + History
function main(sources) {
  const view$ = Observable.just(view())

  return {
    DOM: view$,
  }
}

export default main

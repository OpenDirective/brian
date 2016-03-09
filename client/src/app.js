import {run} from '@cycle/core'
import {makeDOMDriver} from '@cycle/dom'
import Main from './main'

// This is the Cycle run. first argument is our mainApp then an object:
// DOM is the ID or class we want the cycle to render onto our page.
const sources = {
  DOM: makeDOMDriver('#application'),
}

run(Main, sources)

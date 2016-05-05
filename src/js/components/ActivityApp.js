import {Observable} from 'rx'
import renderActivity from './viewActivity'
require('../../css/normalize.css')
require('../../css/main.css')


function App({DOM, settings, activityLog}) {

// log inputs
  const x1 = settings.do(x => console.log("in: settings", x))
    .subscribe()

  const touchSpeech$ = DOM.select('[data-action="speak"]').events('click')
  .map(({currentTarget}) => currentTarget.textContent)

/*
     const key$ = DOM.select('.screen').events('keydown')
    .do(({target}) => console.log("key", target))
    .subscribe()
*/


  // reset handling
  // TODO glitches here? certainly multiple events per click
  const intentReset$ = DOM.select('[data-action="reset"]').events('click')
  const intentConfirmReset$ = DOM.select('[data-action="resetConf"]').events('click')

  const resetStates$ = intentReset$
    .flatMap(Observable.of('start')
              .merge(intentConfirmReset$.map('confirm'))
              .timeout(2000, Observable.of('timeout'))
              .takeUntil(intentConfirmReset$)
              .concat(Observable.of('off')))
    .filter(x => x !== 'timeout')

  const resetActivity$ = resetStates$
    .filter(x => x === 'confirm')
    .map('Reset')

  const screenActivity$ = activityLog
    .map(log => ({activity: true, resetReq: false, log}))
    .merge(resetStates$.withLatestFrom(activityLog, (r, log) => ({activity: true, resetReq: r === "start", log})))

  // combine

  const view$ = screenActivity$
    .map(model => {
      console.log('a', model)
      return renderActivity(model)
    })

  const speech$ = touchSpeech$
  const anyClick$ = DOM.select('#root').events('click')
  const fullScreen$ = anyClick$
    .map({fullScreen: true})

  // nb order does matter her as main as cycle loops through
  return {
    activityLog: resetActivity$.do(x => console.log("out: activityLog", x)),
    DOM: view$.do(x => console.log("out: DOM", x)),
    speech: speech$.do(x => console.log("out: speech", x)),
    //fullScreen: fullScreen$
  }
}

export default App

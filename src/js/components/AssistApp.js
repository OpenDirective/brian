import {Observable} from 'rx'
import addUser from '../drivers/awsCognitoIdentity'
import renderAssist from './viewassist'

require('../../css/normalize.css')
require('../../css/main.css')


function App({DOM, history, speech, appConfig, settings}) {

// log inputs
  const x = appConfig.do(x => console.log("in: appConfig`", x))
    .subscribe()
  const x1 = settings.do(x => console.log("in: settings", x))
    .subscribe()
  const x2 = history.do(x => console.log("in: history", x))
    .subscribe()
//  const x3 = activityLog.do(x => console.log("in: activityLog", x))
//    .subscribe()

  const touchSpeech$ = DOM.select('[data-action="speak"]').events('click')
  .map(({currentTarget}) => currentTarget.textContent)


// assist
//  const navassist$ = history
//    .filter(({pathname}) => _isPathassist(pathname))
  const intentLevel0$ = DOM.select('[data-action="level0"]').events('click')
    .map({level: 0})
  const intentLevel1$ = DOM.select('[data-action="level1"]').events('click')
    .map({level: 1})
  const levelSet$ = Observable.merge(intentLevel0$, intentLevel1$)
    .startWith({level: 1})

  const intentChangesN$ = DOM.select('[data-action="changesN"]').events('click')
    .map({changes: 0})
  const intentChangesY$ = DOM.select('[data-action="changesY"]').events('click')
    .map({changes: 1})
  const changesSet$ = Observable.merge(intentChangesN$, intentChangesY$)
    .startWith({changes: 1})

  const assistActions$ = Observable.combineLatest(changesSet$, levelSet$, ({changes}, {level}) => ({level, changes}))

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

  const resetAssist$ = resetStates$
    .filter(x => x === 'confirm')
    .map('Reset')

  const screenAssist$ = assistActions$
    .map(settings => ({assist: true, resetReq: false, settings}))
    .merge(resetStates$.withLatestFrom(settings, (r, settings) => ({assist: true, resetReq: r === "start", settings})))


  // Add user
  const intentAddUser$ = DOM.select('[data-action="addUser"]').events('click')
    .do(() => addUser())
    .subscribe()

  // combine

  const view$ = screenAssist$
    .map(model => {
      console.log('a', model)
      return renderAssist(model)
    })
  const speech$ = Observable.merge(touchSpeech$)

  const anyClick$ = DOM.select('#root').events('click')
  const fullScreen$ = anyClick$
    .map({fullScreen: true})

  // nb order does matter her as main as cycle loops through
  return {
    appConfig: resetAssist$.do(x => console.log("out: appConfig", x)),
    settings: Observable.merge(assistActions$, resetAssist$).do(x => console.log("out: settings", x)),
    DOM: view$.do(x => console.log("out: DOM", x)),
    speech: speech$.do(x => console.log("out: speech", x)),
    //fullScreen: fullScreen$
  }
}

export default App

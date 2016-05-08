import {Observable} from 'rx'
import switchPath from 'switch-path'

import routes from './config/routes'
//import isolate    from '@cycle/isolate'

/*

function router(sources) {
  const sinks$ = sources.history.map(location => {
    const {path, value} = switchPath(location.pathname, routes)
    const screen = value
    console.log('r', path, value)
//    const Component = isolate(component);
    const sink=screen(sources)
    console.log('r2',sink)
    return sink
  })
  .shareReplay(1) // make sure sinks are hot
//debugger

  // For each item in sources we return the sink stream if it exists or O.empty()
  let sinks = {}
  const keys = Object.keys(sources)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (sources.hasOwnProperty(key)) {
      sinks[key] = sinks$.flatMapLatest(s => {
        console.log(s, i, key)
        if (s.hasOwnProperty(key)) {
            console.log('zzz', s[key])

          return s[key]
        }
        return Observable.empty()
      })
    }
  }
  return sinks
  return {
    activityLog: sinks$.flatMapLatest(s => s.activityLog),
    appConfig: sinks$.flatMapLatest(s => s.appConfig),
    DOM: sinks$.flatMapLatest(s => s.DOM),
    //history: sinks$.flatMapLatest(s => s.history),
    speech: sinks$.flatMapLatest(s => s.speech)
  }
}
*/

function router(sources) {
  const location = window.location
  const {path, value} = switchPath(location.pathname, routes)
  const screen = value
//    const Component = isolate(component);
  const sink = screen(sources)
  return sink
}

export default router

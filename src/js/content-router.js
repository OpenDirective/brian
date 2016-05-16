import switchPath from 'switch-path'
// import isolate    from '@cycle/isolate'

import App from './components/app'
import Auth from './components/auth'


/*
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
*/

function router(sources) {
  sources.history.share()

  const decoratedHistory$ = sources.history
    .map(location => {
      var id = 1
      const routes = {
        '/': App,
        '/album': App,
        '/album/:id': _id => {id = _id},
        '/auth': Auth,
        '*': null,
      }
      const {pathname, search, hash, state, action} = location
      const {path, value} = switchPath(pathname, routes)
      const newPathname = (value) ? path : '/'
      const screen = (value) ? value : App
      return ({pathname: newPathname, search, hash, state, action, screen, id}) // looks like a Location
    })
    .share()

  const newSources = {...sources, history: decoratedHistory$}

  const sinks$ = decoratedHistory$
    .scan(({screen: lastScreen}, {screen}) => {
      const changed = screen !== lastScreen
      return {screen, changed}
    }, {screen: null, changed: false})
    .filter(({changed}) => changed)
    .map(({screen}) => {
      //    const Component = isolate(component);
      console.info('New screen', screen)
      const sinks = screen(newSources)
      console.info('Screen done', sinks)
      return sinks
    })
    .shareReplay(1) // make sure sinks are hot


  return {
    DOM: sinks$.flatMapLatest(s => s.DOM),
    auth: sinks$.flatMapLatest(s => s.auth),
    history: sinks$.flatMapLatest(s => s.history),
    speech: sinks$.flatMapLatest(s => s.speech),
    appConfig: sinks$.flatMapLatest(s => s.appConfig),
    settings: sinks$.flatMapLatest(s => s.settings),
    activityLog: sinks$.flatMapLatest(s => s.activityLog),
  }
}
export default router

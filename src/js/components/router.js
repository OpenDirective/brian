import switchPath from 'switch-path'
// import isolate    from '@cycle/isolate'

import routes from '../config/routes'
import AlbumTree from './album-tree'
import SignIn from './signin'
import SignOut from './signout'
import Viewer from './viewer'

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
      const {pathname, search, hash, state, action} = location
      let {path: newPathname, value} = switchPath(pathname, routes)
      if (typeof value === 'string') {
        // redirect if value is a string
        const route = switchPath(value, routes)
        newPathname = route.path
        value = route.value
      }
      const {screen, params} = value
      console.info('router', `${newPathname}${search}${hash ? '#' : ''}${hash}`, screen.name, params)
      return ({pathname: newPathname, search, hash, state, action, screen, params}) // looks like a Location
    })
    .shareReplay(1)

  const newSources = {...sources, history: decoratedHistory$}

  const sinks$ = decoratedHistory$
    .scan(({screen: lastScreen}, {screen}) => {
      const changed = screen !== lastScreen
      return {screen, changed}
    }, {screen: null, changed: false})
    .filter(({changed}) => changed)
    .do(({screen}) => console.info('New screen', screen.name))
    .map(({screen}) => {
      //    const Component = isolate(component);
      const sinks = screen(newSources)
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

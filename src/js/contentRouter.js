import switchPath from 'switch-path'
import Rx from 'rx'
import App from './components/App.js'
import Auth from './components/Auth'
//import isolate    from '@cycle/isolate'
//import Page404    from '../../pages/page404/page404-index';

function ContentRouter(sources) {
  const sinks$ = sources.History.map(location => {
    const {path, value} = switchPath(location.pathname, {
      '/': App,
      '/auth': Auth,
//      '*': Page404,
    })
    const Component = value
//    const Component = isolate(component);
    return Component(sources)
  })

  return sinks$.flatMapLatest(s => s)
}

export default ContentRouter;

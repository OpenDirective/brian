import {Observable} from 'rx'
import render from './viewer-view'
require('../../css/normalize.css')
require('../../css/main.css')


function Viewer({DOM, history, appConfig, /* settings, */auth/* , speech, activityLog*/}) {
 // log inputs
  appConfig.do(x => console.info('in: appConfig`', x))
    .subscribe()
//  settings.do(x => console.info('in: settings', x))
//    .subscribe()
 // history.do(x => console.info('in: history', x))
 //   .subscribe()
 // auth.do(x => console.info('in: auth', x))
 //   .subscribe()

  const navBack$ = DOM.select('[data-action="back"]').events('click')
   .map({type: 'go', value: -1})

  const currentUser$ = auth
    .map(({username}) => username)
    .share()

  const touchSpeech$ = DOM.select('[data-action="speak"]').events('click')
    .map(({currentTarget}) => currentTarget.textContent)

  const screen$ = history
    .filter(({screen}) => screen === Viewer) // TOD stop this being needed
    .withLatestFrom(appConfig, currentUser$,
        ({params: {album, item}}, {albums}, currentUser) => {
          const {label, image} = albums[album - 1].cards[item]
          return {title: 'Image view', currentUser, label, image}
        })
    .share()

  const view$ = screen$
    .map(model => {
      console.info('model', model)
      return render(model)
    })

//  const anyClick$ = DOM.select('#root').events('click')
//  const fullScreen$ = anyClick$
//    .map({fullScreen: true})

  // nb order does matter her as main as cycle loops through
  return {
    auth: Observable.just({action: 'getCurrent'}),
    DOM: view$.do(x => console.info('out: DOM', x)),
    history: navBack$.do(x => console.info('out: history', x)),
    speech: touchSpeech$.do(x => console.info('out: speech', x)),
    settings: Observable.empty(),
    activityLog: Observable.empty(),
    appConfig: Observable.empty()
    // fullScreen: fullScreen$
  }
}

export default Viewer

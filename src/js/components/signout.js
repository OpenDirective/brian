import {Observable} from 'rx'
import renderSignOut from './signout-view'
require('../../css/normalize.css')
require('../../css/main.css')


function SignOut({DOM, history, settings, auth}) {
// log inputs
  settings.do(x => console.info('in: settings', x))
    .subscribe()
//  auth.do(x => console.info('in: auth', x))
//    .subscribe()
//  history.do(x => console.info('in: history', x))
//    .subscribe()

  const authFailure$ = auth
    .filter(({error}) => error !== undefined)
  const userChanged$ = auth
    .filter(({error, username}) => error === undefined && username !== undefined)

  const intentNavBack$ = DOM.select('[data-action="home"]').events('click')
  const navAlbums$ = intentNavBack$
    .map('/album')

  const navSignedOut$ = userChanged$
    .filter(({username}) => username === null)
    .map('/signin')

  const intentSignOut$ = DOM.select('[data-action="signOut"]').events('click')
  const signOut$ = intentSignOut$
    .map(() => ({action: 'signOut'}))

  const touchSpeech$ = DOM.select('[data-action="speak"]').events('click')
    .map(({currentTarget}) => currentTarget.textContent)

  const modelAuthAction$ = signOut$
    .map(() => ({message: 'Won\'t be long ....', username: null}))

  const modelAuthOutcome$ = Observable.merge(authFailure$, userChanged$)
    .map(({error, username}) => ({message: (error) ? error : '', username}))

  const view$ = Observable.merge(modelAuthAction$, modelAuthOutcome$)
    .map(model => {
      console.info('model', model)
      return renderSignOut(model)
    })

  const speech$ = touchSpeech$
  const auth$ = signOut$.startWith({action: 'getCurrent'})
  const nav$ = Observable.merge(navSignedOut$, navAlbums$)

  return {
    history: nav$.do(x => console.info('out: nav', x)),
    auth: auth$.do(x => console.info('out: auth', x)),
    DOM: view$.do(x => console.info('out: DOM', x)),
    speech: speech$.do(x => console.info('out: speech', x)),
    settings: Observable.empty(),
    activityLog: Observable.empty(),
    appConfig: Observable.empty()
  }
}

export default SignOut

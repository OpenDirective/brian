import {Observable} from 'rx'
import renderAuth from './auth-view'
require('../../css/normalize.css')
require('../../css/main.css')


function App({DOM, settings, auth: outcomeAuth}) {
// log inputs
  settings.do(x => console.info('in: settings', x))
    .subscribe()
  outcomeAuth.do(x => console.info('in: auth', x))
    .subscribe()

  const authFailure$ = outcomeAuth
    .filter(({error}) => error !== null)
  const authSignedOut$ = outcomeAuth
    .filter(({error, event}) => error === null && event === 'signedOut')
  const authSignedIn$ = outcomeAuth
    .filter(({error, event}) => error === null && event === 'signedIn')

  const signedOut$ = authSignedOut$.map(false)
    .merge(authSignedIn$.map(true))
    .scan((acc, cur) => acc === false && cur === true, true)
    .filter(x => x)

  const intentNavBack$ = DOM.select('[data-action="home"]').events('click')

  const navHome$ = signedOut$
    .merge(intentNavBack$)
    .map('/')

  const intentUsername$ = DOM.select('.username').events('blur')
  const username$ = intentUsername$
    .map(({currentTarget}) => currentTarget.value)

  const intentPassword$ = DOM.select('.password').events('blur')
  const password$ = intentPassword$
    .map(({currentTarget}) => currentTarget.value)

  const intentSignIn$ = DOM.select('[data-action="signIn"]').events('click')
  const signIn$ = intentSignIn$
    .withLatestFrom(username$, password$, (x, username, password) => {
      return {action: 'signIn', username, password}
    })

  const intentSignOut$ = DOM.select('[data-action="signOut"]').events('click')
  const signOut$ = intentSignOut$
    .map(() => ({action: 'signOut'}))

  const intentSignUp$ = DOM.select('[data-action="signUp"]').events('click')
  const signUp$ = intentSignUp$
    .withLatestFrom(username$, password$, (x, username, password) => {
      return {action: 'addUser', username, password}
    })

  const touchSpeech$ = DOM.select('[data-action="speak"]').events('click')
    .map(({currentTarget}) => currentTarget.textContent)

  const view$ = Observable.empty()
    .merge(authFailure$.map(({error}) => ({authMessage: error, currentUser: ''})))
    .merge(authSignedOut$.map(() => ({authMessage: '', currentUser: ''})))
    .merge(authSignedIn$.map(({username}) => ({authMessage: '', currentUser: username})))
    .map(model => {
      console.info('model', model)
      return renderAuth(model)
    })

  const speech$ = touchSpeech$
  const auth$ = Observable.merge(signIn$, signUp$, signOut$).startWith({action: 'getCurrent'})

  // nb order does matter her as main as cycle loops through
  return {
    history: navHome$.do(x => console.info('out: nav', x)),
    auth: auth$.do(x => console.info('out: auth', x)),
    DOM: view$.do(x => console.info('out: DOM', x)),
    speech: speech$.do(x => console.info('out: speech', x)),
    settings: Observable.empty(),
    activityLog: Observable.empty(),
    appConfig: Observable.empty()
  }
}

export default App

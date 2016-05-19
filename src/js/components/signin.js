import {Observable} from 'rx'
import renderSignIn from './signin-view'
require('../../css/normalize.css')
require('../../css/main.css')


function SignIn({DOM, history, settings, auth}) {
// log inputs
  settings.do(x => console.info('in: settings', x))
    .subscribe()
//  auth.do(x => console.info('in: auth', x))
//    .subscribe()
 // history.do(x => console.info('in: history', x))
 //   .subscribe()

  const authFailure$ = auth
    .filter(({error}) => error !== undefined)
  const userChanged$ = auth
    .filter(({error, username}) => error === undefined && username !== undefined)

  const navSignedIn$ = userChanged$
    .filter(({username}) => username !== null)
    .map('/album')

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

  const intentSignUp$ = DOM.select('[data-action="signUp"]').events('click')
  const signUp$ = intentSignUp$
    .withLatestFrom(username$, password$, (x, username, password) => {
      return {action: 'addUser', username, password}
    })

  const touchSpeech$ = DOM.select('[data-action="speak"]').events('click')
    .map(({currentTarget}) => currentTarget.textContent)

  const modelAuthAction$ = Observable.merge(signUp$, signIn$)
    .map(() => ({message: 'Please wait...', username: null}))

  const modelAuthOutcome$ = Observable.merge(authFailure$, userChanged$)
    .map(({error, username}) => ({message: (error) ? error : '', username}))

  const view$ = Observable.merge(modelAuthAction$, modelAuthOutcome$)
    .map(model => {
      console.info('model', model)
      return renderSignIn(model)
    })

  const speech$ = touchSpeech$
  const auth$ = Observable.merge(signIn$, signUp$).startWith({action: 'getCurrent'})
  const nav$ = Observable.merge(navSignedIn$)

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

export default SignIn
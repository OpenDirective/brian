import {Observable} from 'rx'
import renderAuth from './viewAuth'
require('../../css/normalize.css')
require('../../css/main.css')


function App({DOM, settings, auth: outcomeAuth}) {
// log inputs
  const x1 = settings.do(x => console.log("in: settings", x))
    .subscribe()

  const failAuthMessage$ = outcomeAuth
    .filter(({error}) => error !== null)
  const successAuthMessage$ = outcomeAuth
    .filter(({error}) => error === null)
  const navHome$ = successAuthMessage$
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

  const intentSignUp$ = DOM.select('[data-action="signUp"]').events('click')
  const signUp$ = intentSignUp$
    .withLatestFrom(username$, password$, (x, username, password) => {
      return {action: 'addUser', username, password}
    })

  const touchSpeech$ = DOM.select('[data-action="speak"]').events('click')
    .map(({currentTarget}) => currentTarget.textContent)

//  const activity$ = screen$
//    .map(({name}, {edit}) => ({user: 'Jo', album: name, access: edit ? 'change' : 'view'}))

  const view$ = Observable.just({authMessage: 'Enter your details to sign in or sign up as a new user'})
    .merge(failAuthMessage$.map(({error}) => ({authMessage: error})))
    .map(model => {
      console.log('model', model)
      return renderAuth(model)
    })

  const speech$ = touchSpeech$
  const auth$ = Observable.merge(signIn$, signUp$)

  // nb order does matter her as main as cycle loops through
  return {
    history: navHome$.do(x => console.log('out: nav', x)),
    auth: auth$.do(x => console.log('out: auth', x)),
//    activityLog: activity$.do(x => console.log("out: activityLog", x)),
    DOM: view$.do(x => console.log('out: DOM', x)),
    speech: speech$.do(x => console.log('out: speech', x)),
  }
}

export default App

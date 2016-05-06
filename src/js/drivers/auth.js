import {ReplaySubject} from 'rx'
import makeAWSCognitoAuthImpl from './authAWSCognitoUserPool'


/*

# source$ = historyDriver(sink$)
sink actions
return { auth: Observable.just({action: "addUser", user: "", password: ""})}
return { auth: Observable.just({action: "signIn", user: "", password: ""})}
return { auth: Observable.just({action: "signOut"})}

source events
{event: "added", user: "" }
{event: "signedIn", user: "" }
{event: "signedOut", }
*/

/* duck typing for the auth interface
function addUser(username, password) {
  return {user, error}
}

function signInUser(username, password) {
  return {user, error}
}

function signOutUser() {
  return {user, error}
}
*/

function makeDoAuthAction(authImpl) {
  return function doAuthAction(action, user, password) {
    console.log(authImpl, authImpl[action])
    return authImpl[action](user, password)
  }
}

function makeAuthDriver(/* options */) {

  const authImpl = makeAWSCognitoAuthImpl()
  const doAuthAction = makeDoAuthAction(authImpl)

  return function authDriver(sink$) {
    const auth$ = new ReplaySubject(1)

    /*
    const _dispose = history$.dispose
    history$.dispose = () => {
      // signOut if possible - might be too late
      _dispose.apply(history$)
    }
    */

    sink$.subscribe(({action, username, password}) => {
      console.log('auth',action, username, password)
      const {error, username2} = doAuthAction(action, username, password)
      if (!error && action === 'addUser') {
        auth$.onNext({event: 'added', username})
      } else if (!error && action === 'signIn') {
        auth$.onNext({event: 'signedIn', username})
      } else if (!error && action === 'signedOut') {
        auth$.onNext({event: 'signedout', username2})
      } else {
        alert(`Auth failed: ${error}`)
      }
    })

    return auth$
  }
}

export default makeAuthDriver

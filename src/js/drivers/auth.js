import {ReplaySubject} from 'rx'
import makeAWSCognitoAuthImpl from './providers/AWS/authAWSCognitoUserPool'

/*
# source$ = historyDriver(sink$)
sink authActions
return { auth: Observable.just({action: "addUser", user: "", password: ""})}
return { auth: Observable.just({action: "signIn", user: "", password: ""})}
return { auth: Observable.just({action: "signOut"})}

# source events
{event: "addedUser", user: "user`" }
{event: "signedIn", user: "user" }
{event: "signedOut", user: "user"}s
*/

function makeDoAuthAction(authImpl) {
  return function doAuthAction(authAction, callback) {
    authImpl(authAction, callback)
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

    sink$.subscribe(authAction => {
      doAuthAction(authAction, (error, username) => {
        console.log('cb', error, username)
        const {action} = authAction
        if (!error && action === 'addUser') {
          auth$.onNext({event: 'addedUser', username})
        } else if (!error && action === 'signIn') {
          auth$.onNext({event: 'signedIn', username})
        } else if (!error && action === 'signedOut') {
          auth$.onNext({event: 'signedout', username})
        } else {

        }
      })
    })

    return auth$
  }
}

export default makeAuthDriver

import {ReplaySubject} from 'rx'
import makeAWSCognitoAuthImpl from './providers/aws/auth-aws-cognito-user-pool'

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
        const {action} = authAction
        const event = action === 'adduser' ? 'addedUser' :
                      action === 'signIn' ? 'signedIn' :
                      action === 'getCurrent' ? 'signedIn' :
                      'signedOut'
        if (!error) {
          auth$.onNext({event, error: null, username})
        } else {
          auth$.onNext({event, error, username: ''})
        }
      })
    })

    return auth$
  }
}

export default makeAuthDriver

import {ReplaySubject} from 'rx'
import makeAWSCognitoAuthImpl from './providers/aws/auth-aws-cognito-user-pool'

/*
# source$ = historyDriver(sink$)
sink authActions
return { auth: Observable.just({action: 'addUser', user: '', password: ''})}
  => {event: 'userAdded', user: 'user' }
  => {error: 'xxxx'}
return { auth: Observable.just({action: 'signIn', user: '', password: ''})}
  => {event: 'userChanged', user: 'user' }
  => {error: 'xxxx'}
return { auth: Observable.just({action: 'signOut'})}
  => {event: 'userChanged', user: '' }
return { auth: Observable.just({action: 'getCurrent'})}
  => {event: 'userChanged', user: 'user' }
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

    sink$.subscribe(authAction => {
      doAuthAction(authAction, (error, username) => {
        const {action} = authAction
        const event = action === 'adduser' ? 'addedUser' :
                      action === 'signIn' ? 'userChanged' :
                      action === 'signOut' ? 'userChanged' :
                      action === 'getCurrent' ? 'userChanged' :
                      'userChanged'
        if (!error) {
          auth$.onNext({event, username})
        } else {
          auth$.onNext({error, username})
        }
      })
    })


    return auth$
  }
}

export default makeAuthDriver

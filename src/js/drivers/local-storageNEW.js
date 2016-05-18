import {Observable} from 'rx'
import AWSCognitoSyncImpl from './providers/aws/sync-aws-cognito'


// We get events whenever another storage object changes the storage
// That ends up being another tab.
// Unfortunately we don't get the event ourselves which stops us using event driven model
const storage$ = Observable.fromEvent(window, 'storage')


function makeLocalStorageDriver(key, initialValue) {
  function _reset() {
    console.log('reset')
    AWSCognitoSyncImpl.set(key, JSON.stringify(initialValue))
  }

  AWSCognitoSyncImpl.get(key, value => {
  console.debug('2', err, value)
    if (undefined === value) {
      _reset()
    }
  }) // will we get an extra event here?

/*
  const keyStorage$ = storage$
    .filter(e => e.key === key)
    .map(e => JSON.parse(e.newValue) || {})
    .share()
    .startWith(JSON.parse(localStorage.getItem(key)) || {})
*/
  const keyStorage$ = Observable.empty()

  // a way to get at the current value - effectively a way to poll
  keyStorage$.current = () => {
    const getter = Observable.fromCallback(AWSCognitoSyncImpl.get, value => (undefined === value) ? {} : JSON.parse(value))
    return getter(key)
  }

  return function localStorageDriver(payload$) {
    payload$.subscribe(payload => {
      if (payload === 'Reset') {
        _reset()
      } else {
        AWSCognitoSyncImpl.set(key, JSON.stringify(payload))
      }
    })

    return keyStorage$
  }
}

export default makeLocalStorageDriver



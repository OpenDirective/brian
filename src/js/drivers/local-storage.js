import {Observable, Subject} from 'rx'
import AWSCognitoSyncImpl from './providers/aws/sync-aws-cognito'

function makeLocalStorageDriver(key, initialValue) {
  function _reset() {
    AWSCognitoSyncImpl.set(key, JSON.stringify(initialValue))
    return initialValue
  }

  const keyStorage$ = new Subject()
  // TODO dispose should call sync

/*  // a way to get at the current value - effectively a way to poll
  keyStorage$.current = () => {
    const getter = Observable.fromCallback(AWSCognitoSyncImpl.get, value => {console.log('fff'); return (undefined === value) ? {} : JSON.parse(value)})
    return getter(key)
  }
*/

  return function localStorageDriver(payload$) {
    payload$.subscribe(payload => {
      if (payload === 'Reset') {
        _reset()
      } else if (payload === 'Sync') {

      } else if (payload === 'Get') {
        AWSCognitoSyncImpl.get(key, value => {
          const payload = (undefined === value) ? _reset() : JSON.parse(value)
          keyStorage$.onNext(payload)
        })
      } else {
        AWSCognitoSyncImpl.set(key, JSON.stringify(payload))
      }
    })

    return keyStorage$
  }
}

export default makeLocalStorageDriver



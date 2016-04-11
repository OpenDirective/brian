import {Observable} from 'rx'

function makeLocalStorageDriver(key, initialValue) {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(initialValue))
  }

  return function localStorageDriver(payload$) {
    payload$.subscribe(payload => {
      localStorage.setItem(key, JSON.stringify(payload))
    })

    return Observable.just(JSON.parse(localStorage.getItem(key)) || {})
  }
}

export default makeLocalStorageDriver

import {Observable} from 'rx'

/* TODO check
function _storageAvailable(type) {
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
}
*/

const storage$ = Observable.fromEvent(window, 'storage')

function makeLocalStorageDriver(key, initialValue) {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(initialValue))
  } // will we get an extra event here?

  const keyStorage$ = storage$
    .filter(e => e.key === key)
    .map(e => JSON.parse(e.newValue) || {})
    .share()
    .startWith(JSON.parse(localStorage.getItem(key)) || {})

  return function localStorageDriver(payload$) {
    payload$.subscribe(payload => {
      localStorage.setItem(key, JSON.stringify(payload))
    })

    return keyStorage$
  }
}

export default makeLocalStorageDriver

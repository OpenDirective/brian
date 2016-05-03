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

// We get events whenever another storage object changes the storage
// That ends up being another tab.
// Unfortunately we don't get the event ourselves which stops us using event driven model
const storage$ = Observable.fromEvent(window, 'storage')

function makeLocalStorageDriver(key, initialValue) {
  function _reset() {
    localStorage.setItem(key, JSON.stringify(initialValue))
  }

  if (!localStorage.getItem(key)) {
    _reset()
  } // will we get an extra event here?

  const keyStorage$ = storage$
    .filter(e => e.key === key)
    .map(e => JSON.parse(e.newValue) || {})
    .share()
    .startWith(JSON.parse(localStorage.getItem(key)) || {})

  return function localStorageDriver(payload$) {
    payload$.subscribe(payload => {
      if (payload === "Reset") {
        _reset()
      } else {
        localStorage.setItem(key, JSON.stringify(payload))
      }
    })

    return keyStorage$
  }
}

export default makeLocalStorageDriver

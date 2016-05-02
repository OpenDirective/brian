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

function timestamp() {
  const ds = new Date()
               .toISOString()
               .replace('T', ' ')
               .slice(0, -5)
  return ds
}
const key = 'activityLog'

var _injectReset = null
const reset$ = Observable.create(
  obs => {
    _injectReset = () => obs.onNext({key, newValue: ''})
  }
)
reset$.subscribe()

// Note that the window/document causing the changes does NOT get this event - other tabs do
const storage$ = Observable.fromEvent(window, 'storage')
  .merge(reset$)

// very hacky non scalable temp version
function activityLogDriver(payload$) {
  const keyValue$ = storage$
    .filter(e => e.key === key)
    .map(e => e.newValue || '')
    .share()
    .startWith(localStorage.getItem(key) || '')

  function _reset() {
    localStorage.setItem(key, '')
    _injectReset()
  }

  if (!localStorage.getItem(key)) {
    _reset()
  }

  payload$.subscribe(payload => {
    if (payload === "Reset") {
      _reset()
    } else {
      const {user, album, access} = payload
      const log = localStorage.getItem(key) || ''
      const log2 = `${timestamp()}: ${user}, ${album}, ${access}\r\n${log}`
      localStorage.setItem(key, log2)
    }
  })

  return keyValue$
}

export default activityLogDriver

import {Observable} from 'rx'
import moment from 'moment'

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
  return moment().format('YYYY-MMM-DD hh:mm:ss')
}
const key = 'activityLog'

function _reset() {
  localStorage.setItem(key, '')
}

const storage$ = Observable.fromEvent(window, 'storage')

// very hacky non scalable temp version
function activityLogDriver(payload$) {
  if (!localStorage.getItem(key)) {
    _reset()
  } // will we get an extra event here?

  const keyStorage$ = storage$
    .filter(e => e.key === key)
    .map(e => e.newValue || '')
    .share()
    .startWith(localStorage.getItem(key) || '')

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

  return keyStorage$
}

export default activityLogDriver

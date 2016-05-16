import {run} from '@cycle/core'
import sources from './drivers/sources.js'
import addGlobalErrorHandler from './utilities/global-error'

import runHot from './utilities/run-hot'
import Top from './components/top'
import App from './components/app'

const PRODUCTION = (process.env.NODE_ENV === 'production')

// note while this is usefull it breaks the source mapping in console error messages
if (!PRODUCTION) {
//  addGlobalErrorHandler()
}

if (false && !PRODUCTION && module.hot && false) {   // hot loading enabled in config
  console.log('Hot reloading enabled')
  runHot('./components/App', Top, sources)
} else {
  console.debug('Load')
  run(Top, sources)
}

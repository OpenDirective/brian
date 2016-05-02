import {run} from '@cycle/core'
import drivers from './drivers/drivers.js'
import addGlobalErrorHandler from './utilities/globalError'

import runHot from './utilities/runHot'
import AssistApp from './components/AssistApp'

const PRODUCTION = (process.env.NODE_ENV === 'production')

// note while this is usefull it breaks the source mapping in console error messages
if (!PRODUCTION) {
//  addGlobalErrorHandler()
}

if (!PRODUCTION && module.hot && false) {   // hot loading enabled in config
  console.log('Hot reloading enabled')
  runHot('./components/App', AssistApp, drivers)
} else {
  run(AssistApp, drivers)
}

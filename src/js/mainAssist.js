import {run} from '@cycle/core'
import drivers from './drivers/drivers.js'
import addGlobalErrorHandler from './utilities/globalError'

import runHot from './utilities/runHot'
import AssistApp from './components/AssistApp'

/*
require("script!./vendor/jsbn.js")
require("script!./vendor/jsbn2.js")
require("script!./vendor/sjcl.js")
require("script!./vendor/moment.min.js")
require("script!./vendor/aws-cognito-sdk.min.js")
require("script!./vendor/amazon-cognito-identity.min.js")
//require("script!../aws-sdk-2.3.5.js")
*/

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

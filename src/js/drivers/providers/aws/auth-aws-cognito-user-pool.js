// Cognoto user identity pools
// Non federated auth with login/out in app

// Couldn't get webpack script-loader to work so all deps are loaded as scripts in main html

import AWSCONFIG from '../../../config/aws-config'

/* global AWS, AWSCognito */

function _getUserPool({IdentityPoolId, UserPoolRegion, UserPoolId, ClientId}) {
  /* eslint-disable immutable/no-mutation */
  // TODO this a global object so should only need to be set once
  AWS.config.logger = console
  // AWS.config.sslEnabled = true
  AWS.config.region = UserPoolRegion
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId})

  AWSCognito.config.region = UserPoolRegion
  AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId})
  AWSCognito.config.update({accessKeyId: 'anything', secretAccessKey: 'anything'})
  /* eslint-enable immutable/no-mutation */

  const poolData = {
    UserPoolId,
    ClientId
  }

  try {
    return new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData)
  } catch (err) {
    console.error('_getUswrPool', err.message)
    return null
  }
}

function _addUser(username, password, callback) {
  const userPool = _getUserPool(AWSCONFIG)
  if (!userPool) {
    callback(`Unable to find your user details.`, null)
    return
  }

  userPool.signUp(username, password, null, null, (err, result) => {
    if (err) {
      console.error('AWS add user fail', err.message)
      const msg = err.message.indexOf('password') !== -1 ? 'Please check username and password are 6 or more characters long.' :
            'Did you already sign up?'
      callback(`Unable to add you as user\r\n ${msg}`, null)
      return
    }
    callback(null, username)
  })
}

function _getCurrent(x, xx, callback) {
  const userPool = _getUserPool(AWSCONFIG)
  if (!userPool) {
    callback(`Unable to find your user details.`, null)
    return null
  }

  const cognitoUser = userPool.getCurrentUser()
  if (cognitoUser === null) {
    callback(null, null)
    return
  }
  cognitoUser.getSession((err, session) => {
    if (err) {
      console.error(err.message)
      callback(`Unable to find your user details.`, null)
      return
    }
    console.info(`session validity: ${session.isValid()}`)
    const username = session.isValid() ? cognitoUser.getUsername() : null
    callback(null, username)
  })
}

function _signIn(username, password, callback) {
  const userPool = _getUserPool(AWSCONFIG)
  if (!userPool) {
    callback(`Something happend so we could not find your user details\r\nPlease try again`, null)
    return
  }

  _getCurrent(null, null, (err, usernameCurrent) => {
    let cognitoUser
    if (!err && usernameCurrent) {
      cognitoUser = userPool.getCurrentUser() // assume OK
      cognitoUser.signOut()
      callback(null, null)
    } else {
      const userData = {
        Username: username,
        Pool: userPool
      }
      console.debug(userData)
      cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData)
    }
    const authenticationData = {
      Username: username,
      Password: password
    }
    const authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData)
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: () => {
        cognitoUser.getSession((err, result) => {
          if (!err && result) {
            // Add the User's Id Token to the Cognito credentials login map.
            var credentials = {
              IdentityPoolId: AWSCONFIG.IdentityPoolId,
              Logins: {}
            }
            /* eslint-disable immutable/no-mutation */
            credentials.Logins[AWSCONFIG.loginCredentials] = result.getIdToken().getJwtToken()
            AWS.config.credentials = new AWS.CognitoIdentityCredentials(credentials)
            /* eslint-enable immutable/no-mutation */

            callback(null, cognitoUser.getUsername())
          }
        })
      },

      onFailure: err => {
        console.error('AWS sign in fail', err.message)
        callback('Unable to sign you in\r\nDid you sign up?\r\nPlease check the username and password you entered.', null)
      }
    })
  })
}

function _signOut(usernameNU, passwordNU, callback) {
  const userPool = _getUserPool(AWSCONFIG)
  if (!userPool) {
    callback(`Something happend so we could not find your user details\r\nPlease try again`, null)
    return
  }

  _getCurrent(null, null, () => {
    const cognitoUser = userPool.getCurrentUser()
    if (cognitoUser) {
      cognitoUser.signOut()
    }

    callback(null, null)
  })
}

const _handlers = {_addUser, _getCurrent, _signIn, _signOut}

function dispatchAuthAction({action, username, password}, callback) {
  try {
    _handlers[`_${action}`](username, password, callback)
  } catch (err) {
    throw new Error(`AWSCognitoAuthImp: unknown action - ${err}`)
  }
}
export default function makeAWSCognitoAuthImpl() {
  return dispatchAuthAction
}

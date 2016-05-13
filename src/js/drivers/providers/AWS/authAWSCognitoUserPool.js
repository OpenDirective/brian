// Cognoto user identity pools
// Non federated auth with login/out in app

// Couldn't get webpack script-loader to work so all deps are loaded as scripts in main html

import AWSCONFIG from '../../../config/aws-config'

function _getUserPool({IdentityPoolId, UserPoolRegion, UserPoolId, ClientId}) {
/* global AWS, AWSCognito */
/* eslint-disable immutable/no-mutation */
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

function _getCurrentUser({UserPoolId, ClientId}) {
  const data = {
    UserPoolId,
    ClientId
  }
  const userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data)
  const cognitoUser = userPool.getCurrentUser()
  return cognitoUser
}

function _signIn(username, password, callback) {
  if (_getCurrentUser(AWSCONFIG)) {
    callback('Somebody is already logged in', null)
    return
  }

  const userPool = _getUserPool(AWSCONFIG)
  if (!userPool) {
    callback(`Something happend so we could not find your user details\r\nPlease try again`, null)
    return
  }

  const userData = {
    Username: username,
    Pool: userPool
  }
  const cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData)

  const authenticationData = {
    Username: username,
    Password: password
  }
  const authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData)
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: result => {
      callback(null, cognitoUser.getUsername())
    },

    onFailure: err => {
      console.error('AWS sign in fail', err.message)
      callback('Unable to sign you in\r\nDid you sign up?\r\nPlease check the username and password you entered.', null)
    }
  })
}

function _signOut(usernameNU, passwordNU, callback) {
  const currentUser = _getCurrentUser(AWSCONFIG)
  if (!currentUser) {
    callback('No one is logged in', null)
    return
  }

  currentUser.signOut()

  callback(null, null)
}

const _handlers = {_addUser, _signIn, _signOut}

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

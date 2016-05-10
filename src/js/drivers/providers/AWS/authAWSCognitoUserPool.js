// Cognoto user identity pools
// Non federated auth with login/out in app

// Couldn't get webpack script-loader to work so all deps are loaded as scripts in assist.html
import AWSCONFIG from '../../../config/aws-config'

function _getUserPool({identityPoolId, userPoolRegion, userPoolId, clientId}) {
/* global AWS, AWSCognito */
/* eslint-disable immutable/no-mutation */
  AWS.config.region = userPoolRegion
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({identityPoolId})
  // need these dummy credentials  - though enabling unauthorised access also works
  AWSCognito.config.update({accessKeyId: 'anything', secretAccessKey: 'anything'})
  /* eslint-enable immutable/no-mutation */

  const poolData = {
    userPoolId,
    clientId
  }

  try {
    return new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData)
  } catch (err) {
    return null
  }
}

function _addUser(username, password, callback) {
  const userPool = _getUserPool(AWSCONFIG)
  if (!userPool) {
    callback(`Unable to find user details.`, null)
    return
  }

  userPool.signUp(username, password, null, null, (err, result) => {
    if (err) {
      console.log('AWS add user fail', err.message)
      const msg = err.message.indexOf('password') !== -1 ? 'Check username and password are both least 6 long.' :
            ' User may already exist.'
      callback(`Unable to add user. ${msg}`, null)
      return
    }
    callback(null, username)
  })
}

var _cognitoUser = null

function _signIn(username, password, callback) {
  if (_cognitoUser) {
    callback('Somebody is already logged in', null)
  }

  const authenticationData = {
    Username: username,
    Password: password
  }
  const authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData)

  const userPool = _getUserPool(AWSCONFIG)
  if (!userPool){
    callback(`Unable to find user details.`, null)
    return
  }

  const userData = {
    Username: username,
    Pool: userPool
  }
  const cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData)

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: result => {
      _cognitoUser = cognitoUser
      callback(null, cognitoUser.getUsername())
    },

    onFailure: err => {
      console.log('AWS sign in fail', err.message)
      callback('Unable to sign in user. Check username and password.', null)
    }
  })
}

function _signOut(usernameNU, passwordNU, callback) {
  if (!_cognitoUser) {
    callback('No one is logged in', null)
    return
  }

  const username = _cognitoUser.getUsername()
  _cognitoUser.signOut()
  _cognitoUser = null

  callback(null, username)
}

const _handlers = {_addUser, _signIn, _signOut}

function dispatchAuthAction({action, username, password}, callback) {
  try {
    _handlers[`_${action}`](username, password, callback)
  } catch (err) {
    throw new Error(`AWS Congnito User Pool Auth: unknown action - ${err}`)
  }
}
export default function makeAWSCognitoAuthImpl() {
  return dispatchAuthAction
}

// Cognoto user identity pools
// Non federated auth with login/out in app

// Couldn't get webpack script-loader to work so all deps are loaded as scripts in assist.html

const POOLSPEC = {
  region: 'us-east-1',
  IdentityPoolId: 'eu-west-1:23f3754f-d6d3-47da-af70-5eb83441d510',
  UserPoolId: 'us-east-1_A2HeABQfl',
  ClientId: '7m5nr6pgpe7en26q55jnic16t6'
}

function _getPool({region, IdentityPoolId, UserPoolId, ClientId}) {
/* global AWS, AWSCognito */
/* eslint-disable immutable/no-mutation */
  AWS.config.region = region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId})

  AWSCognito.config.region = region
  AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId})
  /* eslint-enable immutable/no-mutation */

  // need these dummy credentials  - though enabling unauthorised access also works
  AWSCognito.config.update({accessKeyId: 'anything', secretAccessKey: 'anything'})

  const poolData = {
    UserPoolId,
    ClientId
  }
  return new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData)
}

function _addUser(username, password, callback) {
  console.log (username, password)

  const userPool = _getPool(POOLSPEC)
  userPool.signUp(username, password, null, null, (err, result) => {
    if (err) {
      callback(err.message, null)
      return
    }
    callback(null, username)
  })
}

// a single user can be logged in at any time
let _cognitoUser = null

function _signIn(username, password, callback) {
  console.log (username, password)

  if (_cognitoUser) {
    callback('Someone already logged in', null)
  }

  const authenticationData = {
    Username: username,
    Password: password
  }
  const authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData)

  const userPool = _getPool(POOLSPEC)

  const userData = {
    Username: username,
    Pool: userPool
  }
  const cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData)

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: result => {
      console.log(result)
      _cognitoUser = result.user
      callback(null, 'access token + ' + result.getAccessToken().getJwtToken())
    },
    onFailure: err => callback(err.message, null)
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
  console.log(action, `_${action}`)
  try {
    _handlers[`_${action}`](username, password, callback)
  } catch (err) {
    throw new Error('AWS Congnito User Pool Auth: unknown action - ' + err)
  }
}
export default function makeAWSCognitoAuthImpl() {
  return dispatchAuthAction
}

// Cognoto user identity pools
// Non federated auth with login/out in app

// Couldn't get webpack script-loader to work so all deps are loaded as scripts in assist.html


const POOLSPEC = {
  region: 'us-east-1',
  IdentityPoolId: 'eu-west-1:8b39d075-53d9-4055-a570-349583db65b5',
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

let _cognitoUser = null

function addUser(username, password) {
  const userPool = _getPool(POOLSPEC)
  userPool.signUp(username, password, null, null, (err, result) => {
    if (err) {
      return {user: null, error: err}
    }
    _cognitoUser = result.user
    return {user: _cognitoUser.getUsername(), error: null}
  })
}

function signIn(username, password) {
  const userPool = _getPool(POOLSPEC)
  userPool.signUp(username, password, null, null, function(err, result) {
    if (err) {
      return {user: null, error: err}
    }
    _cognitoUser = result.user
    return {user: _cognitoUser.getUsername(), error: null}
  })
}

function signOut() {
  let username = null
  if (_cognitoUser) {
    username = _cognitoUser.getUsername()
    _cognitoUser.signOut()
    _cognitoUser = null
  }
  return {user: username, error: null}
}

export default function makeAWSCognitoAuthImpl() {
  return {addUser, signIn, signOut}
}

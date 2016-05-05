// Cognoto user identity pools
// Non federated auth with login/out in app

/*
// Couldn't get webpack script-loader to work so all deps are loaded as scripts in asssit.html
require("script!./vendor/jsbn.js")
require("script!./vendor/jsbn2.js")
require("script!./vendor/sjcl.js")
require("script!./vendor/moment.min.js")
require("script!./vendor/aws-cognito-sdk.min.js")
require("script!./vendor/amazon-cognito-identity.min.js")
//require("script!../aws-sdk-2.3.5.min.js")
*/

/* global AWS, AWSCognito */
/* eslint-disable immutable/no-mutation */

const REGION = 'us-east-1'
const IDENTITYPOOLID = 'us-east-1:78992aa9-f2cf-4a9b-a673-c018bcaac300'
const POOLID = 'us-east-1_A2HeABQfl'
const CLIENTID = '7m5nr6pgpe7en26q55jnic16t6'

function addUser() {
  AWS.config.region = REGION // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IDENTITYPOOLID // your identity pool id here
  })

  AWSCognito.config.region = REGION
  AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IDENTITYPOOLID // your identity pool id here
  })
/* eslint-enable immutable/no-mutation */

  // need these dummy credentials  - though enabling unauthorised access also works
  AWSCognito.config.update({accessKeyId: 'dummy', secretAccessKey: 'dummy'})

  const poolData = {
    UserPoolId: POOLID,
    ClientId: CLIENTID
  }
  const userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData)

  const dataName = {
    Name: 'given_name',
    Value: 'Fred'
  }
  const attributeName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataName)

  const attributeList = [attributeName]

  userPool.signUp('username', 'password', null, null, (err, result) => {
    if (err) {
      alert(err)
      return
    }
    const cognitoUser = result.user
    console.log('user name is ' + cognitoUser.getUsername())
  })
}

export default addUser

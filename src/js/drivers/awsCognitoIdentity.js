// Cognoto user identity pools
// Non federated auth with login/out in app

/*
// this is failing to work so are loaded as global scripts in asssit.html
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

function addUser () {
  AWS.config.region = 'us-east-1' // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:9127624e-b818-45ed-99da-b1a2016dd8a3' // your identity pool id here
  })

  AWSCognito.config.region = 'us-east-1'
  AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:9127624e-b818-45ed-99da-b1a2016dd8a3' // your identity pool id here
  })
/* eslint-enable immutable/no-mutation */

  const poolData = {
    UserPoolId: 'us-east-1_4suI6ClSV',
    ClientId: '3mn5hcp6edn2li2hgksl44nst2'
  }
  const userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData)

  const dataName = {
    Name: 'given_name',
    Value: 'Fred'
  }
  const attributeName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataName)

  const attributeList = [attributeName]

  userPool.signUp('username', 'password', attributeList, null, (err, result) => {
    if (err) {
      alert(err)
      return
    }
    const cognitoUser = result.user
    console.log('user name is ' + cognitoUser.getUsername())
  })
}

export default addUser

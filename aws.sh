# TODO
# check region - default should be eu

# lose quotes in command outputs
export JP_UNQUOTED=true

export IDENTITY_POOL_NAME="BrianDARTTrial_Stage2"
export USER_POOL_ID="us-east-1_A2HeABQfl"
export APP_CLIENT_ID="7m5nr6pgpe7en26q55jnic16t6"

IDENTITY_POOL_ID=`AWS cognito-identity create-identity-pool \
--identity-pool-name $IDENTITY_POOL_NAME \
--no-allow-unauthenticated-identities \
--cognito-identity-providers ProviderName=cognito-idp.us-east-1.amazonaws.com/$USER_POOL_ID,ClientId=$APP_CLIENT_ID \
--query IdentityPoolId \
`
IDENTITY_POOL_ID="${IDENTITY_POOL_ID%\"}";IDENTITY_POOL_ID="${IDENTITY_POOL_ID#\"}"
echo "IDENTITY_POOL_ID: $IDENTITY_POOL_ID"

POOL_AUTH_ROLE="arn:aws:iam::063024541135:role/Cognito_BrianDARTTrial_StageAuth_Role"
POOL_UNAUTH_ROLE="arn:aws:iam::063024541135:role/Cognito_BrianDARTTrial_StageUnauth_Role"

AWS cognito-identity set-identity-pool-roles \
--identity-pool-id $IDENTITY_POOL_ID \
--roles authenticated=$POOL_AUTH_ROLE,unauthenticated=$POOL_UNAUTH_ROLE



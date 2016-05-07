# Create the Identity Pool - linked to our User Pool

# TODO
# Check region is correct or always specify it - default should be eu
# Create User Pool and IAM roles. Or wait for serverless to support User Pools :)
# Delete and recreat needed for initial dev and stage workflow

export IDENTITY_POOL_NAME="BrianDARTTrial_Stage2"
export USER_POOL_ID="us-east-1_A2HeABQfl"
export USER_POOL_PREFIX="cognito-idp.us-east-1.amazonaws.com/"
export APP_CLIENT_ID="7m5nr6pgpe7en26q55jnic16t6"

IDENTITY_POOL_ID=`AWS cognito-identity create-identity-pool \
--identity-pool-name $IDENTITY_POOL_NAME \
--no-allow-unauthenticated-identities \
--cognito-identity-providers ProviderName=$USER_POOL_PREFIX$USER_POOL_ID,ClientId=$APP_CLIENT_ID \
--query IdentityPoolId \
--output text
`

echo "Identity Pool Id: $IDENTITY_POOL_ID"

POOL_AUTH_ROLE="arn:aws:iam::063024541135:role/Cognito_BrianDARTTrial_StageAuth_Role"
POOL_UNAUTH_ROLE="arn:aws:iam::063024541135:role/Cognito_BrianDARTTrial_StageUnauth_Role"

AWS cognito-identity set-identity-pool-roles \
--identity-pool-id $IDENTITY_POOL_ID \
--roles authenticated=$POOL_AUTH_ROLE,unauthenticated=$POOL_UNAUTH_ROLE



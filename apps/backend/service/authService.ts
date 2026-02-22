type CognitoClient = {
  signUp: (params: unknown) => { promise: () => Promise<unknown> };
  confirmSignUp: (params: unknown) => { promise: () => Promise<unknown> };
  initiateAuth: (params: unknown) => { promise: () => Promise<unknown> };
};

let cognito: CognitoClient | null = null;

const getCognitoClient = (): CognitoClient => {
  if (cognito) {
    return cognito;
  }

  let awsSdk: any;
  try {
    // Lazy load so backend can start even when aws-sdk is unavailable locally.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    awsSdk = require("aws-sdk");
  } catch {
    throw new Error("Cognito is unavailable: missing dependency 'aws-sdk'.");
  }

  cognito = new awsSdk.CognitoIdentityServiceProvider({
    region: process.env.AWS_REGION,
  });
  return cognito;
};

const userPoolId = process.env.COGNITO_USER_POOL_ID!;
const clientId = process.env.COGNITO_CLIENT_ID!;

export const registerUser = async (email: string, password: string) => {
  const cognitoClient = getCognitoClient();
  const params = {
    ClientId: clientId,
    Username: email,
    Password: password,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
    ],
  };

  return cognitoClient.signUp(params).promise();
};

export const confirmUser = async (username: string, code: string) => {
  const cognitoClient = getCognitoClient();
  const params = {
    ClientId: clientId,
    Username: username,
    ConfirmationCode: code,
  };

  return cognitoClient.confirmSignUp(params).promise();
};

export const authenticateUser = async (email: string, password: string) => {
  const cognitoClient = getCognitoClient();
  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: clientId,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  return cognitoClient.initiateAuth(params).promise();
};

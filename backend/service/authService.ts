import AWS from 'aws-sdk';

const cognito = new AWS.CognitoIdentityServiceProvider({
    region: process.env.AWS_REGION,
});

const userPoolId = process.env.COGNITO_USER_POOL_ID!;
const clientId = process.env.COGNITO_CLIENT_ID!;

export const registerUser = async (email: string, password: string) => {
    const params = {
        ClientId: clientId,
        Username: email,
        Password: password,
        UserAttributes: [
            {
                Name: 'email',
                Value: email,
            },
        ],
    };

    return cognito.signUp(params).promise();
};

export const confirmUser = async (username: string, code: string) => {
    const params = {
        ClientId: clientId,
        Username: username,
        ConfirmationCode: code,
    };

    return cognito.confirmSignUp(params).promise();
};

export const authenticateUser = async (email: string, password: string) => {
    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
        },
    };

    return cognito.initiateAuth(params).promise();
};


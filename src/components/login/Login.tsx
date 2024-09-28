import React from "react";
import { Button, Input } from "@material-tailwind/react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
// import FacebookLogin from 'react-facebook-login';

const Login: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGoogleSuccess = (credentialResponse: any) => {
    console.log("Google login success:", credentialResponse);
    // Handle the credential response (e.g., send it to your backend)
  };

  const handleGoogleError = () => {
    console.error("Google login failed");
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFacebookResponse = (response: any) => {
    if (response.accessToken) {
      console.log("Facebook login success:", response);
      // Handle the Facebook login response (e.g., send it to your backend)
    } else {
      console.error("Facebook login failed");
    }
  };

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
        <form className="space-y-4 mb-4">
          <Input label="Email" size="lg" type="email" required />
          <Input label="Password" size="lg" type="password" required />
          <Button fullWidth type="submit">Login</Button>
        </form>

        <div className="my-6 text-center">
          <span className="text-gray-500">Or login with</span>
        </div>

        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
            />
        </GoogleOAuthProvider>

        {/* Facebook Login 
        <div className="flex justify-center">
            <FacebookLogin
                appId={import.meta.env.VITE_FACEBOOK_CLIENT_ID || ''}
                autoLoad={false}
                fields="name,email,picture"
                callback={handleFacebookResponse}
                cssClass="facebook-login-button"
                textButton="Login with Facebook"
            />
              </div>
        */}
      </div>
    </div>
  );
};

export default Login;

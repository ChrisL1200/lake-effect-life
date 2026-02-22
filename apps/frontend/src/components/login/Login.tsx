import React from "react";
import { Button, Input } from "@material-tailwind/react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const Login: React.FC = () => {
  const handleGoogleSuccess = (credentialResponse: any) => {
    console.log("Google login success:", credentialResponse);
  };

  const handleGoogleError = () => {
    console.error("Google login failed");
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full items-start justify-center bg-gray-50 px-3 py-6 sm:px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-lg sm:p-6">
        <h2 className="mb-6 text-center text-2xl font-semibold">Login</h2>
        <form className="mb-4 space-y-4">
          <Input label="Email" size="lg" type="email" required />
          <Input label="Password" size="lg" type="password" required />
          <Button fullWidth type="submit">
            Login
          </Button>
        </form>

        <div className="my-6 text-center">
          <span className="text-gray-500">Or login with</span>
        </div>

        <div className="flex justify-center">
          <GoogleOAuthProvider
            clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </GoogleOAuthProvider>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useEffect } from "react";

const OAuthCallback = ({ onAuthSuccess, onAuthError }) => {
  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check if we have a successful authentication by checking user status
        const response = await fetch("http://localhost:3001/api/user", {
          credentials: "include",
        });

        const data = await response.json();

        if (data.success && data.user) {
          // Authentication successful
          if (onAuthSuccess) {
            onAuthSuccess(data.user);
          }

          // Close popup if this is running in a popup
          if (window.opener) {
            window.opener.postMessage(
              {
                type: "OAUTH_SUCCESS",
                user: data.user,
              },
              "*",
            );
            window.close();
          }
        } else {
          throw new Error("Authentication failed");
        }
      } catch (error) {
        console.error("OAuth callback error:", error);

        if (onAuthError) {
          onAuthError(error.message);
        }

        // Close popup with error if this is running in a popup
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "OAUTH_ERROR",
              error: error.message,
            },
            "*",
          );
          window.close();
        }
      }
    };

    // Small delay to ensure the authentication has been processed
    const timer = setTimeout(handleOAuthCallback, 1000);

    return () => clearTimeout(timer);
  }, [onAuthSuccess, onAuthError]);

  return (
    <div className="oauth-callback">
      <div className="callback-content">
        <div className="loading-spinner"></div>
        <p>Processing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;

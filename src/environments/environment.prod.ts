export const b2cPolicies = {
  authorityDomain:"universalevchargingportal.b2clogin.com",
  names: {
      signUpSignIn: "b2c_1a_signup_signin",
      resetPassword: "b2c_1a_passwordreset",
      editProfile: "b2c_1a_profileedit"
  },
  authorities: {
    signUpSignIn: {
      authority: "https://universalevchargingportal.b2clogin.com/universalevchargingportal.onmicrosoft.com/b2c_1a_signup_signin",
    },
    resetPassword: {
      authority: "https://universalevchargingportal.b2clogin.com/universalevchargingportal.onmicrosoft.com/b2c_1a_passwordreset",
    },
    editProfile: {
      authority: "https://universalevchargingportal.b2clogin.com/universalevchargingportal.onmicrosoft.com/b2c_1a_profileedit"
    },
    signUpInvitationProfile: {
      authority: "https://universalevchargingportal.b2clogin.com/universalevchargingportal.onmicrosoft.com/b2c_1a_signup_Invitation"
    }
  }

};


// #endregion


// #region 2) Web API Configuration
/**
* Enter here the coordinates of your Web API and scopes for access token request
* The current application coordinates were pre-registered in a B2C tenant.
*/
export const apiConfig: { scopes: string[]; webApi: string } = {
  scopes: ['https://universalevchargingportal.onmicrosoft.com/ce30dd72-5c12-4c9a-b384-945bdaeb13d0/access_api'],
  webApi: 'https://evcms-api.azurewebsites.net'

};
// #endregion



// #region 3) Authentication Configuration
/**
* Config object to be passed to Msal on creation. For a full list of msal.js configuration parameters,
* visit https://azuread.github.io/microsoft-authentication-library-for-js/docs/msal/modules/_configuration_.html
*/
export const msalConfig = {
  auth: {
      clientId: 'b1b644a4-336c-4006-a89b-10ecaa556f78',
      authority: b2cPolicies.authorities.signUpSignIn.authority,
      redirectUri: '/',
      postLogoutRedirectUri: '/',
      navigateToLoginRequestUrl: true,
      validateAuthority: false,
    },
  cache: {
      cacheLocation: 'localStorage'
  },
};

export const environment = {
  production: false,
  // old prod url 
  apiBaseUrl: 'https://evcms-api.azurewebsites.net/',
  // new prod url 
  // apiBaseUrl: 'https://stag-mysql-evcms-api.azurewebsites.net/',
  pushHostURL:'https://prod-evcmspushnotification.azurewebsites.net',
  signalRCountURL: 'https://proddashboardcountupdate.azurewebsites.net/api'
};

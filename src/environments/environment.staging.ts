export const b2cPolicies = {
  authorityDomain:"betaugg.b2clogin.com",
  names: {
      signUpSignIn: "b2c_1a_signup_signin",
      resetPassword: "b2c_1a_passwordreset",
      editProfile: "b2c_1a_profileedit"
  },
  authorities: {
      signUpSignIn: {
          authority: "https://betaugg.b2clogin.com/betaugg.onmicrosoft.com/b2c_1a_signup_signin",
      },
      resetPassword: {
          authority: "https://betaugg.b2clogin.com/betaugg.onmicrosoft.com/b2c_1a_passwordreset",
      },
      editProfile: {
          authority: "https://betaugg.b2clogin.com/betaugg.onmicrosoft.com/b2c_1a_profileedit"
      },
      signUpInvitationProfile: {
        authority: "https://betaugg.b2clogin.com/betaugg.onmicrosoft.com/b2c_1a_signup_Invitation"
    }
  }

};


// #endregion


// #region 2) Web API Configuration
/**
* Enter here the coordinates of your Web API and scopes for access token request
* The current application coordinates were pre-registered in a B2C tenant.
*/
export const apiConfig: {scopes: string[]; webApi: string} = {
  scopes: ['https://betaugg.onmicrosoft.com/stag_evmc_api/access'],
  webApi: 'https://stag-evcms-api.azurewebsites.net'
};
// #endregion



// #region 3) Authentication Configuration
/**
* Config object to be passed to Msal on creation. For a full list of msal.js configuration parameters,
* visit https://azuread.github.io/microsoft-authentication-library-for-js/docs/msal/modules/_configuration_.html
*/
export const msalConfig = {
  auth: {
      clientId: '9f25de0a-42f6-4a55-8732-b7a77625ae7d',
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
  production: true,
  // old prod url
  apiBaseUrl: 'https://stag-evcms-api.azurewebsites.net/',
    // new prod url 
  // apiBaseUrl: 'https://stag-mysql-evcms-api.azurewebsites.net/',
  pushHostURL:'https://stag-pushnotificationtrigger.azurewebsites.net',
  signalRCountURL: 'https://stgdashboardcountupdate.azurewebsites.net/api'
};

import { OAuth2Client } from 'google-auth-library';

export const GOOGLE_OAUTH_CLIENT = 'GOOGLE_OAUTH_CLIENT';

export const GoogleOAuthProvider = {
  provide: GOOGLE_OAUTH_CLIENT,
  useFactory: () => {
    return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  },
};

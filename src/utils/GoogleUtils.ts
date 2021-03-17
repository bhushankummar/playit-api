import { google } from 'googleapis';
import { GOOGLE_AUTH } from '../constants';
import { OAuth2Client } from 'googleapis-common';

export const getOAuth2ClientInstance = (): OAuth2Client => {
  return new google.auth.OAuth2(
    GOOGLE_AUTH.CLIENT_ID,
    GOOGLE_AUTH.CLIENT_SECRET,
    GOOGLE_AUTH.REDIRECT_URL
  );
};

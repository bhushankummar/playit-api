import {google} from 'googleapis';
import {GOOGLE_AUTH} from '../constants';

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_AUTH.CLIENT_ID,
  GOOGLE_AUTH.CLIENT_SECRET,
  GOOGLE_AUTH.REDIRECT_URL
);

export {oauth2Client};
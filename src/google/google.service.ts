import { google } from 'googleapis';
import { Injectable } from '@nestjs/common';
import { GOOGLE_AUTH } from '../constant';

@Injectable()
export class GoogleService {

    getOAuth2ClientInstance() {
        return new google.auth.OAuth2(
            GOOGLE_AUTH.GOOGLE_CLIENT_ID,
            GOOGLE_AUTH.CLIENT_SECRET,
            GOOGLE_AUTH.REDIRECT_URL
        );
    }

}

import * as express from 'express';
import * as passport from 'passport';

import * as UserService from '../services/UserService';
import * as GoogleService from '../services/GoogleService';
import * as TokenService from '../services/TokenService';
import * as UserController from '../controllers/UserController';
import * as GoogleController from '../controllers/GoogleController';

const userRoute: express.Router = express.Router();

/**
 * Register API : It will generate Google oAuth URL
 */
userRoute.get('/register', [
    UserService.searchOneByEmail,
    GoogleService.generatesAuthUrlForRegister,
    GoogleController.googleDetail
]);

/**
 * This API Will be call by Google oAuth
 */
userRoute.get('/register/oauth/callback', [
    GoogleService.retrieveAuthorizationCode,
    GoogleService.retrieveGoogleProfile,
    UserService.registerUser,
    UserService.updateGoogleToken,
    UserService.searchOneByState,
    TokenService.createToken,
    GoogleController.redirectToHome
]);

/**
 * Retrieve ME Detail
 */
userRoute.get('/me', passport.authenticate('bearer'), [
    UserController.userDetail
]);

/**
 * Retrieve Google Profile
 */
userRoute.post('/google/me', passport.authenticate('bearer'), [
    UserService.searchOneByEmail,
    GoogleService.setCredentials,
    GoogleService.retrieveGoogleProfile,
    GoogleController.googleProfileDetail
]);

/**
 * Login
 */
userRoute.put('/login', [
    UserService.validateLoginUserData,
    UserService.searchOneByEmail,
    GoogleService.generatesAuthUrlForLogin,
    GoogleController.googleDetail
]);

/**
 * User logout
 */
userRoute.delete('/logout', passport.authenticate('bearer'), [
    TokenService.searchOneByToken,
    TokenService.deleteTokenById,
    UserController.logout
]);

export { userRoute };

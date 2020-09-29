# Authentication

Ember OnFire implements providers for [Ember Simple Auth](http://ember-simple-auth.com/) to integrate [Firebase Authentication](https://firebase.google.com/docs/auth/).

The following providers are implemented:
 * PasswordAuthentication: It uses the method [signInWithEmailAndPassword(email, password)](https://firebase.google.com/docs/auth/web/password-auth#sign_in_a_user_with_an_email_address_and_password). Call session service's authenticate method passing to it email and password
 * CreateUserAuthentication: It uses the method [createUserWithEmailAndPassword(email, password)](https://firebase.google.com/docs/auth/web/password-auth#create_a_password-based_account). Call session service's authenticate method passing to it email and password

 ## How to use it

 As described [here](https://github.com/simplabs/ember-simple-auth#authenticators), you have to define a new authenticator in app/authenticators, and extend it from one of the Ember OnFire Authenticator

 ```js
import FirebasePasswordAuthenticator from 'ember-on-fire/authenticators/firebase-password';

export default class PasswordAuthenticator extends FirebasePasswordAuthenticator {}
 ```

 then invoke the session service's authenticate method.

 ```js
    this.session.authenticate('authenticator:password', this.email, this.password);
 ```
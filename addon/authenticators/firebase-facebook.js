import Base from 'ember-simple-auth/authenticators/base';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';

export default class FirebaseFacebookAuthenticator extends Base {
  @service firebaseApp;
  
  restore(data) {
    return resolve(data);
  }

  authenticate() {
    return this.firebaseApp.auth().signInWithRedirect(this.firebaseApp.facebookProvider());
  }

  invalidate() {
    return this.firebaseApp.auth().signOut();
  }
}
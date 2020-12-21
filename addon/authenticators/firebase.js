import Base from 'ember-simple-auth/authenticators/base';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';

export default class FirebaseAuthenticator extends Base {  
  @service firebaseApp;

  restore(data) {
    return resolve(data);
  }

  authenticate(auth) {
    return auth(this.firebaseApp.auth());
  }

  invalidate() {
    return this.firebaseApp.auth().signOut();
  }
}
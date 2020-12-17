import Base from 'ember-simple-auth/authenticators/base';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';

export default class FirebasePasswordAuthenticator extends Base {
  @service firebaseApp;

  restore(data) {
    return resolve(data);
  }

  authenticate(email, password) {
    return this.firebaseApp.auth().signInWithEmailAndPassword(email, password);
  }

  invalidate() {
    return this.firebaseApp.auth().signOut();
  }
}
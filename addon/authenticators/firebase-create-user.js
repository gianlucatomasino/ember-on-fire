import Base from 'ember-simple-auth/authenticators/base';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';

export default class FirebaseCreateUserAuthenticator extends Base {  
  @service firebaseApp;

  restore(data) {
    if (this.firebase.auth().currentUser) {
      return resolve(data);
    }

    return null;
  }

  authenticate(email, password) {
    return this.firebaseApp.auth().createUserWithEmailAndPassword(email, password);
  }

  invalidate() {
    return this.firebaseApp.auth().signOut();
  }
}
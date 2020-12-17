import { inject as service } from '@ember/service';
import { Promise, resolve } from 'rsvp';
import BaseStore from 'ember-simple-auth/session-stores/base';

export default class FirebaseSessionStore extends BaseStore {  
  @service firebaseApp;
  restoring = true;

  persist(data) {
      return resolve(data);
  }

  restore() {
      return new Promise(resolve => {
          this.firebaseApp.auth().onAuthStateChanged(user => {
              let authenticated = user ? {authenticator: 'authenticator:password', user, credential: user.getIdToken()} : {};
              if (this.restoring) {
                  this.restoring = false;
                  resolve({ authenticated });
                } else {
                    this.trigger('sessionDataUpdated', { authenticated });
                }
            })
        });
    }
}
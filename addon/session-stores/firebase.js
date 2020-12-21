import { inject as service } from '@ember/service';
import { Promise, resolve, reject } from 'rsvp';
import BaseStore from 'ember-simple-auth/session-stores/base';

export default class FirebaseSessionStore extends BaseStore {  
  @service firebaseApp;
  restoring = true;
  restoreAuth = null;

  persist(data) {
      return resolve(data);
  }

  restore() {
      if (this.restoreAuth)
        return this.restoreAuth;

        this.restoreAuth = new Promise(resolve => {            
          this.firebaseApp.auth().onAuthStateChanged(user => {
              let authenticated = user ? { authenticator: 'authenticator:firebase', user, credential: user.getIdToken()} : {};
              
              if (this.restoring) {
                  this.restoring = false;
                  resolve({ authenticated });
                } else {
                    this.trigger('sessionDataUpdated', { authenticated });
                }
            })
        });

        return this.restoreAuth;
    }
}
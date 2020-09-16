ember-on-fire
==============================================================================

Ember on fire is an adapter for use Firebase in Ember.


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.16 or above
* Ember CLI v2.13 or above
* Node.js v10 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-on-fire
```

Add configuration

```js
let ENV = {

    

    firebase: {
      apiKey: "key",
      authDomain: "app.firebaseapp.com",
      databaseURL: "https://app.firebaseio.com",
      projectId: "app",
      storageBucket: "app.appspot.com",
      messagingSenderId: "1234567890"
    }
}
```

Example use
------------------------------------------------------------------------------
```js
// app/authenticators/password.js
import FirestoreAdapter from 'emberfire/adapters/firestore';

import FirebasePasswordAuthenticator from 'ember-on-fire/authenticators/firebase-password';

export default class PasswordAuthenticator extends FirebasePasswordAuthenticator {}
```

```js
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class SampleController extends Controller {
    @service firebaseApp;
    @service session;

    @action
    async login() {
        try {
            await this.session.authenticate('authenticator:password', 'gianluca.tomasino@gmail.com', 'password');
        } catch(error) {
            this.errorMessage = error.error || error;
        }

        if (this.session.isAuthenticated) {
            //Logic after login
        }
    }

    @action
    async logout() {
        await this.session.invalidate();

        //Logic after logout      
    }
}
```

Usage
------------------------------------------------------------------------------

Coming soon...


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).

ember-on-fire
==============================================================================

Ember OnFire is an adapter for use Firebase with Ember. 
Currently the following are the services implemented:
 
 - **Ember Data Adapters**: [Cloud Firestore](https://firebase.google.com/docs/firestore/) adapters for Ember Data allow you to persist your models in Firebase
 - **Authentication Providers** - Integrate [Firebase Authentication](https://firebase.google.com/docs/auth/) with your Ember application easily with providers for [Ember Simple Auth](http://ember-simple-auth.com/)

Installation
------------------------------------------------------------------------------

```
ember install ember-on-fire
```

Add configuration to 

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

## Documentation

* [Quickstart](docs/quickstart.md)
* [Guide](docs/guide/README.md)

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).

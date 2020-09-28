# 1. Create an account on Firebase

You need to create a free Firebase account to use Ember OnFire. 
A new Firebase app will be created for you. 

# 2. Install Ember OnFire into your ember application

To install Ember OnFire, run the following command within your ember-cli app directory:

```
$ ember install ember-on-fire
```

This will add Firebase as a dependency in our `package.json`.

# 3. Configure Firebase

Add your Firebase configuration to `config/environment.js`:

```js
// config/environment.js
var ENV = {
  firebase: {
    apiKey: "xyz",
    authDomain: "YOUR-FIREBASE-APP.firebaseapp.com",
    databaseURL: "https://YOUR-FIREBASE-APP.firebaseio.com",
    projectId: "YOUR-FIREBASE-APP",
    storageBucket: "YOUR-FIREBASE-APP.appspot.com",
    messagingSenderId: "00000000000"
  }
```

# 4. Create an adapter

Add a new custom adapter in the folders adapters (see https://guides.emberjs.com/release/models/customizing-adapters/) with the following code:

```js
import FirebaseAdapter from 'ember-on-fire/adapters/firebase';

export default class ApplicationAdapter extends FirebaseAdapter {
  // Application specific overrides go here
}
```

# 5. Use store to create, find and query your firestore database

Use the store to create and/or find your records:

```js
import Model, { attr } from '@ember-data/model';

export default class PostModel extends Model {
    @attr('string') title;
    @attr('number') stars;
}

createPost() {        
    let post = this.store.createRecord('post', {
        title: this.title,
        stars: this.stars
    });

    post.save();
}

findAll() {
    this.posts = this.store.findAll('post');
}
```

# 6. Advanced usage

See [guide]((guide/README.md)) for more advanced usage (i.e. authentication)
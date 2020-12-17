import Service from '@ember/service';
import { getOwner } from '@ember/application';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';
import 'firebase/analytics';

export default class FirebaseAppService extends Service {
    config = null;

    constructor(){
        super(...arguments);

        let env = getOwner(this).resolveRegistration('config:environment');
        this.config = env['firebase'] || {};
        if (!firebase.apps.length) {
            firebase.initializeApp(this.config);
            this.app = firebase.app();
        }
    }

    getConfiguration() {   
        return this.config;
    }
    
    auth() {
        let auth = firebase.auth(this.app);
        if (this.config['useEmulator']) {
            auth.useEmulator('http://localhost:9099/');
        }
        return auth;
    }

    firestore() {
        if (!this.db) {
            this.db = firebase.firestore(this.app);
            if (this.config['useEmulator']) {
                this.db.useEmulator("localhost", 8080);
            }
        }

        return this.db
    }

    functions() {
        let functions = firebase.functions;
        if (this.config['useEmulator']) {
            functions.useEmulator("localhost", 5001);
        }
        return functions;
    }

    analytics() {
        return firebase.analytics(this.app);
    }

    facebookProvider() {
        return new firebase.auth.FacebookAuthProvider();
    }

    googleProvider() {
        return new firebase.auth.GoogleAuthProvider();
    }
}
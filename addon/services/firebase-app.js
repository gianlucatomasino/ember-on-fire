import Service from '@ember/service';
import { getOwner } from '@ember/application';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

export default class FirebaseAppService extends Service {
    config = null;

    constructor(){
        super(...arguments);

        let env = getOwner(this).resolveRegistration('config:environment');
        this.config = env['firebase'] || {};
        firebase.initializeApp(this.config);
        this.app = firebase.app();
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
        let db = firebase.firestore();
        if (this.config['useEmulator']) {
            db.useEmulator("localhost", 8080);
        }

        return db; 
    }

    functions() {
        let functions = firebase.functions;
        if (this.config['useEmulator']) {
            functions.useEmulator("localhost", 5001);
        }
        return functions;
    }
}
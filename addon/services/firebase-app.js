import Service from '@ember/service';
import { getOwner } from '@ember/application';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

export default class FirebaseAppService extends Service {
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
        return firebase.auth(this.app);
    }

    firestore() {
        return firebase.firestore();
    }

    functions() {
        return firebase.functions;
    }
}
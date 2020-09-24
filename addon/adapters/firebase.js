import Adapter from '@ember-data/adapter';
import { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';

export default class FirebaseAdapter extends Adapter {
    @service firebaseApp;

    async createRecord(store, type, snapshot) {
        let data = this.serialize(snapshot, { includeId: true });
        let collection = pluralize(type.modelName);        

        let doc = await this.firebaseApp.firestore().collection(collection).add(data);
        return doc.get();        
    }

    async findRecord(store, type, id, snapshot) { 
        let collection = pluralize(type.modelName);
        
        return this.firebaseApp.firestore().collection(collection).doc(id).get();
    }
}
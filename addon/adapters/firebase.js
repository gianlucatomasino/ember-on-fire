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

    async findAll(store, type, neverSet, snapshotRecordArray) {
        let collection = pluralize(type.modelName);
        
        return this.firebaseApp.firestore().collection(collection).get();
    }

    query(store, type, query, recordArray) {        
        let collection = this.firebaseApp.firestore().collection(pluralize(type.modelName));
        let q = null;

        query.where.forEach(function(w, i) {
            if (i === 0) {
                q = collection.where(w.field, w.op, w.value);
            }
            else { 
                q = q.where(w.field, w.op, w.value);
            }
        });

        return q.get();
    }
}
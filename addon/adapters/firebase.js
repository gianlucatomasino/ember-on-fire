import Adapter from '@ember-data/adapter';
import { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';

export default class FirebaseAdapter extends Adapter {
    @service firebaseApp;
    operators = [
        {  gt: ">" },
        {  lt: "<" },
        { lte: "<=" }
    ]

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
        let firebaseQuery = null;

        query.filters.forEach(function(filter, index) {
            if (index === 0) {
                firebaseQuery = collection.where(filter.field, filter.op, filter.value);
            }
            else { 
                firebaseQuery = firebaseQuery.where(filter.field, filter.op, filter.value);
            }
        });

        return firebaseQuery.get();
    }
}
import Adapter from '@ember-data/adapter';
import { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';

export default class FirebaseAdapter extends Adapter {
    useFetch = true;
    @service firebaseApp;
    db = this.firebaseApp.firestore();

    async createRecord(store, type, snapshot) {
        console.debug("Creating record, snapshot: ", snapshot.record);
 
        let collection = pluralize(type.modelName);
        let json = this.serialize(snapshot, { includeId: true });

        let ref = await this.db.collection(collection).add(json);
                
        return this.flattenRecord(await ref.get());
    }

    async updateRecord(store, type, snapshot) {    
        let collection = pluralize(type.modelName);

        let json = this.serialize(snapshot);

        let doc = await this.db.collection(collection).doc(snapshot.id);        
        await doc.update(json);
        
        return this.flattenRecord(await doc.get());
    }

    async findRecord(store, type, id, snapshot) {
        let docRef = this.db.collection(pluralize(type.modelName)).doc(id)            
        let doc = await docRef.get();
        if (doc.exists) {
            return this.flattenRecord(doc);
        }

        return null;
    }

    flattenRecord(doc) {
        let id = doc.id;
        let data = doc.data() || {};

        return { id, ...data };
    }

    async deleteRecord(store, type, snapshot) {
        return await this.db.collection(pluralize(type.modelName)).doc(snapshot.id).delete();
    } 

    async findAll(store, type, neverSet, snapshotRecordArray) {
        let result = await this.db.collection(pluralize(type.modelName)).get();
        
        return result.docs.map((item) => {
            return this.flattenRecord(item);
        });
    }

    _firebaseQuery(modelName, query) {
        let collection = this.db.collection(pluralize(modelName));
        
        if (query.filter) {
            collection = query.filter(collection, this.db);
        }

        return collection;
    }

    async query(store, type, query, recordArray) {
        let result = await this._firebaseQuery(type.modelName, query).get();
        
        return result.docs.map((item) => {
            return this.flattenRecord(item);
        });
    }

    findBelongsTo() {
        console.log("Belongs to");
    }

    async findHasMany(store, snapshot, url, relationship) {        
        console.log("hasmany")
        /*let records = await this.db.collection(pluralize(relationship.meta.type))
                            .where(relationship.meta.parentModelName + "Id", "==", snapshot.id).get();
        
        return records.docs.map((doc) => this.flattenRecord(doc));*/

        return {};
    }
 }
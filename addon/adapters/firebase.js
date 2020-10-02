import Adapter from '@ember-data/adapter';
import { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { isPresent } from '@ember/utils';

export default class FirebaseAdapter extends Adapter {
    @service firebaseApp;

    async createRecord(store, type, snapshot) {
        let collection = pluralize(type.modelName);        

        snapshot.eachRelationship((name, relationship) => {
            if (relationship.kind  === 'belongsTo') {
                let belongsTo = snapshot.belongsTo(name);

                collection = pluralize(belongsTo.modelName) + "/" 
                                + belongsTo.id + "/" 
                                + pluralize(type.modelName)
            }            
        });       
        
        let doc = await this.firebaseApp.firestore().collection(collection)
                                .add(this.serialize(snapshot, { includeId: true }));
        return doc.get();
    }

    async findRecord(store, type, id, snapshot) { 
        var include = [];
        
        if (isPresent(snapshot.include)) {
            include = snapshot.include.split(',');                        
        }

        let primaryCollection = pluralize(type.modelName);
        let primaryModel = await this.firebaseApp.firestore().collection(primaryCollection).doc(id).get();

        var includeModels = [];
        include.forEach(async (model) => {
            let includeCollection = primaryCollection + '/' + id + '/' + pluralize(model);
            console.log(includeCollection);
            let datas = await this.firebaseApp.firestore().collection(includeCollection).get();
            console.log(datas);
            includeModels.push(datas);
        });

        console.log(includeModels);

        return { 
            primaryModel,
            include: includeModels
        }
    }

    async findAll(store, type, neverSet, snapshotRecordArray) {
        let collection = pluralize(type.modelName);
        
        return this.firebaseApp.firestore().collection(collection).get();
    }

    async query(store, type, query, recordArray) {  
        let collection = this.firebaseApp.firestore().collection(pluralize(type.modelName));
        let firebaseQuery = null;

        if (isPresent(query.filters)) {
            query.filters.forEach(function(filter, index) {
                if (index === 0) {
                    firebaseQuery = collection.where(filter.field, filter.op, filter.value);
                }
                else { 
                    firebaseQuery = firebaseQuery.where(filter.field, filter.op, filter.value);
                }
            });
        }

        if (isPresent(query.include)) {
            console.log("include");
        }

        return firebaseQuery.get();
    }
}
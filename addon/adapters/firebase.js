import Adapter from '@ember-data/adapter';
import { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { isPresent, isEmpty } from '@ember/utils';
import { Promise } from 'rsvp';
import { dasherize,camelize } from '@ember/string';

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

        let doc = await this.firebaseApp.firestore().collection(collection).add(this._convertJsonApiToDoc(snapshot));        
        return { data: this._convertRecordToJsonApi(await doc.get(), type.modelName) }; 
    }

    async findRecord(store, type, id, snapshot) {    
        let json = {};
        let record = await this.firebaseApp.firestore().collection(pluralize(type.modelName)).doc(id).get();        
        json['data'] = this._convertRecordToJsonApi(record, type.modelName);
        
        if (isPresent(snapshot.include)) {
            json['data']['relationships'] = await this._relationships(record, type, snapshot.include);            
            json['included'] = await this._included(record, type, snapshot.include);
        }

        return json;
    }

    async findAll(store, type, neverSet, snapshotRecordArray) {
        let collection = pluralize(type.modelName);
        
        return {}
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
                
        let docs = await firebaseQuery.get();

        let data = [];
        let included = [];
        
        await Promise.all(docs.docs.map(async (doc) => {            
            let jsonApiRecord = this._convertRecordToJsonApi(doc, type.modelName)
        
            if (isPresent(query.include)) {
                jsonApiRecord['relationships'] = await this._relationships(doc, type, query.include);            
                included.push(await this._included(doc, type, query.include));
            }

            data.push(jsonApiRecord);
        }));

        included = included.reduce((flat, item) => flat = flat.concat(item), []);

        return { data, included };
    }

    async _relationships(record, type, relatedModels) {        
        let relationships = {};
        
        await Promise.all(relatedModels.split(',').map(async (model) => {
            let collection = pluralize(type.modelName) + '/' + record.id + '/' + pluralize(model);    
            let docs = await this.firebaseApp.firestore().collection(collection).get();
            relationships[pluralize(model)] = this._convertHasManyToJsonApi(model, docs);
        }));

        return relationships;
    }

    async _included(record, type, relatedModels) {        
        let included= [];
        
        await Promise.all(relatedModels.split(',').map(async (model) => {
            let collection = pluralize(type.modelName) + '/' + record.id + '/' + pluralize(model);    
            let docs = await this.firebaseApp.firestore().collection(collection).get();
            included = included.concat(this._convertIncludedToJsonApi(model, docs));
        }));

        return included;
    }

    _convertRecordToJsonApi(record, modelName) {
        let data = record.data();
        let attributes = {};

        Object.keys(data).forEach(key => {
            if (isPresent(data[key])) {
                attributes[dasherize(key)] = data[key];
            }
        });
        
        return {
            type: modelName,
            id: record.id,
            attributes: { ...attributes },
        }
    }

    _convertHasManyToJsonApi(modelName, related) {
        let data = [];

        related.forEach((record) => {
            data.push({ type: pluralize(modelName), id: record.id })
        });

        return { data }
    }

    _convertIncludedToJsonApi(modelName, related) {
        let data = [];

        related.forEach((record) => {
            data.push(this._convertRecordToJsonApi(record, modelName));
        });
        
        return data;
    }

    _convertJsonApiToDoc(snapshot) {
        let attributes = this.serialize(snapshot, { includeId: false }).data.attributes;

        let jsonapi = {};
        Object.keys(attributes).forEach(key => {
            if (isPresent(attributes[key])) {
                jsonapi[camelize(key)] = attributes[key];
            }
        });

        return jsonapi;
    }
}
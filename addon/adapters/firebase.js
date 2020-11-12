import Adapter from '@ember-data/adapter';
import { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { isPresent, isEmpty } from '@ember/utils';
import { Promise } from 'rsvp';
import { dasherize,camelize } from '@ember/string';
import { getOwner } from '@ember/application';

export default class FirebaseAdapter extends Adapter {
    @service firebaseApp;
    db = this.firebaseApp.firestore();

    async createRecord(store, type, snapshot) {
        let collection = pluralize(type.modelName);

        let jsonapiModel = this._convertJsonApiToDoc(snapshot)

        snapshot.eachRelationship((name, relationship) => {
            if (relationship.kind  === 'belongsTo') {
                let belongsTo = snapshot.belongsTo(name);
                jsonapiModel[camelize(belongsTo.modelName) + "Id"] = belongsTo.id;
            }            
        });

        let doc = await this.db.collection(collection).add(jsonapiModel);        
        return { data: this._convertRecordToJsonApi(await doc.get(), type.modelName) }; 
    }

    async updateRecord(store, type, snapshot) {    
        let collection = pluralize(type.modelName);

        let jsonapiModel = this._convertJsonApiToDoc(snapshot)

        snapshot.eachRelationship((name, relationship) => {
            if (relationship.kind  === 'belongsTo') {
                let belongsTo = snapshot.belongsTo(name);
                jsonapiModel[camelize(belongsTo.modelName) + "Id"] = belongsTo.id;
            }            
        });

        let record = await this.db.collection(collection).doc(snapshot.id);        
        
        await record.update(jsonapiModel);
        let doc = await this.db.collection(collection).doc(snapshot.id);        
        return { data: this._convertRecordToJsonApi(await doc.get(), type.modelName) }; 
    }

    async findRecord(store, type, id, snapshot) {    
        let json = {};
        let record = await this.db.collection(pluralize(type.modelName)).doc(id).get();        
        json['data'] = this._convertRecordToJsonApi(record, type.modelName);
        
        if (isPresent(snapshot.include)) {
            json['data']['relationships'] = await this._relationships(store, record, type, snapshot.include);            
            json['included'] = await this._included(store, record, type, snapshot.include);
        }

        return json;
    }

    async findAll(store, type, neverSet, snapshotRecordArray) {
        let collection = pluralize(type.modelName);
        
        return {}
    }

    async query(store, type, query, recordArray) { 
        let collection = this.db.collection(pluralize(type.modelName));
        let firebaseQuery = null;

        if (isPresent(query.filter)) {
            let filter = query.filter;

            Object.keys(filter).forEach(key => {
                if (!(filter[key] instanceof Object)) {
                    if (firebaseQuery) {
                        firebaseQuery = firebaseQuery.where(key, '==', filter[key]);
                    } else {
                        firebaseQuery = collection.where(key, '==', filter[key]);
                    }
                }
            });
        }

        let docs = await firebaseQuery.get();

        let data = [];
        let included = [];
        
        await Promise.all(docs.docs.map(async (doc) => {            
            let jsonApiRecord = this._convertRecordToJsonApi(doc, type.modelName)
        
            if (isPresent(query.include)) {
                jsonApiRecord['relationships'] = await this._relationships(store, doc, type, query.include, query.filter);            
                included.push(await this._included(store, doc, type, query.include, query.filter));
            }

            data.push(jsonApiRecord);
        }));

        included = included.reduce((flat, item) => flat = flat.concat(item), []);

        return { data, included };
    }

    async _applyFilter(store, modelName, collection, filters) {
        let query = null;

        Object.keys(filters).forEach(key => {
            if (filters[key] instanceof Object) {
                Object.keys(filters[key]).forEach(opKey => {
                    let attribute = store.modelFor(modelName).attributes.get(key);
                    let transform = getOwner(this).lookup('transform:' + attribute.type);

                    let op = '==';

                    switch (opKey) {
                        case 'ge': op = '>=';
                                    break;
                        case 'le': op = '<=';
                                break;
                    }

                    if (query) {
                        query = query.where(key, op, transform.serialize(filters[key][opKey]));
                    } else {
                        query = collection.where(key, op, transform.serialize(filters[key][opKey]));
                    }    
                });
            } else {
                if (query) {
                    query = query.where(key, '==', filters[key]);
                } else {
                    query = collection.where(key, '==', filters[key]);
                }
            }
        });

        return query;
    }

    async _relationships(store, record, type, relatedModels, filters = {}) {
        let relationships = {};
        
        await Promise.all(relatedModels.split(',').map(async (model) => {
            let collection = await this.db.collection(pluralize(model))
            
            filters[model][camelize(type.modelName) + "Id"] = record.id;
            let query = await this._applyFilter(store, model, collection, filters[model]);

            let docs = await query.get();
            relationships[pluralize(model)] = this._convertHasManyToJsonApi(model, docs);
        }));

        return relationships;
    }

    async _included(store, record, type, relatedModels, filters = {}) {        
        let included= [];
        
        await Promise.all(relatedModels.split(',').map(async (model) => {
            let collection = await this.db.collection(pluralize(model))
                        
            filters[model][camelize(type.modelName) + "Id"] = record.id;
            let query = await this._applyFilter(store, model, collection, filters[model]);
            
            let docs = await query.get();
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
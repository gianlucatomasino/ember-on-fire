import JSONSerializer from '@ember-data/serializer/json';
import { isPresent, isNone } from '@ember/utils';
import { dasherize,camelize } from '@ember/string';
import { pluralize } from 'ember-inflector';
import { inject as service } from '@ember/service';

export default class FirebaseSerializer extends JSONSerializer {
    @service firebaseApp;
    db = this.firebaseApp.firestore();

    normalizeResponse(store, primaryModelClass, payload, id, requestType) {
        switch (requestType) {
            case 'query':
                return this._normalizeResponse(...arguments, false);
            case 'findRecord':
                return this._normalizeResponse(...arguments, true);
            case 'findHasMany':
                return this._normalizeResponse(...arguments, false);
            case 'findAll':
                return this._normalizeResponse(...arguments, false);
            case 'createRecord':
                return this._normalizeResponse(...arguments, true);
            case 'updateRecord':
                return this._normalizeResponse(...arguments, true);
            }
    }

    _normalizeResponse(store, primaryModelClass, payload, id, requestType, isSingle) {
        let document = {
            data: null
        }

        if (isSingle) {
            console.debug('Single response normalize payload', primaryModelClass, payload);
            return this.normalize(primaryModelClass, payload);
        } else {
            document.data = [];
            payload.forEach((item) => {
                let { data } = this.normalize(primaryModelClass, item);
                document.data.push(data);                
            });

            return document;
        }
    }

    extractRelationship(relationshipModelName, relationshipHash) {
        let pathNodes = relationshipHash.path.split('/');
        let belongsToId = pathNodes[pathNodes.length - 1];

        return { id: belongsToId, type: relationshipModelName }
    }

    extractRelationships(relationshipModelName, relationshipHash) {
        let newRelationshipHash = { ...relationshipHash };
        newRelationshipHash.links = [];

        relationshipModelName.eachRelationship((name, descriptor) => { 
            if (descriptor.kind == 'hasMany') {
                let collection = pluralize(relationshipModelName.modelName);
                let path = `${collection}/${relationshipHash.id}/${name}`;
                newRelationshipHash.links[name] = path;
            }

            if (descriptor.kind === 'belongsTo') {
                newRelationshipHash.links[name] = relationshipHash[name].path;
            }
        })

        return super.extractRelationships(relationshipModelName, newRelationshipHash);
    }

    serializeBelongsTo(snapshot, json, relationship) {
        super.serializeBelongsTo(snapshot, json, relationship);

        var key = relationship.key;
        var belongsTo = snapshot.belongsTo(key);

        key = this.keyForRelationship(key, "belongsTo", "serialize");
        json[key]= this.db.doc(pluralize(belongsTo.modelName)+'/'+belongsTo.id);
    }    

    serialize(snapshot, options) {
        let json =  super.serialize(snapshot, options);
        return json;
    }

    pushPayload(store, payload) {
        let documentHash = {
            data: []
        };

        Object.keys(payload).forEach((model) => {
            let modelType = store.modelFor(this.modelNameFromPayloadKey(model));
            let { data } = this.normalize(modelType, payload[model]);
            documentHash.data.push(data);
        });

        console.debug("Pushpayload... pushing: ", documentHash);

        store.push(documentHash);
    }
}
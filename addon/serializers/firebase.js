import JSONAPISerializer from '@ember-data/serializer/json-api';
import { pluralize } from 'ember-inflector';

export default class FirebaseSerializer extends JSONAPISerializer {
    normalizeResponse(store, primaryModelClass, payload, id, requestType) {
        let key = null;
        let attributes = null;

       if (requestType==='findRecord') {
            key = id;
            attributes = payload;
        }

        if (requestType==='createRecord') {
            key = payload.id;
            attributes = payload.data();                                
        }


        return {
            data: {               
                id: key, 
                attributes: { ...attributes },
                type: primaryModelClass.modelName
            }            
        };
    }

    serialize(snapshot, options) {
        let json = {
            ...snapshot.attributes()
        };
        
        return json;
    }
}
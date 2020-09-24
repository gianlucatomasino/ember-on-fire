import JSONAPISerializer from '@ember-data/serializer/json-api';
import { pluralize } from 'ember-inflector';

export default class FirebaseSerializer extends JSONAPISerializer {
    normalizeResponse(store, primaryModelClass, payload, id, requestType) {
        let key = null;
        let attributes = null;

        console.log(payload);
        console.log(requestType);

        if (requestType==='findRecord') {
            key = id;
            attributes = payload.data();

            let json = {
                data: {               
                    id: key, 
                    attributes: { ...attributes },
                    type: primaryModelClass.modelName
                }            
            };

            return json;
        } 

        if (requestType==='createRecord') {
            key = payload.id;
            attributes = payload.data();  
            
            let json = {
                data: {               
                    id: key, 
                    attributes: { ...attributes },
                    type: primaryModelClass.modelName
                }            
            };

            return json;
        }

        if (requestType==='findAll') {
            let docs = [];
            payload.forEach(doc => {
                attributes = doc.data();
                key = doc.id;
                
                docs.push({
                    id: key, 
                    attributes: { ...attributes },
                    type: primaryModelClass.modelName    
                });                
            });

            let json = {
                data: [
                    ...docs
                ]
            }

            return json;            
        }
    }

    serialize(snapshot, options) {
        let json = {
            ...snapshot.attributes()
        };
        
        return json;
    }
}
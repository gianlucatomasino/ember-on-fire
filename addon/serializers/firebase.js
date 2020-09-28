import JSONAPISerializer from '@ember-data/serializer/json-api';
import { pluralize } from 'ember-inflector';
import { getOwner } from '@ember/application';

export default class FirebaseSerializer extends JSONAPISerializer {
    normalizeResponse(store, primaryModelClass, payload, id, requestType) {
        let key = null;
        let attributes = null;

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

        if (requestType==='findAll' || requestType==='query') {
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
        var json = {};        
        let self = this;

        snapshot.eachAttribute(function(key, attribute) {
            let transform = getOwner(self).lookup('transform:' + attribute.type);                
            json[key] = transform.serialize(snapshot.attr(key), attribute.options);
        });
                        
        return json;
    }

}
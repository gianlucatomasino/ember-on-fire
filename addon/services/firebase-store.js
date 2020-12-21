import Store from '@ember-data/store';
import { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';
import { debug } from '@ember/debug';

export default class FirebaseStore extends Store {
    @service firebaseApp;
    db = this.firebaseApp.firestore();

    listenQuery(modelName, query, options) {
        let adapter = this.adapterFor(modelName);
        let querySnapshot = adapter._firebaseQuery(modelName, query);
        let self = this;

        return querySnapshot.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach(function(change) {
                if (change.type === "added") {
                    console.debug('Adding new doc to the query: ', change.doc.id, change.doc.data(), change.doc.metadata);
                    
                    if (!change.doc.metadata.hasPendingWrites) {                
                        const payload = {};
                        payload[modelName] = adapter.flattenRecord(change.doc);
                        self.pushPayload(payload);
                    }
                }
                if (change.type === "modified") {                    
                    console.debug('Updating a doc to the query: ', change.doc.id, change.doc.data(), change.doc.metadata);

                    if (!change.doc.metadata.hasPendingWrites) {                                    
                        const payload = {};
                        payload[modelName] = adapter.flattenRecord(change.doc);
                        self.pushPayload(payload);
                    }
                }
                if (change.type === "removed") {                    
                    console.debug('Removing a doc to the query: ', change.doc.id, change.doc.data(), change.doc.metadata);

                    let record = self.peekRecord(modelName, change.doc.id);
                    if (record && !record.isDeleted)
                        self.unloadRecord(record);
                }
            });
        });
    }
}
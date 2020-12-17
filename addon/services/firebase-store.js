import Store from '@ember-data/store';
import { inject as service } from '@ember/service';
import { pluralize } from 'ember-inflector';

export default class FirebaseStore extends Store {
    @service firebaseApp;
    db = this.firebaseApp.firestore();

    listenQuery(modelName, query, options) {
        let adapter = this.adapterFor(modelName);
        let querySnapshot = adapter._firebaseQuery(modelName, query);
        let self = this;

        querySnapshot.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach(function(change) {
                if (change.type === "added") {
                    const payload = {};
                    payload[modelName] = adapter.flattenRecord(change.doc);
                    self.pushPayload(payload);
                }
                if (change.type === "modified") {
                    let record = self.peekRecord(modelName, change.doc.id);
                    if (record && !record.isSaving) {
                        const payload = {};
                        payload[modelName] = adapter.flattenRecord(change.doc);
                        self.pushPayload(payload);
                    }
                }
                if (change.type === "removed") {
                    let record = self.peekRecord(modelName, change.doc.id);
                    if (record && !record.isSaving) {
                        self.unloadRecord(record);
                    }
                }
            });
            
            /*snapshot.forEach(function(doc) {
                const payload = {};
                payload[modelName] = adapter.flattenRecord(doc);
                self.pushPayload(payload);
            })*/
        });
    }
}
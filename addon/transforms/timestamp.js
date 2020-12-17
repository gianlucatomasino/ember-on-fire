import { typeOf } from '@ember/utils';
import Transform from '@ember-data/serializer/transform';
import { inject as service } from "@ember/service";

export default class TimestampTransform extends Transform {
    @service firebaseApp;

    deserialize(value) {
        return value.toDate();
    }

    serialize(value) {
        return typeOf(value) === 'date' ? value : this.firebaseApp.firestore().FieldValue.serverTimestamp();
    }
}
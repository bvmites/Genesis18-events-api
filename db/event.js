const ObjectId = require('mongodb').ObjectId;

module.exports = (db) => ({
    create: (event) => {
        const newEvent = {participants: [], ...event};
        return db.collection('events').insertOne(newEvent);
    },

    update: (event) => {
        const {_id} = event;
        delete event._id;
        return db.collection('events').update({_id: ObjectId(_id)}, {'$set': {...event}}, {upsert: false});
    },

    getAll: () => {
        return db.collection('events').find({});
    },

    getById: (id) => {
        return db.collection('events').findOne({_id: ObjectId(id)});
    },

    delete_one: (id) => {
        return db.collection('events').deleteOne({_id: ObjectId(id)});
    }
});
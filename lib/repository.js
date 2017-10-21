'use strict';

const MongoClient = require('mongodb').MongoClient;

let db;

const COLLECTIONS = Object.freeze({
    STATUS: 'status',
    REPORT: 'report'
});

function tryGetLastUserId() {
    return db.collection(COLLECTIONS.STATUS).find({}).toArray();
}

async function getLastUserId() {
    const result = await tryGetLastUserId();
    return result.length === 0 ? 0 : result[0].lastUserId;
}

async function init(url) {
    db = await MongoClient.connect(`mongodb://${url}`);
    return await getLastUserId();
}

module.exports = {
    init,
    persistLastId: async lastId => {
        if (!db) return;
        const currentLastUserIdEntity = await tryGetLastUserId();
        if (currentLastUserIdEntity.length) {
            await db.collection(COLLECTIONS.STATUS).updateOne({_id: currentLastUserIdEntity[0]._id}, {lastUserId: lastId});
            return;
        }
        await db.collection(COLLECTIONS.STATUS).insertOne({lastUserId: lastId});
    },
    persistReport: report => {
        if (!db) return;
        return db.collection(COLLECTIONS.REPORT).insertOne(report);
    }
};
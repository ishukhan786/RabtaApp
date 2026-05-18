db = db.getSiblingDB('whatsapp_clone');

db.createCollection('chats');
db.createCollection('message_events');
db.createCollection('user_presence');

db.chats.createIndex({ participantIds: 1 });
db.message_events.createIndex({ chatId: 1, createdAt: -1 });
db.user_presence.createIndex({ userId: 1 }, { unique: true });

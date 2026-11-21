// Runs once, when the MongoDB data volume is empty.
// Creates the POS database with the counters the API expects and a first superadmin.
// Default login: superadmin@pos.local / Admin#1234  -> change it after the first login.
db = db.getSiblingDB('POS');

db.identitycounters.updateOne(
  { model: 'User', field: 'userId' },
  { $set: { count: 1 } },
  { upsert: true }
);

db.users.updateOne(
  { email: 'superadmin@pos.local' },
  {
    $setOnInsert: {
      fullName: 'Super Admin',
      email: 'superadmin@pos.local',
      password: '$2b$10$crvwI9dPYZ9/7G3pTpI36e400NADNuf/F.TwD1zFweui4J/MTRSSO',
      role: 'superadmin',
      status: true,
      address: 'Head Office',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  { upsert: true }
);

// MongoDB initialization script
// This file runs when MongoDB container starts for the first time

db = db.getSiblingDB('taskmanager');

// Create collections
db.createCollection('users');
db.createCollection('tasks');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": -1 });

db.tasks.createIndex({ "user": 1 });
db.tasks.createIndex({ "status": 1 });
db.tasks.createIndex({ "priority": 1 });
db.tasks.createIndex({ "dueDate": 1 });
db.tasks.createIndex({ "createdAt": -1 });
db.tasks.createIndex({ "user": 1, "status": 1 });
db.tasks.createIndex({ "user": 1, "priority": 1 });

// Create admin user (optional - for development only)
if (db.getName() === 'taskmanager') {
  try {
    db.createUser({
      user: 'taskmanager_admin',
      pwd: 'admin123',
      roles: [
        {
          role: 'readWrite',
          db: 'taskmanager'
        }
      ]
    });
    print('✅ Admin user created successfully');
  } catch (error) {
    print('⚠️ Admin user already exists or failed to create:', error.message);
  }
}

print('✅ Database taskmanager initialized successfully');
print('📊 Collections created: users, tasks');
print('🚀 Indexes created for optimal performance');
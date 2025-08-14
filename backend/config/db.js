const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create indexes for better performance
    // const db = conn.connection.db;
    // 
    // Index for users collection
    // await db.collection('users').createIndex({ email: 1 }, { unique: true });
    // 
    // Indexes for tasks collection
    // await db.collection('tasks').createIndex({ user: 1 });
    // await db.collection('tasks').createIndex({ status: 1 });
    // await db.collection('tasks').createIndex({ priority: 1 });
    // await db.collection('tasks').createIndex({ dueDate: 1 });
    // await db.collection('tasks').createIndex({ createdAt: -1 });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🚀 Indexes created successfully`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
        // Retry connection after 5 seconds
    setTimeout(() => {
      console.log('🔄 Retrying database connection...');
    process.exit(1);
      connectDB();
    }, 5000);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected');
});

// Close connection on app termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 Database connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;
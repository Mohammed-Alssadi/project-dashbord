import sequelize from './config/db.js';
import User from './models/User.js';

async function run() {
  try {
    await sequelize.authenticate();
    const users = await User.findAll();
    console.log('--- DATABASE USERS ---');
    console.log(users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      platform: u.platform,
      platformStoreId: u.platformStoreId
    })));
  } catch (err) {
    console.error('Error querying users:', err);
  } finally {
    await sequelize.close();
  }
}

run();

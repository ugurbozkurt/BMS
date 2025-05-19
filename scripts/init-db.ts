import { UserModel } from '../models/user';
import { testConnection } from '../utils/db';

async function initializeDatabase() {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Veritabanına bağlanılamadı');
      process.exit(1);
    }

    // Create tables
    await UserModel.createTable();
    
    console.log('Veritabanı başarıyla kuruldu');
    process.exit(0);
  } catch (error) {
    console.error('Veritabanı kurulumu sırasında hata:', error);
    process.exit(1);
  }
}

initializeDatabase(); 
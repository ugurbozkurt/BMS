import { Pool } from 'pg';

// PostgreSQL bağlantı havuzu oluşturma
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Bağlantıyı test etme fonksiyonu
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL bağlantısı başarılı');
    client.release();
    return true;
  } catch (error) {
    console.error('PostgreSQL bağlantı hatası:', error);
    return false;
  }
};

// Sorgu çalıştırma yardımcı fonksiyonu
export const query = async (text: string, params?: any[]) => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Sorgu süresi:', duration, 'ms');
    return res;
  } catch (error) {
    console.error('Sorgu hatası:', error);
    throw error;
  }
};

// Havuzu dışa aktarma
export default pool; 
import { query } from '../utils/db';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  full_name: string;
  created_at: Date;
  updated_at: Date;
}

// Kullanıcı oluşturma SQL'i
const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

// Kullanıcı modeli fonksiyonları
export const UserModel = {
  // Tablo oluşturma
  async createTable() {
    try {
      await query(CREATE_USERS_TABLE);
      console.log('Users tablosu oluşturuldu veya zaten mevcut');
    } catch (error) {
      console.error('Tablo oluşturma hatası:', error);
      throw error;
    }
  },

  // Yeni kullanıcı oluşturma
  async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { username, email, password, full_name } = user;
    const sql = `
      INSERT INTO users (username, email, password, full_name)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [username, email, password, full_name];
    
    try {
      const result = await query(sql, values);
      return result.rows[0];
    } catch (error) {
      console.error('Kullanıcı oluşturma hatası:', error);
      throw error;
    }
  },

  // Kullanıcı güncelleme
  async update(id: number, updates: Partial<User>) {
    const fields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map((key, index) => `${key} = $${index + 2}`);
    
    const values = [id, ...Object.values(updates)];
    const sql = `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;

    try {
      const result = await query(sql, values);
      return result.rows[0];
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error);
      throw error;
    }
  },

  // Kullanıcı silme
  async delete(id: number) {
    const sql = 'DELETE FROM users WHERE id = $1 RETURNING *;';
    
    try {
      const result = await query(sql, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      throw error;
    }
  },

  // ID ile kullanıcı bulma
  async findById(id: number) {
    const sql = 'SELECT * FROM users WHERE id = $1;';
    
    try {
      const result = await query(sql, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Kullanıcı bulma hatası:', error);
      throw error;
    }
  },

  // Email ile kullanıcı bulma
  async findByEmail(email: string) {
    const sql = 'SELECT * FROM users WHERE email = $1;';
    
    try {
      const result = await query(sql, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Kullanıcı bulma hatası:', error);
      throw error;
    }
  },

  // Tüm kullanıcıları listeleme
  async findAll() {
    const sql = 'SELECT * FROM users ORDER BY created_at DESC;';
    
    try {
      const result = await query(sql);
      return result.rows;
    } catch (error) {
      console.error('Kullanıcıları listeleme hatası:', error);
      throw error;
    }
  }
};

export default UserModel; 
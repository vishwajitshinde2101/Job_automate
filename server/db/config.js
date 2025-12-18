/**
 * ======================== DATABASE CONFIG ========================
 * MySQL Connection using Sequelize ORM
 * Auto-creates database and tables on first run
 */

import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DB_NAME = process.env.DB_NAME || 'jobautomate';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;

const sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    {
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'mysql',
        logging: false,
        define: {
            timestamps: true,
            underscored: true,
        },
    }
);

/**
 * Create database if it doesn't exist
 */
async function createDatabaseIfNotExists() {
    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
        console.log(`✅ Database '${DB_NAME}' ready`);
        await connection.end();
    } catch (error) {
        console.error('❌ Failed to create database:', error.message);
        throw error;
    }
}

/**
 * Test and sync database
 */
export const initDatabase = async () => {
    try {
        // First, create the database if it doesn't exist
        await createDatabaseIfNotExists();

        // Then connect with Sequelize
        await sequelize.authenticate();
        console.log('✅ MySQL Connection established successfully');

        // Sync all models
        await sequelize.sync({ alter: true });
        console.log('✅ Database tables synchronized');

        return sequelize;
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
};

export default sequelize;

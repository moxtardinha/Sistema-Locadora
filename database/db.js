import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });
const db = mysql.createPool({
    user: process.env.USERDB,
    password: process.env.PASSWORDDB,
    database: process.env.DBNAME,
    socketPath: '/var/lib/mysql/mysql.sock'
});

export default db;
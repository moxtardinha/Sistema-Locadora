import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });
const db = mysql.createPool({
    user: process.env.USERDB,
    password: process.env.PASSWORDDB,
    database: process.env.DBNAME,
    port: 3306,
    host: 'localhost',
    socketPath: '/var/run/mysqld/mysqld.sock'
});

export default db;
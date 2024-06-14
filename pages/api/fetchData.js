// pages/api/fetchData.js
import { createConnection } from 'mysql2/promise';

export default async function handler(req, res) {
    const connection = await createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [rows] = await connection.execute('SELECT * FROM environment_data ORDER BY timestamp DESC LIMIT 100');
    await connection.end();

    res.status(200).json(rows);
}
// pages/api/realtime.js
import { createConnection } from 'mysql2/promise';

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const connection = await createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const sendLatestData = async () => {
        const [rows] = await connection.execute('SELECT * FROM environment_data ORDER BY timestamp DESC LIMIT 1');
        if (rows.length > 0) {
            res.write(`data: ${JSON.stringify(rows[0])}\n\n`);
        }
    };

    await sendLatestData();
    const interval = setInterval(sendLatestData, 10000);

    req.on('close', () => {
        clearInterval(interval);
        connection.end();
        res.end();
    });
}
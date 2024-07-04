import mysql from 'mysql2/promise';

export default async function handler(req, res) {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    const [rows] = await connection.execute(`
    SELECT AVG(humidity) as avgHumidity 
    FROM environment_data 
    WHERE timestamp >= ? AND timestamp <= ?`,
        [threeHoursAgo.toISOString().slice(0, 19).replace('T', ' '), now.toISOString().slice(0, 19).replace('T', ' ')]
    );

    await connection.end();

    if (rows.length > 0 && rows[0].avgHumidity !== null) {
        res.status(200).json({ avgHumidity: rows[0].avgHumidity });
    } else {
        res.status(200).json({ avgHumidity: 0 });
    }
}

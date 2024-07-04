import mysql from 'mysql2/promise';

export default async function handler(req, res) {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    // Get the current UTC time and 30 minutes ago in UTC
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Convert to MySQL compatible format in UTC
    const nowString = now.toISOString().slice(0, 19).replace('T', ' ');
    const thirtyMinutesAgoString = thirtyMinutesAgo.toISOString().slice(0, 19).replace('T', ' ');

    console.log(`Current time (UTC): ${nowString}`);
    console.log(`30 minutes ago (UTC): ${thirtyMinutesAgoString}`);

    const [rows] = await connection.execute(`
    SELECT AVG(humidity) as avgHumidity 
    FROM environment_data 
    WHERE timestamp >= ? AND timestamp <= ?`,
        [thirtyMinutesAgoString, nowString]
    );

    console.log(`Query returned: ${JSON.stringify(rows)}`);

    await connection.end();

    if (rows.length > 0 && rows[0].avgHumidity !== null) {
        res.status(200).json({ avgHumidity: rows[0].avgHumidity });
    } else {
        res.status(200).json({ avgHumidity: 0 });
    }
}

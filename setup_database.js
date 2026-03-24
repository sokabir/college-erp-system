const { Client } = require('pg');
const fs = require('fs');

// External database URL from Render
const DATABASE_URL = 'postgresql://college_erp_user:jVSJww6q5IpdPjH7tXJX499ECtPVfQs7@dpg-d6q4e4p5pdvs738pbfq0-a.singapore-postgres.render.com/college_erp_2898';

async function setupDatabase() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected successfully!');

        console.log('Reading SQL file...');
        const sql = fs.readFileSync('database_setup_postgresql.sql', 'utf8');

        console.log('Executing SQL commands...');
        await client.query(sql);

        console.log('✅ Database setup completed successfully!');
        console.log('Demo credentials:');
        console.log('  Admin: admin@college.edu / admin123');
        console.log('  Faculty: rajesh.verma@faculty.edu / faculty');
        console.log('  Student: kabilkamble101@gmail.com / student');

    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        console.error(error);
    } finally {
        await client.end();
        console.log('Database connection closed.');
    }
}

setupDatabase();

import { Client } from 'pg';

async function main(){
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } as any });
  try{
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('pg connected, now:', res.rows[0]);
  }catch(err){
    console.error('pg error:', err);
  }finally{
    await client.end();
  }
}

main();

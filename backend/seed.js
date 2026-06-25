const { pool } = require('./db');

const TARGET_COUNT = 200000;
const BATCH_SIZE = 5000;

const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Toys', 'Sports', 'Automotive', 'Beauty'];
const adjectives = ['Awesome', 'Sleek', 'Durable', 'Portable', 'Vintage', 'Modern', 'Compact', 'Premium'];
const nouns = ['Widget', 'Device', 'Tool', 'Gadget', 'Machine', 'Accessory', 'System', 'Engine'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  console.log('Connecting to database...');
  const client = await pool.connect();

  try {
    console.log('Dropping existing table if needed...');
    await client.query(`DROP TABLE IF EXISTS products;`);

    console.log('Creating products table...');
    await client.query(`
      CREATE TABLE products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Creating optimized indexes for cursor pagination...');
    // Index for fetching all products (no category filter)
    await client.query(`
      CREATE INDEX idx_products_created_id ON products (created_at DESC, id DESC);
    `);
    // Index for fetching products filtered by category
    await client.query(`
      CREATE INDEX idx_products_category_created_id ON products (category, created_at DESC, id DESC);
    `);

    console.log(`Starting to insert ${TARGET_COUNT} products in batches of ${BATCH_SIZE}...`);
    
    // We will spread the created_at across the last 30 days so we can test ordering
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    let totalInserted = 0;

    for (let i = 0; i < TARGET_COUNT; i += BATCH_SIZE) {
      const values = [];
      const flatParams = [];

      for (let j = 0; j < BATCH_SIZE && (i + j) < TARGET_COUNT; j++) {
        const name = `${getRandomItem(adjectives)} ${getRandomItem(nouns)} ${Math.floor(Math.random() * 1000)}`;
        const category = getRandomItem(categories);
        const price = (Math.random() * 900 + 10).toFixed(2); // Price between 10 and 910
        
        // Distribute created_at randomly within the last 30 days
        const randomTime = new Date(now - Math.random() * thirtyDaysMs).toISOString();

        const offset = j * 5;
        values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`);
        
        flatParams.push(name, category, price, randomTime, randomTime);
      }

      const queryText = `
        INSERT INTO products (name, category, price, created_at, updated_at)
        VALUES ${values.join(',')}
      `;

      await client.query(queryText, flatParams);
      totalInserted += BATCH_SIZE;
      
      // Keep console output clean by replacing the line
      process.stdout.write(`\rInserted ${totalInserted} / ${TARGET_COUNT} products`);
    }

    console.log('\n✅ Seeding complete!');

  } catch (err) {
    console.error('\n❌ Error seeding data:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();

const { query } = require('./db');

async function addFifty() {
  console.log('Adding 50 new products...');
  
  try {
    const values = [];
    const flatParams = [];

    // Generate 50 products
    for (let i = 0; i < 50; i++) {
      const name = `Live Test Product ${Math.floor(Math.random() * 10000)}`;
      const offset = i * 5;
      
      values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`);
      flatParams.push(name, 'Electronics', (Math.random() * 100 + 10).toFixed(2), new Date(), new Date());
    }

    const sql = `
      INSERT INTO products (name, category, price, created_at, updated_at)
      VALUES ${values.join(',')}
    `;
    
    await query(sql, flatParams);
    
    console.log('✅ Successfully added 50 new products!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error adding products:', err);
    process.exit(1);
  }
}

addFifty();

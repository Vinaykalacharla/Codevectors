const { query } = require('./db');

async function addProduct() {
  const name = process.argv[2] || 'Live Interview Test Product';
  
  try {
    const sql = `
      INSERT INTO products (name, category, price, created_at, updated_at)
      VALUES ($1, 'Electronics', 99.99, NOW(), NOW())
      RETURNING *;
    `;
    const { rows } = await query(sql, [name]);
    
    console.log('✅ Successfully added new product:');
    console.log(rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error adding product:', err);
    process.exit(1);
  }
}

addProduct();

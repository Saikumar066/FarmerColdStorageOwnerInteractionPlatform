const sequelize = require('./config/database');
const { ColdStorage } = require('./models');

async function updateSchema() {
  try {
    console.log('🔄 Updating database schema...');
    
    // This will update the table structure to match the model
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database schema updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to update schema:', error);
    process.exit(1);
  }
}

updateSchema();

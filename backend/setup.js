const setupDatabase = require('./config/setupDatabase');
setupDatabase().then(() => {
  console.log('Setup complete!');
  process.exit(0);
}).catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
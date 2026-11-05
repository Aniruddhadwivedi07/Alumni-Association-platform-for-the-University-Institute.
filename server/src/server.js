require('dotenv').config();
const { createApp } = require('./app');

const app = createApp();
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error(`Server error: ${err.message}`);
});



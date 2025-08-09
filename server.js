const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config({ debug: false });
connectDB();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




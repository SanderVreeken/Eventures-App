const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

mongoose.connect(process.env._MONGODB_BASE_URL, { useNewUrlParser: true } );
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
  console.error(err);
});

require('./models/Event');
require('./models/User');

const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express is running on port ${server.address().port}.`);
});
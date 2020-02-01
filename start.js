const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

var options = { 
  server: { 
    socketOptions: { 
      keepAlive: 300000, 
      connectTimeoutMS: 30000 
    } 
  }, 
  replset: { 
    socketOptions: { 
      keepAlive: 300000, 
      connectTimeoutMS : 30000 
    } 
  } 
};

mongoose.connect(process.env._MONGODB_BASE_URL, options);
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
  console.error(err);
});

const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express is running on port ${server.address().port}.`);
});
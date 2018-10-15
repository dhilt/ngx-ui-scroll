const path = require('path');
const express = require('express');
const app = express();

// Heroku automagically gives us SSL
// Lets write some middleware to redirect us
const env = process.env.NODE_ENV || 'development';

const forceSSL = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  return next();
};

if (env === 'production') {
  app.use(forceSSL);
}

// Serve static files
app.use(express.static(__dirname + '/../dist'));

// Send all requests to index.html
app.get('/*', (req, res) =>
  res.sendFile(path.join(__dirname + '/../dist/index.html'))
);

// default Heroku port
const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`Listening ${port} port...`)
);

const path = require('path');
const express = require('express');
const app = express();

const env = process.env.NODE_ENV || 'development';

if (env === 'production') {
  const forceSSL = (req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    return next();
  };
  app.use(forceSSL);
}

// Serve static files
app.use(express.static(__dirname + '/../dist/demo'));

const data = [];
for (let i = 1; i < 1000; i++) {
  data.push({
    index: i,
    text: 'item #' + i
  });
}

const MIN = -99;
const MAX = 900;

app.get('/api/data', (req, res) => {
  const index = parseInt(req.query.index, 10);
  const count = parseInt(req.query.count, 10);
  if (isNaN(index) || isNaN(count)) {
    return res.send([]);
  }
  const start = Math.max(MIN, index);
  const end = Math.min(index + count - 1, MAX);
  if (start > end) {
    return res.send([]);
  }
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push({ id: i, text: 'item #' + i });
  }
  res.send(result);
});

// Send all requests to index.html
app.get('/*', (req, res) =>
  res.sendFile(path.join(__dirname + '/../dist/demo/index.html'))
);
// default Heroku port
const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`Listening ${port} port...`)
);

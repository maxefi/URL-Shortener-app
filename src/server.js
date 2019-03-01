const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dns = require('dns');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(htmlPath);
});

app.set('port', process.env.PORT || 4100);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});

app.post('/new', (req, res) => {
  let originalUrl;

  try {
    // node v11+
    originalUrl = new URL(req.body.url);
  } catch (err) {
    return res.status(400).send({ error: 'invalid URL' });
  }

  dns.lookup(originalUrl.hostname, err => {
    if (err) {
      return res.status(404).send({ error: 'Address not found' });
    }
  });
});

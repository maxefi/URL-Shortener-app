require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dns = require('dns');
const { MongoClient } = require('mongodb');
const nanoid = require('nanoid');
const { promisify } = require('es6-promisify');

const databaseUrl = process.env.DATABASE;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

MongoClient
  .connect(databaseUrl, { useNewUrlParser: true })
  .then(client => {
    app.locals.db = client.db('shortener');
  })
  .catch(() => console.error('Failed to connect to the database'));

const shortenURL = (db, url) => {
  const shortenedURLs = db.collection('shortenedURLs');
  return shortenedURLs.findOneAndUpdate({ original_url: url },
    {
      $setOnInsert: {
        original_url: url,
        short_id: nanoid(7),
      },
    },
    {
      returnOriginal: false,
      upsert: true,
    },
  );
};

const checkIfShortIdExists = (db, code) => {
  return db.collection('shortenedURLs').findOne({ short_id: code });
};

app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(htmlPath);
});

app.set('port', process.env.PORT || 4100);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});

app.post('/new', async (req, res) => {
  let originalUrl;

  try {
    // node v11+
    originalUrl = new URL(req.body.url);
  } catch (err) {
    console.error(err);

    return res.status(400).send({ error: 'invalid URL' });
  }

  try {
    const dnsLookupWithPromise = promisify(dns.lookup);
    await dnsLookupWithPromise(originalUrl.hostname);

    const { db } = req.app.locals;

    const result = await shortenURL(db, originalUrl.href);

    const doc = result.value;

    res.json({
      original_url: doc.original_url,
      short_id: doc.short_id,
    });
  } catch (err) {
    console.error(err);

    return res.status(404).send({ error: 'Address not found' });
  }
});

app.get('/:short_id', async (req, res) => {
  const shortId = req.params.short_id;
  const { db } = req.app.locals;

  try {
    const doc = await checkIfShortIdExists(db, shortId);

    if (doc === null) return res.send('Uh oh. We could not find a link at that URL');

    res.redirect(doc.original_url);
  } catch (err) {
    console.error(err);
  }
});

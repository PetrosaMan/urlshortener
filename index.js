require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const validator = require('validator');

const app = express();
const port = process.env.PORT || 3000;

// Create urlSchema
const urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true },
  short_url: { type: Number, required: true }
});

// Create a schema model
const Url = mongoose.model('Url', urlSchema);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
      console.log("Connected to MongoDB");
  })
  .catch(() => {
      console.log("Couldn't connect to MongoDB");
  });

// Create and save a document instance of a url
function createAndSaveUrl(originalUrl, shortUrl) {
  let url = new Url({ original_url: originalUrl, short_url: shortUrl });
  console.log(url.original_url, "  ", url.short_url);
  url.save()
    .then(() => {
      console.log("Url saved successfully");
    })
    .catch((err) => {
      console.error("Error saving url:", err);
    });
}

let originalUrl = 'http://davidTodd.com';
let shortUrl = 3;
createAndSaveUrl(originalUrl, shortUrl);

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// URL validation
const validateUrl = (req, res, next) => {
  const { url } = req.body;
  if (!validator.isURL(url)) {
    return res.status(400).json({ error: "Invalid url" });
  }
  next();
}

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', validateUrl, function (req, res) {
  console.log(req.body);
  let original_url = req.body.url;
  let short_url;
  res.json({ original_url: original_url, short_url: "Todo" });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  let short_url = req.params.short_url
  res.json({ Hello: parseInt(short_url) });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

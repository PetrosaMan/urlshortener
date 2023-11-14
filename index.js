require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const validator = require('validator');


const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.urlencoded({extended: false}));
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// URL validation
const validateUrl = (req, res, next) => {
  const { url } = req.body;
  if (!validator.isURL(url)) {
    return res.status(400).json({ error: "Invalid url"});
  }
  next();
}




app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// Your first API endpoint
app.post('/api/shorturl',validateUrl, function(req, res) {
  console.log(req.body);
  let original_url = req.body.url;
  let short_url;
  res.json({ "original_url": original_url, "short_url": "Todo" });  

});

app.get('/api/shorturl/:short_url', (req, res) => {
  let short_url = req.params.short_url
  res.json({Hello: parseInt(short_url)});
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

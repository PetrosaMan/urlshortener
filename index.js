require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const validator = require('validator');

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
  const Url = new Url({ original_url: originalUrl, short_url: shortUrl });
  //console.log(Url.original_url, "  ", Url.short_url);
  Url.save()
    .then(() => {
      console.log("Url saved successfully");
    })
    .catch((err) => {
      console.error("Error saving url:", err);
    });
}

// Middleware
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// URL validation
const validateUrl = (req, res, next) => {
  const { url } = req.body;
  if (!validator.isURL(url)) {
    return res.status(400).json({ error: "invalid url" });    
  }
  next();
}

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', validateUrl, async function (req, res) {  
  
  try {
    let originalUrl = req.body.url;
       
    // Get the current maximum short_url number + 1 this short_url
    let urls = await Url.find().sort({short_url: "desc"});
    let shortUrl = urls[0].short_url + 1;         

    // Create and save the document
    let url = new Url({ original_url: originalUrl, short_url: shortUrl });
    await url.save();
   
    // Respond with the result
    res.json({ original_url: originalUrl, short_url: shortUrl }); 

  } catch (err) {
    // Handle errors
    res.status(500).json({ error: "Internal server error" });
  }   
});

app.get('/api/shorturl/:short_url',  async (req, res) => {
  let shortUrl = req.params.short_url;    
  const url = await Url.findOne({short_url: shortUrl});  
  res.redirect(url.original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
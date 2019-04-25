//////////////////////
// Server and database ORM framework
const express = require("express");
const mongoose = require("mongoose");
const mongojs = require('mongojs');

// Our scraping tools
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

const PORT = process.env.PORT || 3003;

// Initialize Express
const app = express();

// Configure middleware

// Use morgan logger for logging requests
// app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);
// Routes

// A GET route for scraping the echoJS website TODO: edit to scrape what I want
app.get("/scrape", (req, res) => {
  // First, we grab the body of the html with axios
  axios.get("https://www.surfline.com/surf-news/").then(response => {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    const $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".post .item").each((i, element) => {
      // Save an empty result object
      const result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element).children('a').children('.headline').children('h4').text();
      result.link = $(element).children('.overlay-link').attr('href');
      result.image = $(element).children('.thumbnail').children('.wp-post-image').attr('src');
      console.log('\n__________________*********______________');
      console.log('Title:' + result.title);
      console.log('The image src ' + result.image);
      console.log('The link ' + result.link);


      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(dbArticle => {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(err => {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

app.get("/clear", (req, res) => {
  db.Article.deleteMany({}).then(dbArticle => {
    res.send("deleted");
  })
});

// Route for getting all Articles from the db // need to edit TODO:
app.get("/articles", (req, res) => {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(dbArticle => {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(err => {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/saved", (req, res) => {
  // Grab only saved documents
  db.Article.find({ saved: true })
    .then(dbArticle => {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(err => {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.post("/save/:id", (req, res) => {

  // Update the note that matches the object id
  db.Article.update(
    {
      _id: mongojs.ObjectId(req.params.id)
    },
    {
      // Set the title, note and modified parameters
      // sent in the req body.
      $set: {
        saved: true
      }
    },
    (error, edited) => {
      // Log any errors from mongojs
      if (error) {
        console.log(error);
        res.send(error);
      }
      else {
        // Otherwise, send the mongojs response to the browser
        // This will fire off the success function of the ajax request
        console.log(edited);
        res.send(edited);
      }
    }
  );
});





// Start the server
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});

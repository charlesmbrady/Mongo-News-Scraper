//////////////////////
// Server and database ORM framework
const express = require("express");
const mongoose = require("mongoose");

// Our scraping tools
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

const PORT = 3003;

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
//////////TEST?????????????
// Create an object containing dummy data to save to the database
const data = {
  title: 'the GOAT title1',
  link: 'link article here',
  image: 'link to image'
};

// Save a new Example using the data object
db.Article.create(data)
  .then(dbExample => {
    // If saved successfully, print the new Example document to the console
    console.log(dbExample);
  })
  .catch(err => {
    // If an error occurs, log the error message
    console.log(err.message);
  });

/////////////endTEST?????????????

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





// Start the server
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});

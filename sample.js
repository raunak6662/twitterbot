const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Twitter = require("twitter-lite");
app.use(bodyParser.urlencoded({extended: true}))
require('dotenv').config();

// api_key and api_secret from .env file
const api_key = process.env.API_KEY;
const api_secret = process.env.API_SECRET;

app.get("/", function(req, res){
    res.sendFile(__dirname + "/front.html");
});

app.post("/", function(req, res){
    var x = req.body.name;

    // Wrap the following code in an async function that is called
// immediately so that we can use "await" statements.
(async function() {
    //App authentication
    const user = new Twitter({
        consumer_key: api_key,
        consumer_secret: api_secret
    });

    try {
        let response = await user.getBearerToken();
        const app1 = new Twitter({
            bearer_token: response.access_token,
        });

        // Search for recent tweets from the twitter API
        response = await app1.get(`/search/tweets`, {
            q: x, // The search term
            lang: "en",        // Let's only get English tweets
            count: 100,        // Limit the results to 100 tweets
        });

        // Loop over all the tweets and print the text
        for (tweet of response.statuses) {
            console.dir(tweet.text);
        }
    } catch(error) {
        console.log("There was an error calling the Twitter API");
        console.dir(error);
    }
})();

    res.send("thanks");
});



app.listen("3000", function(){
    console.log("Server is running at port 3000.");
});
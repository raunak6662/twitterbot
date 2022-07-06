const express = require("express");
const bodyParser = require("body-parser");
const Twitter = require("twitter-lite");
const language = require('@google-cloud/language');

const languageClient = new language.LanguageServiceClient();

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}))
require('dotenv').config();
app.use(express.static("public"));
// api_key and api_secret from .env file
const api_key = process.env.API_KEY;
const api_secret = process.env.API_SECRET;

// to get all tweets at one place
let allTweets = "";
// define the get route
app.get("/", function(req, res){
    res.render("rs");
});

//define the post route
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
            q: x,              // The search term
            lang: "en",        // Let's only get English tweets
            count: 100,        // Limit the results to 100 tweets
        });

        // Loop over all the tweets and print the text
        for (tweet of response.statuses) {
            // console.dir(tweet.text);
            allTweets += tweet.text + "\n";
        }
        //console.log(allTweets);
        var sentimentScore = await getSentimentScore(allTweets);
        //console.log(sentimentScore);
        if(sentimentScore < 0){
            res.render("negative", {sentimentScore: sentimentScore});
        }else{
            res.render("positive", {sentimentScore: sentimentScore});
        }
        //res.send("The sentimental score is " + sentimentScore);
        //res.send("Thanks");
    } catch(error) {
        console.log("There was an error calling the Twitter API");
        console.dir(error);
    }
})();
});

async function getSentimentScore(text) {
    const document = {
        content: text,
        type: 'PLAIN_TEXT',
    };

    // Detects the sentiment of the text
    const [result] = await languageClient.analyzeSentiment({document: document});
    const sentiment = result.documentSentiment;

    return sentiment.score;
}
let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}
app.listen(port, function(){
    console.log("Server is running at port 3000.");
});
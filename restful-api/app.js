const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/wikiDB", {useNewUrlParser: true});

const articleSchema = new mongoose.Schema({
    title: String,
    content: String
});

const Article = mongoose.model("Article", articleSchema);

app.get("/gruli", function(req, res){
    console.log("hmm");
    res.send("<h1> Olá </h1>");
});

//************************************ */
//Targets ALL elements 
//
app.route("/articles")
    .get(function(req, res){
        Article.find(function(err, foundArticles){
            if(!err){
                res.send(foundArticles);
            }else{
                res.send(err);
            }
        });
    })

    .post(function (req, res) {

        const newArticle = new Article({
            title: req.body.title,
            content:req.body.content
        });

        newArticle.save(function(err){
            if (!err){
                res.send("Added a new article");
            }else{
                res.send(err);
            }
        });
    })

    .delete(function(req, res){
        Article.deleteMany({}, function(err){
            if (!err){
                res.send("All articles has been deleted");
            }else{
                res.send("Failed to delete articles")
            }
        });
    });


//************************************ */
//Targets single elements 
//

app.route("/articles/:articleTitle")
    .get(function(req, res){
        Article.findOne({title: req.params.articleTitle}, function(err, foundArticle){
            if (foundArticle){
                res.send(foundArticle);
            }else{
                res.send("No articles with that title!");
            }
        });
    })
    
    .put(function (req, res) {
        Article.updateOne({title: req.params.articleTitle}, {title: req.body.title, content:req.body.content}, function (err, updatedArticle) {
            if (!err){
                res.send("Updated with sucess");
            }else{
                res.send("Could not update");
            }
        });
    })

    .patch(function (req, res) {
        Article.updateOne({title: req.params.articleTitle}, {$set: req.body}, function (err, updatedArticlePat) {
            if (!err){
                res.send("updated with sucess");
            }else{
                res.send(err);
            }
        })
    })
    
    .delete(function (req, res) {
        Article.deleteOne({title: req.params.articleTitle}, function (err, deletedArticle) {
            if (!err){
                res.send("Sucess on deleting article")
            }else{
                res.send(err);
            }
        })
    });


app.listen(3000, function(){
    console.log("Rodando RRRRRRRRRR");
});
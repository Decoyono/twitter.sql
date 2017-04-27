'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var postgresClient = require('../db/index')
const SELECT_ALL_FROM = 'SELECT * FROM' ;
const INSERT_INTO = 'INSERT INTO';

module.exports = router;

// a reusable function
function respondWithAllTweets (req, res, next){

    postgresClient.query('SELECT name,content FROM users INNER JOIN tweets on tweets.user_id = users.id' ,function (err,result) {
      if(err) return err;
        res.render('index', {
            title: 'Twitter.js',
            tweets: result.rows,
            showForm: true
        });
    })
}

function insertIntoStatment(res,user_id,content) {

  postgresClient.query("INSERT INTO tweets (user_id,content) VALUES ($1,$2)",[user_id,content] ,function (err,result) {
    if(err) return err;
        res.redirect('/');
    })
}

// here we basically treet the root view and tweets view as identical
router.get('/', respondWithAllTweets);
router.get('/tweets', respondWithAllTweets);



// SELECT content 
//from users inner join tweets on users.id = tweets.id 
//WHERE name=TOM HANKS
router.get('/users/:username', function(req, res, next){
  var name = req.params.username;
  postgresClient.query('SELECT name,content FROM users INNER JOIN tweets on tweets.user_id = users.id WHERE name=$1',[name] ,function (err,result) {
      if(err) return err;
      console.log(result.rows)
      res.render('index', {
        title: 'Twitter.js',
        tweets: result.rows,
        showForm: true,
        username: req.params.username
   });
  })
  // var tweetsForName = tweetBank.find({ name: req.params.username });
  
});

// single-tweet page
router.get('/tweets/:id', function(req, res, next){
  var id = req.params.id;
  postgresClient.query(`${SELECT_ALL_FROM} tweets WHERE tweets.id=$1`,[id] ,function (err,result) {
      if(err) return err;
        res.render('index', {
            title: 'Twitter.js',
            tweets: result.rows,
            showForm: true
        });
    })
});

// create a new tweet
router.post('/tweets', function(req, res, next){
  var body = req.body;
   postgresClient.query('SELECT users.id FROM users WHERE name=$1',[body.name] ,function (err,result) {
      if(err) return err;
      if(!result.rows.length){     
        postgresClient.query(`${INSERT_INTO} users (name,picture_url) VALUES ($1,$2)`,[body.name,"TEST URL"] ,function (err,result) {
          if(err) return err;
         
          postgresClient.query('SELECT users.id FROM users WHERE name=$1',[body.name],function (err,result) {
               if(err){
                console.log(err)
                return err;
               }      
                insertIntoStatment(res,result.rows[0].id,body.content)   
            });
        });
      
      }else{
        insertIntoStatment(res,result.rows[0].id,body.content)  
      }

  })

});

// // replaced this hard-coded route with general static routing in app.js
// router.get('/stylesheets/style.css', function(req, res, next){
//   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
// });

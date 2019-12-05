var express = require('express');

var path = require('path');

var request = require('request');

var cheerio = require('cheerio');

var router = express.Router();

var mongoose = require('mongoose');

var Promise = require("bluebird");



mongoose.Promise = Promise;



var Articles = require("../models/articles");

var Comments = require("../models/comments");



var url = "http://www.goodnewsnetwork.org/latest-news/";



router.get('/test', function(req, res) {

    request(url, function(error, response, html) {


        var $ = cheerio.load(html);

		var result = [];

		$(".fiveMuch").each(function(i, element) {

			var title = $(element).find("a").find("img").attr("title");

			var story = $(element).find("a").attr("href");

			var img = $(element).find("a").find("img").attr("src");

			var summary = $(element).find(".td-post-text-excerpt").text();

			summary = summary.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();

			result.push({ 

				Title: title,

				Story: story,

				Link: img,

				Summary: summary

			});

		});

		console.log(result);

		res.send(result);

    });

});



router.get('/', function(req, res){

	res.render('index');

});



router.get('/scrape', function(req, res){

    request(url, function(error, response, html) {	

        var $ = cheerio.load(html);

		var result = [];

	

		$(".fiveMuch").each(function(i, element) {

		    var title = $(element).find("a").find("img").attr("title");

		    var img = $(element).find("a").find("img").attr("src");

		    var story = $(element).find("a").attr("href");

		    var summary = $(element).find(".td-post-text-excerpt").text();

		    summary = summary.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();

			result[i] = ({ 

				title: title,

				img: img,

				story: story,

				summary: summary

			});	


			Articles.findOne({'title': title}, function(err, articleRecord) {

				if(err) {

					console.log(err);

				} else {

					if(articleRecord == null) {

						Articles.create(result[i], function(err, record) {

							if(err) throw err;

							console.log("Record Added");

						});

					} else {

						console.log("No Record Added");

					}					

				}

			});	

		});

    });	

});



router.get('/articles', function(req, res){

	Articles.find().sort({ createdAt: -1 }).exec(function(err, data) { 

		if(err) throw err;

		res.json(data);

	});

});





router.get('/comments/:id', function(req, res){

	Comments.find({'articleId': req.params.id}).exec(function(err, data) {

		if(err) {

			console.log(err);

		} else {

			res.json(data);

		}	

	});

});



router.post('/addcomment/:id', function(req, res){

	console.log(req.params.id+' '+req.body.comment);

	Comments.create({

		articleId: req.params.id,

		name: req.body.name,

		comment: req.body.comment

	}, function(err, docs){    

		if(err){

			console.log(err);			

		} else {

			console.log("Add new comment");

		}

	});

});



router.get('/deletecomment/:id', function(req, res){

	console.log(req.params.id)

	Comments.remove({'_id': req.params.id}).exec(function(err, data){

		if(err){

			console.log(err);

		} else {

			console.log("Comment deleted");

		}

	})

});



module.exports = router;
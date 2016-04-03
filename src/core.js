import feedRead from 'feed-read'
import sources from '../data/sources'
import mongoose from 'mongoose'

module.exports = class Core{
	constructor(){
		let Schema = mongoose.Schema
		let url = `mongodb://kcuser:kcpass@aws-us-east-1-portal.14.dblayer.com:10999/rssfeeds`
		// let url = `mongodb://localhost:27017/newsFeeds`

		var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };       
 

		let rssSchema = new Schema({
											title: String,
											content: String,
											published: Date,
											author: String,
											link: String,
											feed: {source: String, link: String, name: String}
										}, {collection: 'rssFeed'})

		mongoose.connect(url, options)

		mongoose.connection.on('connected', function () {  
		  console.log('Mongoose connection open to ' + url);
		})

		mongoose.connection.on('error',function (err) {  
		  console.log('Mongoose connection error: ' + err);
		}); 

		mongoose.connection.on('disconnected', function () {  
		  console.log('Mongoose default connection disconnected'); 
		});

		this.rssFeedModel = mongoose.model('rssFeed', rssSchema)
	}

	checkArticleExists(article){
		var allFeedDataPromise = new Promise((resolve, reject) => {
			this.rssFeedModel.find({published: article.published}, (err, data) => {
					if(err) reject(err)
					if(data.length != 0) resolve(true)
					resolve(false)
			})
		})
		return allFeedDataPromise
	}

	saveArticlesToDB(){
		let saveArticlesPromise = new Promise((resolve, reject) => {
			sources.forEach(source => {
				feedRead(source, (err, articles) => {
					if(err) reject(err)
					articles.forEach(article => {
						this.checkArticleExists(article).then(exists => {
							if(!exists)
							{
								let brIndex = article.content.indexOf(`<br clear='all'/>`)
								if(brIndex != -1)
									article = {...article, content: article.content.substring(0, brIndex)}
								let saveArticle = new this.rssFeedModel(article)
								saveArticle.save()
							}
						}, err => reject(err))
					})
					resolve('articles saved')
				})
			})
		})
		return saveArticlesPromise
	}

	getAllRSSData(){
		
		var allFeedDataPromise = new Promise((resolve, reject) => {
			this.saveArticlesToDB().then(result => {
				console.log(result)
				this.rssFeedModel.find({}, (err, data) => {
					if(err) reject(err)
					else resolve(data)
				})
			}, err => console.log(err))
		})
		return allFeedDataPromise
	}
}
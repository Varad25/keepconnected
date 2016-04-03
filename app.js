var express = require('express')
var app = express()
var Core = require('./src/core.js')

app.use(function(req, res, next){
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type')
	// res.setHeader('Access-Control-Allow-Credentials', true);
	next()
})

let core = new Core()
core.saveArticlesToDB().then(result => console.log(result),
														err => console.log(err))

app.get('/getAllRSSData',function(req, res){
	core.getAllRSSData().then(result => {
		res.send(result)
	}, err => res.send(err))
})


app.listen(3010, function(req,res){
	// console.log(require('./src/core.js'))
	console.log('Listening on port 3010...')
})
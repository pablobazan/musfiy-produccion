'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//carga de rutas
var user_routes = require('./routes/user');
var artist_routes = require('./routes/artist');
var album_routes = require('./routes/album');
var song_routes = require('./routes/song');
//var album_routes = require('./routes/album');
//var image_routes = require('./routes/image');



app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


//configurar cabeceras
app.use((req, res, next)=>{

	res.header('Access-Control-Allow-Origin', '*'); //El segundo parametro es para indicar de que página admite peticione la API
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

	next();

});

//rutas base
//app.use(express.static(path.join(__dirname, 'client'))) cargar fichero estatico
app.use('', express.static('client', {redirect: false})); //cargar el fichero de angular estatico
app.use('/api', user_routes);
app.use('/api', artist_routes);
app.use('/api', album_routes);
app.use('/api', song_routes);
app.get('/prueba', function(req, res)
{
	res.status(200).send({message: "Bienvenido al curso"});
})
//app.use('/api', album_routes)
//app.use('/api', image_routes)

module.exports = app;
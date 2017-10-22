'use strict'

var mongoose = require("mongoose");
var app = require('./app');

var port = process.env.PORT || 3977;

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/musify', (err, res)=>{
		if(err)
		{
			throw err;
		}
		else
		{
			console.log("La base de datos esta conectada correctamente");

			app.listen(port, function()
			{
				console.log("El servidor esta corriendo en http://localhost:" + port);
			});
		}
	});

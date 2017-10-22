'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');


function getArtist(req, res)
{

	var artistId = req.params.id;

	Artist.findById(artistId, (err, artist)=>{
		if(err)
		{
			res.status(500).send({message: 'Error en la peticion de getArtist'});
		}
		else
		{
			if(!artist)
			{
				res.status(404).send({message: 'El artista no existe'});

			}
			else
			{
				res.status(200).send({artist: artist});
			}
		}
	});

}

function getArtists(req, res)
{

	if(req.params.page)
	{
		var page = req.params.page;
	}
	else
	{
		var page = 1;
	}

	
	var itemsPerPage = 12;

	Artist.find().sort('name').paginate(page, itemsPerPage, function(err, artists, totalItems){
		if(err)
		{
			res.status(500).send({message: 'Error en la peticion de getArtists'});
		}
		else
		{
			if(!artists)
			{
				res.status(404).send({message: 'No hay artistas'});
			}
			else
			{
				return res.status(200).send({ 
					total_items: totalItems,
					artists: artists
				});
			}
		}
	})

}

function getAllArtists(req, res) //Obtener todos los artistas - tessssssst
{
	

	Artist.find().sort('name').exec((err, artists)=>{
		if(err)
		{
			res.status(500).send({message: 'Error en la peticion de getArtists'});
		}
		else
		{
			if(!artists)
			{
				res.status(404).send({message: 'No hay artistas'});
			}
			else
			{
				return res.status(200).send({artists});
			}
		}
	});

}

function saveArtist(req, res)
{
	var artist = new Artist();

	var params = req.body;
	artist.name = params.name;
	artist.description = params.description;
	artist.image = 'null';

	artist.save((err, artistStored)=>{
		if(err)
		{
			res.status(500).send({message: 'Error al guardar el artista'});
		}
		else
		{
			if(!artistStored)
			{
				res.status(404).send({message: 'El artista no ha sido guardado'});
			}
			else
			{
				res.status(200).send({artist: artistStored});
			}
		}
	});
}

function updateArtist(req, res)
{
	
	var artistId = req.params.id;
	var update = req.body;

	Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated)=>{

		if(err)
		{
			res.status(500).send({message: 'Error al actualizar el artista'});
		}
		else
		{
			if(!artistUpdated)
			{
				res.status(404).send({message: 'El artista no existe'});
			}
			else
			{
				res.status(200).send({artist: artistUpdated});
			}
		}

	});

}

function deleteArtist(req, res)
{
	var artistId = req.params.id;

	Artist.findByIdAndRemove(artistId, (err, artistRemoved)=>{

		if(err)
		{
			res.status(500).send({message: 'Error al borrar el artista'});
		}
		else
		{
			if(!artistRemoved)
			{
				res.status(404).send({message: 'Error el artista no fue eliminado porque probablemente no exista'});
			}
			else
			{

				Album.find({artist: artistRemoved._id}).remove((err, albumRemoved)=>{

					if(err)
					{
						res.status(500).send({message: 'Error al borrar el album'});
					}
					else
					{
						if(!albumRemoved)
						{
							return res.status(200).send({artist: artistRemoved});
						}
						else
						{
							Song.find({album: albumRemoved._id}).remove((err, songRemoved)=>{

									if(err)
									{
										res.status(500).send({message: 'Error al borrar la canción'});
									}
									else
									{
										return res.status(200).send({artist: artistRemoved});
									}
							});					
						}	
					}
				});
			}
		}

	});
}

function uploadImage(req, res)
{
	var artistId = req.params.id;
	var file_name = 'No subido';

	if(req.files)
	{
		var file_path = req.files.image.path;
		var file_split = file_path.split('/');
		var file_name = file_split[2];
		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		console.log(file_path);

		if(file_ext == 'png' || file_ext == 'jpg'  || file_ext == 'gif')
		{
			Artist.findByIdAndUpdate(artistId, {image: file_name}, (err, artistUpdated)=>{
				if(err)
				{
					res.status(500).send({message: 'No se ha podido actualizar la imagen del artista'});
				}
				else
				{
					if(!artistUpdated)
					{
						res.status(404).send({message: 'El artista no ha sido encontrado'});
					}
					else
					{
						res.status(200).send({artist: artistUpdated});
					}
				}
			
			});
		}
		else
		{
			res.status(200).send({message: 'Extension del archivo no valida'});
		}
	}
	else
	{
		res.status(200).send({message: 'No se ha subido ninguna imagen'});
	}
}


function getImageFile(req, res)
{
	var imageFile = req.params.imageFile;
	var path_file = './uploads/artists/' + imageFile;

	//console.log(path_file);

	fs.exists(path_file, (exists) =>{
		if(exists)
		{
			res.sendFile(path.resolve(path_file));
		}
		else
		{
			res.status(200).send({message: 'No existe la imagen'});
		}
	})
}


module.exports = {

	getArtist,
	getAllArtists,
	getArtists,
	updateArtist,
	deleteArtist,
	uploadImage,
	getImageFile,
	saveArtist

};
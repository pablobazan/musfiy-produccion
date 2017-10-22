'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getAlbum(req, res)
{

	var AlbumId = req.params.id;

	Album.findById(AlbumId).populate({path: 'artist'}).exec((err, album)=>{

		if(err)
		{
			res.status(500).send({message: 'Error en la peticion populate de Album'});
		}
		else
		{
			if(!album)
			{
				res.status(404).send({message: 'Album no existente'});
			}
			else
			{
				res.status(200).send({album: album});
			}
			
		}
	});

}

function getAlbums(req, res)
{

	var artistId = req.params.artist;

	if(!artistId)
	{
		//sacar todos los albums
		var find = Album.find({}).sort('title');
		
	}
	else
	{
		//sacar de un artaste especifico
		var find = Album.find({artist: artistId}).sort('year');
	}

	find.populate({path: 'artist'}).exec((err, albums)=>{

		if(err)
		{
			res.status(500).send({message: 'Error en la peticion populate de Albums'});
		}
		else
		{
			if(!albums)
			{
				res.status(404).send({message: 'No hay albums'});
			}
			else
			{
				res.status(200).send({albums});
			}
		}

	});
}

function saveAlbum(req, res)
{

	var album = new Album();

	var params = req.body;
	album.title = params.title;
	album.description = params.description;
	album.year = params.year;
	album.image = 'null';
	album.artist = params.artist;

	album.save((err, albumStored)=>{
		if(err)
		{
			return res.status(500).send({message: 'Error al guardar el album'});
		}
		else
		{
			if (!albumStored)
			{
				res.status(404).send({message: 'No se ha guardado el album'});
			}
			else
			{
				res.status(200).send({album: albumStored});
			}
		}

	});
}

function updateAlbum(req, res)
{
	var albumId = req.params.id;
	var update = req.body;

	Album.findByIdAndUpdate(albumId, update, (err, albumUpdated)=>{

		if(err)
		{
			return res.status(500).send({message: 'Error al actualizar el album'});
		}
		else
		{
			if(!albumUpdated)
			{
				res.status(404).send({message: 'El album no existe'});
			}
			else
			{
				res.status(200).send({album: albumUpdated});
			}
		}
	});
}

function deleteAlbum(req, res)
{
	var albumId = req.params.id;

	Album.findByIdAndRemove(albumId, (err, albumRemoved)=>{

		if(err)
		{
			res.status(500).send({message: 'Error al borrar el album'});
		}
		else
		{
			if(!albumRemoved)
			{
				res.status(404).send({message: 'Error el album no fue removido porque no existe'});
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
						return res.status(200).send({album: albumRemoved});
					}
								
				});
			}
		}

	});
}


function uploadImage(req, res)
{
	var albumId = req.params.id;
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
			Album.findByIdAndUpdate(albumId, {image: file_name}, (err, albumUpdated)=>{
				if(err)
				{
					res.status(500).send({message: 'No se ha podido actualizar la imagen del album'});
				}
				else
				{
					if(!albumUpdated)
					{
						res.status(404).send({message: 'El album no ha sido encontrado'});
					}
					else
					{
						res.status(200).send({album: albumUpdated});
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
	var path_file = './uploads/albums/' + imageFile;

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

	getAlbum,
	getAlbums,
	saveAlbum,
	updateAlbum,
	deleteAlbum,
	uploadImage,
	getImageFile
}
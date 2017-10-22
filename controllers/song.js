'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getSong(req, res)
{
	//res.status(200).send({message: 'controlador de song funcionando'});

	var songId = req.params.id;

	Song.findById(songId).populate({path: 'album'}).exec((err, song)=>{

		if(err)
		{
			res.status(500).send({message: 'Error en el servidor al obtener la canción'});
		}
		else
		{
			if(!song)
			{
				res.status(404).send({message: 'La cancion no existe'});
			}
			else
			{
				res.status(200).send({song: song});
			}
			
		}

	});
}

function getSongs(req, res)
{
	var albumId = req.params.album;

	if(!albumId)
	{
		//sacar todos los albums
		var find = Song.find({}).sort('album');
		
	}
	else
	{
		//sacar de un artaste especifico
		var find = Song.find({album: albumId}).sort('number');
	}

	find.populate({
				   path: 'album', 
				   populate: {
					   path: 'artist',
					   model: 'Artist'
				   }
				}).exec((err, songs)=>{

		if(err)
		{
			res.status(500).send({err});//message: 'Error en la peticion populate de songs'});
		}
		else
		{
			if(!songs)
			{
				res.status(404).send({message: 'No hay canciones'});
			}
			else
			{
				res.status(200).send({songs});
			}
		}

	});
}

function saveSong(req, res)
{
	var song = new Song();

	var params = req.body;
	song.number = params.number;
	song.name = params.name;
	song.duration = params.duration;
	song.file = null;
	song.album = params.album;

	song.save((err, songStored) =>{

		if(err)
		{
			res.status(500).send({message: 'Error en el servidor al guardar una canción'});
		}
		else
		{
			if(!songStored)
			{
				res.status(404).send({message: 'No se ha podido guardar la cancion'});
			}
			else
			{
				res.status(200).send({song: songStored});
			}
		}

	});
 

}

function updateSong(req, res)
{
	var songId = req.params.id;
	var update = req.body;

	Song.findByIdAndUpdate(songId, update, (err, songUpdate)=>{

		if(err)
		{
			res.status(500).send({message: 'Error en el servidor al actualizar la cancion'});
		}
		else
		{
			if(!songUpdate)
			{
				res.status(404).send({message: 'La canción no existe'});
			}
			else
			{
				res.status(200).send({song: songUpdate});
			}
		}

	} )
}

function deleteSong(req, res)
{
	var songId = req.params.id;

	Song.findByIdAndRemove(songId, (err, songRemoved)=>{

		if(err)
		{
			res.status(500).send({message: 'Error al borrar el artista'});
		}
		else
		{

			if(err)
			{
				res.status(404).send({message: 'La canción no existe'});
			}
			else
			{
				return res.status(200).send({song: songRemoved});
			}
			
		}

	});
}

function uploadFile(req, res)
{
	var songId = req.params.id;
	var file_name = 'No subido';

	if(req.files)
	{
		var file_path = req.files.file.path;
		var file_split = file_path.split('/');
		var file_name = file_split[2];
		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		console.log(file_path);

		if(file_ext == 'mp3' || file_ext == 'ogg'  || file_ext == 'flac')
		{
			Song.findByIdAndUpdate(songId, {file: file_name}, (err, songUpdate)=>{
				if(err)
				{
					res.status(500).send({message: 'No se ha podido actualizar la cancion del album'});
				}
				else
				{
					if(!songUpdate)
					{
						res.status(404).send({message: 'El album no ha sido encontrado'});
					}
					else
					{
						res.status(200).send({song: songUpdate});
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


function getSongFile(req, res)
{
	var songFile = req.params.songFile;
	var path_file = './uploads/songs/' + songFile;

	//console.log(path_file);

	fs.exists(path_file, (exists) =>{
		if(exists)
		{
			res.sendFile(path.resolve(path_file));
		}
		else
		{
			res.status(200).send({message: 'No existe la cancion'});
		}
	})
}

module.exports = {

	getSong,
	getSongs,
	saveSong,
	updateSong,
	deleteSong,
	uploadFile,
	getSongFile
}
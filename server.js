const express = require('express');
const data = require('./Movie Data/data.json');
const server = express();
const axios = require("axios");
require('dotenv').config();
const cors = require('cors');
server.use(cors());
const APIKey = process.env.apiKey;
const PORT =process.env.port ;
const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);
server.use(express.json());
//////////////////////////////////////////////////////////////////////////////
//ALL SERVICES ///////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
server.get('/', homeHandler)
server.get('/trending', trendingHandler)
server.get('/search', searchHandler)
server.get('/discover', discoverHandler)
server.get('/favorite', favoriteHandler)
server.get('/providers', providersHandler)
server.get('/getMovies', getMoviesHandler)
server.post('/addMovies',addMoviesHandler)
server.delete('/DELETE/:id',deleteMoviesHandler)
server.get('/getMovies/:id', getMoviesByIdHandler)
server.put('/UPDATE/:id',updateMoviesHandler)
//////////////////////////////////////////////////////////////////////////////
//ERROR SERVICES /////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
server.get('/error', error500Handler)

server.get('*', error400Handler)

//////////////////////////////////////////////////////////////////////////////
//HANDLERS ///////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
function homeHandler(req, res) {
    let mov1 = new movieRef(data.title, data.poster_path, data.overview)
    res.status(200).send(mov1)

}

function favoriteHandler(req, res) {
    str = 'Welcome to Favorite Page'
    res.status(200).send(str)
}
function trendingHandler(req, res) {
    const url = `https://api.themoviedb.org/3/trending/all/day?api_key=${APIKey}`



    axios.get(url)
        .then(axiosResult => {

            let mapResult = axiosResult.data.results.map(item => {
                let singlemovie = new axiosTrending(item.id, item.title, item.release_date, item.poster_path, item.overview);
                return singlemovie;
            })
            console.log(mapResult)
            res.send(mapResult)

        })
        .catch((error) => {
            console.log('sorry you have something error', error)
            res.status(500).send(error);
        })


}
function searchHandler(req, res) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${APIKey}&language=en-US&query=The&page=2`


    axios.get(url)
        .then(axiosResult => {
            let mapResult = axiosResult.data.results.map(item => {
                let singlemovie = new axiosSearch(item.id, item.title);
                return singlemovie;
            })
            console.log(mapResult)
            res.send(mapResult)

        })
        .catch((error) => {
            console.log('sorry you have something error', error)
            res.status(500).send("errpr");
        })


}

function discoverHandler(req, res) {
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${APIKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_watch_monetization_types=flatrate&primary_release_year=2023`


    axios.get(url)
        .then(axiosResult => {
            let mapResult = axiosResult.data.results.map(item => {
                let singlemovie = new axiosDiscover(item.id, item.title);
                return singlemovie;
            })
            console.log(mapResult)
            res.send(mapResult)

        })
        .catch((error) => {
            console.log('sorry you have something error', error)
            res.status(500).send("errpr");
        })


}
 function providersHandler(req, res) {
    const url = `
    https://api.themoviedb.org/3/watch/providers/regions?api_key=${APIKey}&language=en-US`



    axios.get(url)
        .then(axiosResult => {
            let mapResult = axiosResult.data.results.map(item => {
                let singlemovie = new axiosProviders(item.iso_3166_1, item.native_name);
                return singlemovie;
            })
            console.log(mapResult)
            res.send(mapResult)

        })
        .catch((error) => {
            console.log('sorry you have something error', error)
            res.status(500).send("error");
        })


}
function getMoviesHandler(req, res) {
    const sql = `SELECT * FROM addedmv`;
    client.query(sql)
    .then(data=>{
        res.send(data.rows);
    })

    .catch((error)=>{
        errorHandler(error,req,res)
    })
}
function addMoviesHandler(req, res) {
    const movieadded = req.body;
    console.log(movieadded);
    const sql = `INSERT INTO addedmv (title, release_date , poster_path, overview )
    VALUES ($1, $2,$3,$4);`
    const values = [movieadded.title , movieadded.release_date,movieadded.poster_path,movieadded.overview]; 
    client.query(sql,values)
    .then(data=>{
        res.send("sent");
    })
    .catch((error)=>{
        errorHandler(error,req,res)
    })
}
function deleteMoviesHandler(req,res){
    const id = req.params.id;
    console.log(req.params);
    const sql = `DELETE FROM addedmv WHERE id=${id};`
    client.query(sql)
    .then((data)=>{
        res.send("DELETED")
    })
    .catch((error)=>{
        errorHandler(error,req,res)
    })
}
function getMoviesByIdHandler(req, res) {
    const id= req.params.id;
    console.log(id)
    const sql = `SELECT * FROM addedmv
    WHERE id=${id};`;
    client.query(sql)
    .then(data=>{
        res.send(data.rows);
    })

    .catch((error)=>{
        errorHandler(error,req,res)
    })
}
function updateMoviesHandler(req,res){
    
    const {id} = req.params;
    console.log(req.body);
    const sql = `UPDATE addedmv
    SET overview = $1
    WHERE id = ${id};`
    const {overview} = req.body;
    const values = [overview];
    client.query(sql,values).then((data)=>{
        res.send("UPDATED")
    })
    .catch((error)=>{
        errorHandler(error,req,res)
    })
}
function error500Handler(req, res) {
    let error500 = {
        "status": 500,

        "responseText": 'Sorry, something went wrong'
    }
    res.status(error500.status).send(error500);
}


function error400Handler(req, res) {
    let error400 = {
        "status": 400,

        "responseText": 'page not found error'
    }
    res.status(error400.status).send(error400)
}

function errorHandler(error,req,res){
    const err = {
        status: 500,
        message: error
    }
    res.status(500).send(err);
}

//////////////////////////////////////////////////////////////////////////////
//CONSTRUCTOR FUNCTIONS///////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function movieRef(title, poster_path, overview) {
    this.title = title,
        this.poster_path = poster_path,
        this.overview = overview

}

function axiosProviders(iso_3166_1,native_name) {
    this.iso_3166_1 = iso_3166_1;
    this.native_name = native_name;
}
function axiosTrending(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
}
function axiosDiscover(id, title) {
    this.id = id;
    this.title = title;

}

function axiosSearch(id, title) {
    this.id = id;
    this.title = title;

}

/////////////////////////////////////////////////////////////////////////
client.connect()
.then(()=>{server.listen(PORT, () => {
    console.log(`Listening on ${PORT}: I'm ready`)
})})

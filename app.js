'use strict';
require('dotenv').config();
const director = require('director');
const Server = require('./lib/server');
const mongoose = require('mongoose');


mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})


// Create a router for GET and POST requests to the app
const router = new director.http.Router({
    '/': {
        post: Server.postResponse,
        get: Server.getResponse
    },
    '/upload':{
        get: Server.getUpload,
        post: Server.postUpload
    }
});

// // Check if the `--dev` flag was passed
const devMode = process.argv[2] === '--dev';

// Start listening
const server = new Server(router, devMode, process.env.PORT || 80);
server.serve();




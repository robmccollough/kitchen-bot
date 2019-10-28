'use strict';

require('dotenv').config();

const https = require('https');
const Menu = require('../db/Menu.js');
const Chirp = require('../db/Chirp.js');

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];


class Bot {
    /**
     * Called when the bot receives a message.
     *
     * @static
     * @param {Object} message The message data incoming from GroupMe
     * @return {string}
     */
    static checkMessage(message) {
        const messageText = message.text;
        console.log('Message recieved: ' + messageText);
        // Learn about regular expressions in JavaScript: https://developer.mozilla.org/docs/Web/JavaScript/Guide/Regular_Expressions
        
        const menuRegex = /^\/menu/;
        const dinnerRegex = /^\/dinner/;
        const chirpRegex = /^\/chirp/;

        if(messageText && chirpRegex.test(messageText)){ 
            return this.fetchChirp().then(chirp => `@${messageText.split('@')[1]} ${chirp.replace(/\//g, '')}`);
        }

        // Check if the GroupMe message has content and if the regex pattern is true
        if (messageText && menuRegex.test(messageText)) {
            // Check is successful, return a message!

            return this.fetchFullMenu().then( menu => menu)
        }

        if(messageText && dinnerRegex.test(messageText)){
            return this.fetchDinner().then(dinner => dinner)
        }

        return Promise.resolve(null);
    };

    /**
     * Sends a message to GroupMe with a POST request.
     *
     * @static
     * @param {string} messageText A message to send to chat
     * @return {undefined}
     */
    static sendMessage(messageText) {
        // Get the GroupMe bot id saved in `.env`
        const botId = process.env.BOT_ID;

        const options = {
            hostname: 'api.groupme.com',
            path: '/v3/bots/post',
            method: 'POST'
        };

        const body = {
            bot_id: botId,
            text: messageText
        };

        // Make the POST request to GroupMe with the http module
        const botRequest = https.request(options, function(response) {
            if (response.statusCode !== 202) {
                console.log('Rejecting bad status code ' + response.statusCode);
            }
        });

        // On error
        botRequest.on('error', function(error) {
            console.log('Error posting message ' + JSON.stringify(error));
        });

        // On timeout
        botRequest.on('timeout', function(error) {
            console.log('Timeout posting message ' + JSON.stringify(error));
        });

        // Finally, send the body to GroupMe as a string
        botRequest.end(JSON.stringify(body));
    };

    static fetchFullMenu(){
        return (new Promise((resolve, reject) => {
            Menu.findOne({}, {}, { sort: { 'date' : -1 } }, (err, doc) => {
                if(err){
                    reject(err);
                }
                
                if((new Date).getTime() - doc.date.getTime() > 604800000){
                    resolve('I do not have the menu for this week yet. I am sorry.')
                }

                let i = -1
                let food = doc.food.map( (day) => {
                    i++;
                    return `${weekdays[i]}: ${day.main} | ${day.side}`;
                }).join('\n');
            
                resolve(food);
                
            })
        }));
    };

    static fetchChirp(){
        return (
            new Promise( (resolve, reject) => {
                Chirp.countDocuments().exec( (err, count) => {

                    if(err){
                        reject(err);
                    }
                    var random = Math.floor(Math.random() * count);
                  
                    Chirp.findOne().skip(random).exec( (err, doc) => {
                        
                            if(err){
                                reject(err);
                            }
                            resolve(doc.text);

                        });
                  });
            })
        );         
    }

    static fetchDinner(){
        return (new Promise((resolve, reject) => {
            Menu.findOne({}, {}, { sort: { 'date' : -1 } }, (err, doc) => {
                if(err){
                    reject(err);
                }

                let day = (new Date()).getDay();

                if(day == 6 || day == 0){
                    resolve('There is no dinner tonight, its the weekend')
                }else if((new Date).getTime() - doc.date.getTime() > 604800000){
                    resolve('I do not have the menu for this week yet. I am sorry.')
                }

                let dinner =  doc.food[day - 1];
                resolve(`Dinner tonight is: \n ${dinner.main} | ${dinner.side}`)
            })
        }));
    }

};

module.exports = Bot;

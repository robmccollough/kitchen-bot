const mongoose = require('mongoose')

const Chirp = mongoose.model('Chirp', new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'some chirp required ']
  }
}), 'chirps');

module.exports = Chirp;
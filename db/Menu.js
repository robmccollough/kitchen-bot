const mongoose = require('mongoose')

const Menu = mongoose.model('Menu', new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'date created is required']
  },
  food: {
    type: Array,
    required: [true, 'menu is required']
  }
}), 'menus');

module.exports = Menu;
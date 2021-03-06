var mongoose = require('mongoose');

var beerSchema = new mongoose.Schema({
  brewery: {type: String, required: true},
  beer: {type: String, required: true},
  style: String,
  date: String,
  quantity: Number,
  forTrade: Boolean
});

var cellarSchema = new mongoose.Schema({
  username: {type: String, required: true},
  beers: [beerSchema]
});

mongoose.model('Beer', beerSchema, 'beers');
mongoose.model('Cellar', cellarSchema, 'cellars');

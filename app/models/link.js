var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');

var linkSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  baseUrl: String,
  code: String, // url hash
  title: String,
  visits: Number,
  createdAt: Date
});

linkSchema.pre('save', function(next, model, attrs, options) {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);
  // model.set('code', shasum.digest('hex').slice(0, 5));
  next();
});

var Link = mongoose.model('Link', linkSchema);

module.exports = Link;

// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   initialize: function() {
//     this.on('creating', function(model, attrs, options) {
//       var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });


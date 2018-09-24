var mongoose = require('mongoose');
var Schema = mongoose.Schema;


let ShopSchema = new Schema({
  name: {type: String, required: true, minlength: 5, unique: true},
  products: [{type: Schema.Types.ObjectId, ref: 'Product'}]
}, { timestamps: {} });

ShopSchema.statics.getAllShops = function (callback){
  this.find({})
    .exec((err, shops) => {
      if (err){
        return callback(err);
      }
      else if(!shops){
        err = "shops not found";
        return callback(err);
      }
      else{
        return callback(null, shops);
      }
    })
}




module.exports = mongoose.model('Shop', ShopSchema);

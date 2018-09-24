const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var ProductSchema = new Schema({
    name: {type: String, required: true, maxlength: 50, unique: true},
    price: {type: Number, required: true},
    description: {type: String, required: true, default: "", maxlength: 200},
}, { timestamps: {}  });

// ProductSchema.statics.getProductCount = function (shop, callback){
//   console.log("model shop", shop);
//   this.find({shop})
//     .exec((err, products) => {
//       if (err){
//         return callback(err);
//       }
//       else if(!products){
//         err = "products not found";
//         return callback(err);
//       }
//       else{
//         return callback(null, products);
//       }
//     })
// }

module.exports = mongoose.model('Product', ProductSchema);

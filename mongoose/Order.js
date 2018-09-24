const mongoose = require('mongoose');
const LineItem = require('./LineItem');
const Product = require('./Product');
const Schema = mongoose.Schema;

var OrderSchema = new Schema({
    buyer: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    shop: {type: Schema.Types.ObjectId, ref: 'Shop',required: true},
    price: {type: Number,required: true, default: 0},
    active: {type: Boolean, required: true, default: true},
}, { timestamps: {} });


OrderSchema.methods.getProducts = function(callback) {
  LineItem
    .find({order: this._id})
    .populate("product")
    .exec((err, products) => {
      if(err) return callback(err);
      return callback(null, products);
    })
}

OrderSchema.statics.getOrders = function(buyerId, shopId, callback){
  this.find({buyer: buyerId, shop:shopId})
    .exec((err, orders) => {
      if(err) return callback(err);
      else{
        return callback(null, orders);
      }
    })
}

OrderSchema.statics.getHistory = function(buyerId, shopId, callback){
  this.find({buyer: buyerId, shop:shopId, active: false})
    .exec((err, orders) => {
      if(err) return callback(err);
      else{
        return callback(null, orders);
      }
    })
}


/*
  @static
  @method getCart
  @param buyerId the id of the user executing command
  @param shopId the id of the shop that the user is ordering from
*/
OrderSchema.statics.getCart = function(buyerId, shopId, callback){
  this.findOne({buyer: buyerId, active:true, shop: shopId})
  .exec((err, cart) => {
    if(err) return callback(err, "hi")
    else if(!cart){ //if it doesn't exist create it

    //console.log("creating new cart!")
      this.create({
        buyer: buyerId,
        shop: shopId,
      })
      .then((newCart) => {
        return callback(null, newCart);
      })
      .catch((err) => {return callback(err);})
    }
    else return callback(null, cart);
  })
}

/*
  @static
  @method addToCart
  @param productId the id of the product you wish to add
  @param buyerId the id of the user executing command
  @param shopId the id of the shop that the user is ordering from
*/
OrderSchema.statics.addToCart = function (productId, buyerId, shopId, callback) {
    this.getCart(buyerId, shopId, (err, order) => {
        if(err) {
          return callback(err);
        }
        Product.findById(productId, (err, product) => {
          if(err) return callback(err);
          else if(isEmpty(product)) return callback('target product doesnt exist');
          LineItem.incrementOrCreate(order._id, product._id, (err, lineItem) => {
            if(err) return callback(err);
            order.price += product.price; //increment price
            order.save()
            return callback(null, order)
          })
        })
      })
}

/*
  @static
  @method removeFromCart
  @param prodctId id of the product you wish to remove
  @param buyerId the id of the user executing command
  @param shopId the id of the shop that the user is ordering from
*/
OrderSchema.statics.removeFromCart = function(productId, buyerId, shopId, callback) {
  //delete line item
  this.getCart(buyerId, shopId, (err, order) => {
      if(err) {
        return callback(err);
      }
      Product.findById(productId, (err, product) => {
        if(err) return callback(err);
        else if( isEmpty(product)) return callback('target product doesnt exist');
        LineItem.decrementOrRemove(order._id, product._id, (err, lineItem) => {
          if(err) return callback(err);
          order.price -= product.price; //decrement price
          order.save();
          return callback(null, order );
        })
      })

    })
}

/*
  @static
  @method checkout
  @param buyerId the id of the user executing command
  @param shopId the id of the shop that the user is ordering from
*/
OrderSchema.statics.checkout = function(buyerId, shopId, callback) {
  this.getCart(buyerId, shopId, (err, order) => {
    if(err) {
      return callback(err);
    }
    else if(order.price === 0){
      return callback('Order must not be empty in order to checkout')
    }
      this.create({buyer: buyerId, shop: shopId })
        .then(() => {
          order.active = false;
          order.save();
          //console.log("checkout success model")
          return callback(null, order);
        })
        .catch((err) => {
          return callback(err);
        })
    })
}

function isEmpty(o){
    for(var i in o){
        if(o.hasOwnProperty(i)){
            return false;
        }
    }
    return true;
}


module.exports = mongoose.model('Order', OrderSchema);

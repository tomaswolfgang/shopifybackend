const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var LineItemSchema = new Schema({
    order: {type: Schema.Types.ObjectId, ref: 'Order', required: true},
    product: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
    count: {type: Number, required: true, default: 1}
}, { timestamps: {} });

LineItemSchema.statics.incrementOrCreate = function(orderId, productId, callback){
  this.findOne({order: orderId, product: productId})
    .exec((err, lineItem) => {
      if(err) return callback(err);
      else if(!lineItem){
        //now create line item
        console.log("CREATE new line item");
        this.create({order: orderId, product: productId})
        .then((newLineItem) => {
          return callback(null, newLineItem);
        })
      }
      else{
        console.log("INCREMENT line item");
        lineItem.count++;
        lineItem.save();
        return callback(null, lineItem);
      }
    })
}

LineItemSchema.statics.decrementOrRemove = function(orderId, productId, callback){
  this.findOne({order: orderId, product: productId})
    .exec((err, lineItem) => {
      if(err) return callback(err);
      else if(!lineItem){
        err = "line item doesnt exist";
        return callback(err);
      }
      else{
        if(lineItem.count === 1){
          //destroy line item
          console.log("DESTROY line item");
          let removedLineItem = lineItem.remove();
          return callback(null, removedLineItem);
        }
        else{
          console.log("DECREMENT line item");
          lineItem.count--;
          lineItem.save();
          return callback(null, lineItem);
        }

      }
    })
}



module.exports =  mongoose.model('LineItem', LineItemSchema);

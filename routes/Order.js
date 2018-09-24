const express = require('express');
const router = express.Router();
const Middleware = require('./middleware.js');
const Order = require('../mongoose/Order');
const Shop = require('../mongoose/Shop');
const constants = require('./constants.js');

router.post('/get', Middleware, (req, res) => {
  const buyerId = req.session.userId;
  const shopId = req.body.shopId;
  Order.getOrders(buyerId, shopId, (err, orders) => {
    if(err){
      res.send({error: true, message: err})
      return;
    }
    else{
      res.send({error: false, message: 'get orders success', orders})
    }

  })
})

router.post('/getProducts', Middleware, (req, res) => {
  const orderId = req.body.orderId;
  Order.findById(orderId)
    .exec( (err, order) => {
    if(err){
      res.send({error: true, message: err})
      return;
    }
    else{
      order.getProducts((err, products) => {
        if(err){
          res.send({error: true, message: err});
          return;
        }
        else{
          res.send({error: false, message: 'get products success', products});
        }
      })
    }

  })
})

router.post('/add',Middleware, (req, res) => {
  const buyerId = req.session.userId;
  const shopId = req.body.shopId;
  const productId = req.body.productId;
  Order.addToCart(productId, buyerId, shopId, (err, order) => {
    if(err) {
      res.send({error: true, message: err, order});
      return;
    }
    else{
      //console.log("add order success");
      if(constants.testing){
        res.send({error: false, message: 'Order added successfully', order})
      }
      else{
        res.redirect('back')
      }
    }
  })
})

router.post('/remove', Middleware, (req, res) => {
  const buyerId = req.session.userId;
  const shopId = req.body.shopId;
  const productId = req.body.productId;
  Order.removeFromCart(productId, buyerId, shopId, (err, order) => {
    if(err) {
      res.send({error: true, message: err});
      return;
    }
    else{
      //console.log("remove order success");
      if(constants.testing){
        res.send({error: false, message: 'Order removed successfully', order})
      }
      else{
        res.redirect('back');
      }
    }
  })
})

router.post('/checkout', Middleware, (req, res) => {
  const buyerId = req.session.userId;
  const shopId = req.body.shopId;
  Order.checkout(buyerId, shopId, (err, order) => {
    if(err) {
      res.send({error: true, message: err, order});
      return;
    }
    else{
      //console.log("checkout success routes");
      if(constants.testing){
        res.send({error: false, message: 'checkout success', order})
      }
      else{
        Shop.findById(shopId)
        .exec((err, shop) => {
          if(err){
            res.send({error: true, message:err})
            return;
          }
          else{
            res.redirect('../thankyou?shop='+shopId);
          }
        })

      }
    }
  })
})


module.exports = router;

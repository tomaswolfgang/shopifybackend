var router = require('express').Router();
const Shop = require('../mongoose/Shop');
const Product = require('../mongoose/Product');
const Order = require('../mongoose/Order');
const Middleware = require('./middleware.js');


router.get('/login', (req,res) => {
  if(req.session.userId){
    res.redirect('./home');
  }
  else{
    let vars = {
      user: null,
      error: req.session.error ? req.session.error : null
    }
    req.session.error = null;
    res.render('login', vars)
  }
})

router.get('/register', (req,res) => {
  if(req.session.userId){
    res.redirect('./home');
  }
  else{
    let vars = {
      user: null,
      error: req.session.error ? req.session.error : null
    }
    req.session.error = null;
    res.render('register', vars)
  }
})


router.get('/home', (req,res) => {
  Shop.getAllShops((err, shops) => {
    if(err) res.send({error: true, message: err});
    else {
      let vars = {
        shops
      }
      if(req.session.userId){
        vars.user = req.session.userId;
      }
      else {
        vars.user = null;
      }
      res.render('home',vars)
    }
  })
})


router.get('/shop', (req,res) => {
  let shopId = req.query.shop;
  Shop.findById(shopId)
  .populate("products")
  .exec((err, shop) => {
    if(err){
      res.send({error: true, message:err});
    }
    else{
      let vars = {
        shop
      };
      if(req.session.userId){
        vars.user = req.session.userId;
      }
      else {
        vars.user = null
      }
      res.render('shop' , vars)
    }

  })
})

router.get('/history',Middleware, (req,res) => {
  let shopId = req.query.shop;
  let buyerId = req.session.userId;
  Order.getHistory(buyerId, shopId, (err, orders) => {
    if(err){
      res.send({error: true, message: err});
      return;
    }
    else{
      let vars = {
        user: req.session.userId,
        orders: []
      };
      let fleshedOrders = orders.map((order) => {
        return new Promise((resolve,reject) => {
          order.getProducts((err, products) => {
            if (err) {
              res.send({error: true, message: err});
              reject();
            }
            else{
              order.products = products;
              // console.log("products", products);
              // console.log("order with products", order);
              let orderWProducts = {
                order,
                products
              };
              //console.log("order with products 222222", orderWProducts);
              vars.orders.push(orderWProducts)
              resolve();
            }
          })
        });
      });
      Promise.all(fleshedOrders)
      .then(() => {
        vars.orders.sort((a,b) => {
          if(a.order.updatedAt > b.order.updatedAt){
            return -1
          }
          else if(b.order.updatedAt > a.order.updatedAt){
            return 1;
          }
          return 0;
        });
        Shop.findById(shopId)
        .exec((err, shop) => {
          if(err){
            res.send({error: true, message:err})
            return;
          }
          else{
            vars.shop = shop;
            res.render('history', vars)
          }
        })
      })
      .catch((err) => {
        res.send({error: true, message: err})
      })
    }
  })
})

router.get('/cart',Middleware, (req,res) => {
  let shopId = req.query.shop;
  if(shopId){
    //specified shop!
    Order.getCart(req.session.userId, shopId, (err, cart) => {
      if(err){
        res.send({error: true, message: err});
        return;
      }
      else{
       let vars = {
         cart,
         user: req.session.userId
       };
       Shop.findById(shopId)
       .exec((err, shop) => {
         if(err){
           res.send({error: true, message: err});
           return;
         }
         else{
           vars.shop = shop;
           cart.getProducts((err, products) => {
             if(err) {
               res.send({error: true, message: err})
               return;
             }
             else{
               vars.cart.products = products;
               res.render('cart', vars);
             }
           })
         }
       })
      }
    })
  }
  else{
    Shop.getAllShops((err, shops) => {
      if(err) res.send({error: true, message: err});
      else {
        let vars = {
          shops,
          user : req.session.userId,
        };
        res.render('cart',vars)
      }
    })
  }
})


router.get('/product', (req,res) => {
  let productId = req.query.product;
  let shopId = req.query.shop;
  Shop.findById(shopId)
  .exec((err, shop) => {
    if (err) {
      res.send({error: true, message: err});
      return;
    }
    let vars = {
      shop
    };
    Product.findById(productId)
    .exec((err, product) => {
      vars.product = product;
      if(err) res.send({error: true, message: err});
      else if(req.session.userId){
        //if user is logged in
        vars.user = req.session.userId;
        Order.findOne({buyer: req.session.userId, active: true, shop:shopId})
          .exec((err, order) => {
            if(err) {
              res.send({error: true, message: err})
              return;
            }
            //console.log("ORDERERERER",order)
            if(!order){
              vars.count = 0;
              res.render('product', vars);
              return;
            }
            order.getProducts((err, products) => {
              if(err){
                res.send({error: true, message: err});
                return;
              }
              else{
                let index = products.findIndex(elem =>  {
                  return elem.product._id.toString() === productId
                });
                //console.log("prod index", index)
                if(index > -1){
                  //product exists in cart
                  vars.count = products[index].count;
                  res.render('product', vars);
                }
                else{
                  vars.count = 0;
                  res.render('product', vars);
                }
              }
            })
          })
      }
      else {
        vars.user = null;
        res.render('product', vars);
      }
    })
  })
})

router.get('/thankyou',Middleware, (req,res) => {
  const shopId = req.query.shop;
  Shop.findById(shopId)
  .exec((err, shop) => {
    if(err){
      res.send({error: true, message: err})
      return;
    }
    else{
      let vars = {
        shop,
        user: req.session.userId
      };
      res.render('thankyou', vars);
    }
  })
})


router.use('/user', require('./User'));
router.use('/product', require('./Product'));
router.use('/order', require('./Order'));
router.use('/shop', require('./Shop'));
module.exports = router;

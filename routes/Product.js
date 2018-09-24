const express = require('express');
const router = express.Router();
const Product = require('../mongoose/Product');
const Order = require('../mongoose/Order');


router.get('/getAll', (req, res) => {
  //console.log("route shop", req.query.shop);

  Product.getAllProducts(req.query.shop,(err, products) => {
    if(err) res.send({error: true, message: err});
    else {
      res.send({error: false, message: "get all products success", products });
    }
  })
})

router.get('/createNew', (req,res) => {
  res.render('createNew');
})


module.exports = router;

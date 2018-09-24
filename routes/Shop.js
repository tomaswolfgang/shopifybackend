const express = require('express');
const router = express.Router();
const Shop = require('../mongoose/Shop');


router.get('/getAll', (req, res) => {
  Shop.getAllShops((err, shops) => {
    if(err) res.send({error: true, message: err});
    else {
      res.send({error: false, message: "get all shops success", shops });
    }
  })
})

router.get('/getProducts', (req, res) => {
  let shopId = req.query.shop;
  Shop.findById(shopId)
  .populate("products")
  .exec((err, shop) => {
    if(err){
      //console.log("error", shop);
      //console.log("error", res);
      res.send({error: true, message:err});
    }
    else{
      res.send({error: false, message: 'get products success', shop})
    }

  })
})


module.exports = router;

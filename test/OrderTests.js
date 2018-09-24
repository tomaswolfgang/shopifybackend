const request = require("request");
const assert = require("assert");
const chai = require('chai');
const chaiHttp = require('chai-http');
const base_url = "http://localhost:3000/";
const server = require("../server");

const User = require('../mongoose/User');
const Shop = require('../mongoose/Shop');
const Product = require('../mongoose/Product');
const Order = require('../mongoose/Order');
const LineItem = require('../mongoose/LineItem');

const product1Price = 10;
const product2Price = 25;

chai.use(chaiHttp);

describe("Order functionality", () => {
  let pId ='';
  let sId = '';
  beforeEach( (done) => {
    Promise.resolve( Shop.collection.drop())
    .then(Product.collection.drop())
    .then(User.collection.drop())
    .then(() => {
      let newUser = new User({username: 'tommy', password: 'asdf'});
      newUser.save();
    })
    .then(() => {
      let newShop = new Shop({name: 'Tommys Cheese Store', products: []});
      newShop.save()
      .then(() => {
        let newProduct = new Product({
          name: "Cheddar Wheel",
          price: product1Price,
          description: "Aged white cheddar. Sharp, creamy flavor.",
        })
        newProduct.save((err) => {
          newShop.products.push(newProduct._id);
          let newProduct2 = new Product({
            name: "test2",
            price: product2Price,
            description: "second product test",
          })
          newProduct2.save((err) => {
            newShop.products.push(newProduct2._id);
            newShop.save((err) => {
              done();
            })
          })
        });
      }, (err) => {console.log("error when saving new product", err)})
    })
    .catch((err) => console.log("before each order func error", err))
  })

  describe("User Actions", () => {

    beforeEach((done) => {
      Promise.resolve(Order.collection.drop())
      .then(LineItem.collection.drop())
      .then(done())
      .catch((err) => console.log("before each user add error",err))
    })

      // it("can get all shops", async () => {
      //   let agent = chai.request.agent(base_url);
      //   let res = await agent.get('shop/getAll');
      //   let {shops} = res.body;
      //   let res1 = await agent.get('shop/getProducts?shop='+shops[0]._id);
      //   let shop = res1.body.shop;
      //   let {products} = shop;
      //   console.log("products", products[0]);
      //
      // })

    it("ORDER : user can add to cart", async () => {
      let agent = chai.request.agent(base_url);
      await agent.post('user/auth').send({username: 'tommy', password: 'asdf'});

      let res = await agent.get('shop/getAll');
      let {shops} = res.body;
      let res1 = await agent.get('shop/getProducts?shop='+shops[0]._id);
      let shop = res1.body.shop;
      let {products} = shop;
      let res2 = await (agent.post('order/add').send({shopId: shop._id, productId: products[0]._id}));
      assert(!res2.body.error, res2.body.message);
      assert.equal(product1Price, res2.body.order.price);
      console.log("add product success, current order price", res2.body.order.price);

      //can add second product
      let res3 = await (agent.post('order/add').send({shopId: shop._id, productId: products[1]._id}));
      assert(!res3.body.error, res3.body.message);
      assert.equal(product1Price+product2Price, res3.body.order.price);
      console.log("2nd add product success, current order price", res3.body.order.price);

      //can add single product twice
      let res4 = await (agent.post('order/add').send({shopId: shop._id, productId: products[0]._id}));
      assert(!res4.body.error, res4.body.message);
      assert.equal(product1Price+product1Price+product2Price, res4.body.order.price);
      console.log("3nd add product success, can add single product multiple times, current order price", res4.body.order.price);

      let res5 = await agent.post('user/logout');
      assert(!res5.body.error, res5.body.message);

    })


    it("ORDER : user can remove from cart", async () => {
      let agent = chai.request.agent(base_url);
      await agent.post('user/auth').send({username: 'tommy', password: 'asdf'});
      let res = await agent.get('shop/getAll');
      let {shops} = res.body;
      let res1 = await agent.get('shop/getProducts?shop='+shops[0]._id);
      let shop = res1.body.shop;
      let {products} = shop;
      let res2 = await (agent.post('order/add').send({shopId: shop._id, productId: products[0]._id}));
      assert(!res2.body.error, res2.body.message);
      assert.equal(product1Price, res2.body.order.price);
      console.log("add product success, current order price", res2.body.order.price);

      //can add second product
      let res3 = await (agent.post('order/add').send({shopId: shop._id, productId: products[1]._id}));
      assert(!res3.body.error, res3.body.message);
      assert.equal(product1Price+product2Price, res3.body.order.price);
      console.log("2nd add product success, current order price", res3.body.order.price);

      //can remove repeated product
      let res4 = await (agent.post('order/remove').send({shopId: shop._id, productId: products[1]._id}));
      assert(!res4.body.error, res4.body.message);
      assert.equal(product1Price, res4.body.order.price);
      console.log("1st remove product success, can remove product in an order, current order price", res4.body.order.price);

      //can add single product twice
      let res5 = await (agent.post('order/add').send({shopId: shop._id, productId: products[0]._id}));
      assert(!res5.body.error, res5.body.message);
      assert.equal(product1Price+product1Price, res5.body.order.price);
      console.log("3nd add product success, can add single product multiple times, current order price", res5.body.order.price);

      //can remove repeated product
      let res6 = await (agent.post('order/remove').send({shopId: shop._id, productId: products[0]._id}));
      assert(!res6.body.error, res6.body.message);
      assert.equal(product1Price, res6.body.order.price);
      console.log("2nd remove product success, can remove single product that is repeated multiple times in the order, current order price", res6.body.order.price);

      //can remove last item in order
      let res7 = await (agent.post('order/remove').send({shopId: shop._id, productId: products[0]._id}));
      assert(!res7.body.error, res7.body.message);
      assert.equal(0, res7.body.order.price);
      console.log("3rd remove product success, can remove last product in order, current order price", res7.body.order.price);

      //error when removing non-existent item in order
      // let res8 = await (agent.post('order/remove').send({shopId: shop._id, productId: products[0]._id}));
      // assert(res8.body.error, 'Was able to remove product from empty order');
      // console.log("Error when removing product from empty order: ", res8.body.message);

      let resf = await agent.post('user/logout');
      assert(!resf.body.error, resf.body.message);
    })

    it("ORDER : can see products in order", async () => {
      let agent = chai.request.agent(base_url);
      await agent.post('user/auth').send({username: 'tommy', password: 'asdf'});
      let res = await agent.get('shop/getAll');
      let {shops} = res.body;
      let res1 = await agent.get('shop/getProducts?shop='+shops[0]._id);
      let shop = res1.body.shop;
      let {products} = shop;
      let res2 = await (agent.post('order/add').send({shopId: shop._id, productId: products[0]._id}));
      assert(!res2.body.error, res2.body.message);
      assert.equal(product1Price, res2.body.order.price);
      console.log("add product success, current order price", res2.body.order.price);

      let res3 = await (agent.post('order/add').send({shopId: shop._id, productId: products[1]._id}));
      assert(!res3.body.error, res3.body.message);
      assert.equal(product1Price+product2Price, res3.body.order.price);
      console.log("add product success, current order price", res3.body.order.price);

      let res4 = await (agent.post('order/getProducts').send({orderId: res3.body.order._id}));
      assert(!res4.body.error, res4.body.message);
      console.log("products in my order", res4.body.products.length);
      assert.equal(2, res4.body.products.length )

      let res5 = await agent.post('user/logout');
      assert(!res5.body.error, res5.body.message);
    })

    /*CHECKOUT FUNCTIONALITY*/
    it("CHECKOUT: can checkout successfully", async () => {
        let agent = chai.request.agent(base_url);
        await agent.post('user/auth').send({username: 'tommy', password: 'asdf'});
        let res = await agent.get('shop/getAll');
        let {shops} = res.body;
        let res1 = await agent.get('shop/getProducts?shop='+shops[0]._id);
        let shop = res1.body.shop;
        let {products} = shop;
        let res2 = await (agent.post('order/add').send({shopId: shop._id, productId: products[0]._id}));
        assert(!res2.body.error, res2.body.message);
        assert.equal(product1Price, res2.body.order.price);
        console.log("add product success, current order price", res2.body.order.price);

        let res3 = await (agent.post('order/add').send({shopId: shop._id, productId: products[1]._id}));
        assert(!res3.body.error, res3.body.message);
        assert.equal(product1Price+product2Price, res3.body.order.price);
        console.log("add product success, current order price", res3.body.order.price);


        //order becomes INACTIVE after checkout
        let res4 = await (agent.post('order/checkout').send({shopId:shop._id}));
        assert(!res4.body.error, res4.body.message);
        assert(!res4.body.order.active, "order was still active after checkout")

        //user has new active order after checking out of previous one
        let res5 = await (agent.post('order/add').send({shopId: shop._id, productId: products[0]._id}));
        assert(!res5.body.error, res5.body.message);
        assert.equal(product1Price, res5.body.order.price);
        console.log("add product success, current order price", res5.body.order.price);

        let res6 = await (agent.post('order/get').send({shopId: shop._id}));
        assert(!res6.body.error, res6.body.message);
        assert.equal(2, res6.body.orders.length);
        console.log("all orders (should have 2 total)", res6.body.orders);

        let res7 = await agent.post('user/logout');
        assert(!res7.body.error, res7.body.message);
    })
  })
})

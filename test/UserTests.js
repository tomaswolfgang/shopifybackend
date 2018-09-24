const request = require("request");
const assert = require("assert");
const chai = require('chai');
const chaiHttp = require('chai-http');
const base_url = "http://localhost:3000/";
const server = require("../server");

const User = require('../mongoose/User');

chai.use(chaiHttp);


describe("User functionality", function(){
  describe("create user", function(){
    beforeEach((done) => {
      User.collection.drop((err) => {
        done();
      });

    })

    it("creates user successfully", (done) => {
        chai.request(base_url)
          .post("user/create")
          .send({"username": "testytom", "password": "testytom"})
          .end((err, res) =>{
            if (err) {
              assert(false, err);
              done();
            }
            assert(!res.body.error, res.body.message)
            done()
          })
    })
  })

  describe("login user", function(){
    User.collection.drop();

    beforeEach((done) => {
      var newUser = new User({username: 'tommy', password: 'asdf'});
      newUser.save((err) => {
        done();
      });
    })

    it("login", (done) => {
        chai.request(base_url)
        .post('user/auth')
        .send({"username": 'tommy', "password": 'asdf'})
        .end((err, res) => {
          if (err) {
            assert(false, err);
            done();
          }
          assert(!res.body.error, res.body.message);
          done();
        })
    })


    afterEach(function(done){
      User.collection.drop(() => {
        done();
      });

    });
  })

  describe("logout user", function(){
    User.collection.drop();

    //create and login user
    beforeEach((done) => {
      var newUser = new User({username: 'tommy', password: 'asdf'});
      newUser.save((err) => {
          done();
      });
    })

    it("logout", (done) => {
      //first login with user
      let agent = chai.request.agent(base_url)
      agent.post('user/auth')
        .send({username: 'tommy', password: 'asdf'})
        .then(() => {
          agent.post('user/logout') //then try logging out
          .then((res) => {
            assert(!res.body.error, res.body.message);
            done();
          })
          .catch((err) => assert(false,err))
        })
        .catch((err) => assert(false, err))
    })

    afterEach(function(done){
      User.collection.drop(() => {
        done();
      });

    });

  })
})

var express = require('express');
var MongoClient=require('mongodb').MongoClient;
var router = express.Router();

const url="mongodb://127.0.0.1:27017";

/* GET users listing. */
router.get('/', function(req, res, next) {
  MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
    var db=client.db('project214');
    db.collection('user').find().toArray(function(err,data){
      if(err){
        console.log('查询用户数据失败',err);
        // 有错误，渲染 error,ejs
        res.render('error',{
          message:'查询失败',
          error:err
        });
        return;
      }else{
        console.log(data);
        res.render('users', {
          list: data
        });
      }
    });
    client.close();
  })  
});

module.exports = router;

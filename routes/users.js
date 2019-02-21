var express = require('express');
var MongoClient=require('mongodb').MongoClient;
var ObjectId=require('mongodb').ObjectId;
var router = express.Router();
var async = require('async');

const url="mongodb://127.0.0.1:27017";

/* GET users listing. 分页效果*/
router.get('/', function(req, res, next) {
  var page=parseInt(req.query.page) || 1;//总页数
  var pageSize=parseInt(req.query.pageSize) || 3;//每页条数
  var totalSize=0;//总条数
  var totalPage=0;

  MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
    var db=client.db('project214');
    if(err){
      console.log('连接失败',err);
      res.render('error',{
        message:'连接失败',
        error:err
      })
      return;
    }
    var db=client.db('project214');
    
    async.series([
      function(cb){
        db.collection('user').find().count(function(err,num){
          if(err){
            cb(err);
          }else{
            totalSize =num;
            totalPage=Math.ceil(totalSize/pageSize);
            cb(null);
          }
        })
      },function(cb){
        // db.collection('user').find().limit(5).skip(0)
        // db.collection('user').find().limit(5).skip(5)
        // db.collection('user').find().limit(5).skip(10)
        db.collection('user').find().limit(pageSize).skip(pageSize * page - pageSize).toArray(function(err, data){
          if(err){
            cb(err);
          }else{
            cb(null,data);
          }
        });
      }
    ],function(err,results){
      if(err){
        res.render('error',{
          message:'查找数据失败',
          error:err
        })
      }else{
        res.render('users',{
          list:results[1],
          totalPage:totalPage,
          pageSize:pageSize,
          currentPage:page
        });
        client.close();
      }
    })
  })

  // 少量数据的情况，多了要分页，如上====================
  // MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
  //   var db=client.db('project214');
  //   db.collection('user').find().toArray(function(err,data){
  //     if(err){
  //       console.log('查询用户数据失败',err);
  //       // 有错误，渲染 error,ejs
  //       res.render('error',{
  //         message:'查询失败',
  //         error:err
  //       });
  //       return;
  //     }else{
  //       console.log(data);
  //       res.render('users', {
  //         list: data
  //       });
  //     }
  //   });
  //   client.close();
  // })  
});

// 登录
router.post('/login',function(req,res){
  // 获取前端传递过来的参数
  // console.log(req.body);
  var username=req.body.name;
  var password=req.body.pwd;
  // res.send('b');
  // 验证参数有效性客户端
  if(!username){
    res.render('error',{
      message:'用户名不能为空',
      error:new Error('用户名不能为空')
    })
    return;
  }

  if(!password){
    res.render('error',{
      message:'密码不能为空',
      error:new Error('密码不能为空')
    })
    return;
  }
  // 连接数据库做验证
  MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
    if(err){
      console.log("连接失败",err);
      res.render('error',{
        message:'查询失败',
        error:err
      })
      return;
    }

    var db=client.db('project214');

    // db.collection('user').find({
    //   username:username,
    //   password:password
    // }).count(function(err,num){
    //   if(err){
    //     console.log("查询失败",err);
    //     res.render('error',{
    //     message:'查询失败',
    //     error:err
    //     })
    //   }else if(num>0){
    //     // 要重定向
    //     // res.render('index')
    //     // res.redirect('http://localhost:3000/');
    //     res.redirect('/');
    //   }else{
    //     res.render('error',{
    //       message:'登录失败',
    //       error:new Error('登录失败')
    //     })
    //   }
    //   client.close();
    // });

    db.collection('user').find({
      username:username,
      password:password
    }).toArray(function(err,data){
      if(err){
        console.log('查询用户数据失败',err);
        // 有错误，渲染 error,ejs
        res.render('error',{
          message:'查询失败',
          error:err
        })
      }else if(data.length <= 0){
        res.render('error',{
          message:'登录失败',
          error: new Error('登录失败')
        })
      }else{
        // 登录成功
        // console.log(data);
        res.cookie('nickname',data[0].nickname,{
          maxAge:10*60*1000
        })
        res.redirect('/');
      }
      client.close();
    })
  })   
  // res.send('b');
})

// 注册
router.post('/register',function(req,res){
  // 获取前端传递过来的参数
  // console.log(req.body);
  var username=req.body.name;
  var nickname=req.body.nickname;
  var password=req.body.pwd;
  var sex=req.body.sex;
  var isAdmin=req.body.isAdmin==='是'?true:false;
  var age=parseInt(req.body.age);
  // console.log(name,pwd,sex,isAdmin,age);
  // res.send('b');
  // 验证参数有效性客户端===========
  if(!username){
    res.render('error',{
      message:'用户名不能为空',
      error:new Error('用户名不能为空')
    })
    return;
  }

  if(!password){
    res.render('error',{
      message:'密码不能为空',
      error:new Error('密码不能为空')
    })
    return;
  }

  // 验证参数有效性服务器端====================
MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
  if(err){
    res.render('error',{
      message:'链接失败',
      error:err
    })
    return;
  }

  var db=client.db('project214');
  
  async.series([
    function(cb){
      db.collection('user').find({username:username}).count(function(err,num){
        if(err){
          cb(err)
        }else if(num>0){
          // 这个人已注册
          cb(new Error('已经注册'));
        }else{
          // 可以注册了
          cb(null);
        }
      })
    },

    function(cb){
      db.collection('user').insertOne(
        {
          username:username,
          password:password,
          nickname:nickname,
          sex:sex,
          age:age,
          isAdmin:isAdmin
        },function(err){
          if(err){
            cb(err);
          }else{
            cb(null);
          }
        }
      )
    }
  ],function(err,result){
    if(err){
      console.log('注册失败');
      res.render('error',{
        message:'注册失败',
        error:err
      })
    }else{
      res.redirect('/login.html');
    }
    client.close();
  })
})

// 删除数据库的一条数据
router.get('/delete',function(req,res){
  // 获取前端传递过来的参数
  //  console.log(req.query);
  var id=req.query.id;
  // 连接数据库做验证
  MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
    if(err){
      console.log("连接失败",err);
      res.render('error',{
        message:'查询失败',
        error:err
      })
      return;
    }

    var db=client.db('project214');

    db.collection('user').deleteOne({
      _id: ObjectId(id)
    },function(err,data){
      console.log(data);
      if(err){
        res.render('error',{
          message:'删除失败',
          error:err
        })
      }else{
        res.redirect('/users');
      }
      client.close();
    })
  })   
})

  // 连接数据库做验证
  // MongoClient.connect(url,{ useNewUrlParser: true },function(err,client){
  //   if(err){
  //     console.log("连接失败",err);
  //     res.render('error',{
  //       message:'查询失败',
  //       error:err
  //     })
  //     return;
  //   }

  //   var db=client.db('project214');

  //   db.collection('user').find({
  //     username:username
  //   }).toArray(function(err,data){
  //     if(err){
  //       console.log('查询用户数据失败',err);
  //       // 有错误，渲染 error,ejs
  //       res.render('error',{
  //         message:'查询失败',
  //         error:err
  //       })
  //     }else if(data.length > 0){
  //       res.render('error',{
  //         message:'账号已经存在',
  //         error: new Error('账号已经存在')
  //       })
  //     }else{
  //       // 注册成功
  //       db.collection('user').insertOne({
  //         username:username,
  //         password:password,
  //         nickname:nickname,
  //         sex:sex,
  //         age:age,
  //         isAdmin:isAdmin
  //       },function(err){
  //         if(err){
  //           console.log('注册失败');
  //           res.render('error',{
  //             message:'注册失败',
  //             error:err
  //           })
  //         }else{
  //           res.redirect('/login.html');
  //         }
  //         // 断开连接
  //         client.close();
  //       })
  //     }
  //   })
  // })   
})

module.exports = router;

var http  = require('http');
var https = require('https');
var fs = require('fs');

var cheerio = require('cheerio');

var request = require('request');
var express = require('express');
var app = express();

var i = 0;
//var url = 'http://www.baidu.com';
var str = ''
var imgArr= []
 function startRequest(urls) {
    return new Promise((resolve,reject)=>{
        var httpSer = urls.indexOf("https")>-1?https:http;
    var req =  httpSer.get(urls,function(res){
        //console.log(res);
        var html =''; //用来存储整个网页的内容
        var titles = [];
        //编码
        res.setEncoding('utf-8');

        //监听data事件，每次取一块数据
        res.on('data',(chunk) => {
            html += chunk;
        });

        //网页监听完毕
        res.on('end',() =>  {
            //用cheerio来解析html
            // str = html
            var $ = cheerio.load(html);
            //console.log($)
            savaImg($,urls)
            resolve()
        })

    })
    req.end();
    });
    
}
//图片爬虫
function savaImg($,urls){
    imgArr = [];
    var httphead = urls.indexOf("https")>-1?'https:':'http:';
    $('img').each(function (index ,item){
        var img_src = $(this).attr('src');
        var reg=/\/+[^!\/]+\./g
        var imgSrc = '',imgName = '';
        
        //图片命名规则
        var imgRegArr = img_src.match(reg);
        var imgNameLen = img_src.match(reg).length;
        if(imgNameLen > 0){
            imgName = imgRegArr[imgNameLen-1].replace('/','').replace('.','');
        }
        imgSrc = img_src.indexOf('http') < 0? httphead + img_src : img_src
        
        if(imgSrc.indexOf('.jpg')>-1){
            imgName +='.jpg'
        }else  if(imgSrc.indexOf('.png')>-1){
            imgName += '.png'
        }else  if(imgSrc.indexOf('.gif')>-1){
            imgName += '.gif'
        }
        request.head(imgSrc,function (err,re,body) { 
            if(err){
                console.log(err)
            }
         })
         //图片下载
         request(imgSrc).pipe(fs.createWriteStream('./image/'+imgName))
        imgArr.push(imgSrc);
    })
}
//ejs处理
app.set('views', './views'); 
app.set('view engine', 'ejs');

app.get('/index',(req,res) =>{
     res.sendFile( __dirname + "/" + "index.html" );
   
  });

  app.get('/show',async (req,res) =>{
    let s =  await startRequest(req.query.spider_url);
    res.render('show',{imgs:imgArr})
 });
  app.listen(3000, function (req, res) {  
    console.log('app is running at port 3000');  
});
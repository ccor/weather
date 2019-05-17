const express = require('express');
const urllib = require('urllib');

const app = express();

app.use(express.static("html"));
app.get('/proxy', function(req, res){
    var url = req.query.url;
    if(url){
        var referer = req.query.referer || url.replace(/\/\/[^./]+/, '//www');
        urllib.request(url, {headers:{
            'Referer': referer
        }}, function(err, data, ret){
            if(err){
                console.log(err);
                res.send('');
            }else{
                res.send(ret.statusCode == 200 ? data.toString() : '');
            }
        })
    }
});




app.listen(8080, ()=>{
    console.log("服务启动成功。");
});


const express = require('express');
const weather = require('./weather');

const app = express();

app.use(express.static("html"));

app.get('/weather/:cityId', weather.get);

app.listen(8080, ()=>{
    console.log("服务启动成功。");
});


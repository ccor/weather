# weather

weather forecast h5 app

h5的天气预报应用。

数据和逻辑来源于 [天气网](http://www.weather.com.cn/);

略微改造，使用了vue进行数据绑定，城市的搜索改为本地js搜索。


## install

需要有nodejs环境，版本建议选择v10+。

建议用 pnpm 取代 npm，获取更清新的感觉；

```
pnpm i
```

接着运行

```
node index
```

## 说明

- 使用了 express 的static模块，映射静态资源，基本上当http服务器用了。
- 使用了 urilib 作为httpclient，代理请求需要校验referer的数据接口。
- 其他前端页面用js库vue和jquery直接用cdn上的。
- raphael 是SVG矢量绘图库。
- 用了h5的localStorage来保存历史城市。


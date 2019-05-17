# weather

weather forecast h5 app

h5的天气预报应用。

是个练手应用，其实我是想说我受够了某天气的广告要自己弄个没广告的。

就叫 “顺溜天气”。

数据和逻辑来源于 [天气网](http://www.weather.com.cn/);

- [第一版v1.0](https://github.com/ccor/weather/tree/v1.0): 略微改造，使用了vue进行数据绑定，城市的搜索改为本地js搜索。
- [第二版v2.0](https://github.com/ccor/weather/tree/v2.0): 适配移动端，加入滑动切换多个城市天气。
- [第三版v3.0](https://github.com/ccor/weather/tree/v3.0): 加入24小时预报数据，加入页面缓存机制。
- [第四版v4.0](https://github.com/ccor/weather/tree/v4.0): 升级城市管理模块。

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
- 其他前端页面用js库vue和zepto放置到本地，使用 [h5的应用缓存](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Using_the_application_cache)。
- raphael 是SVG矢量绘图库。
- 用了h5的localStorage来保存历史城市。
- 数据API在后端会合并和重新包装，并加入缓存防止对源服务器访问过频。
- 把天气页面vue组件化，可以存在多个实例。
- 加入Swiper滑动切换，简单封装为vue组件。
- 分离出折线绘图部分，加入曲线平滑折线。
- 城市数据删除掉国外部分，搜索起来更本地更清新。
- 使用Sortable.js进行拖拽排序，不支持PC端。
- 所有模块都vue组件化了，只不过是用的全局组件注册。

## 问题

- 折线图部分的分段填色部分可能和边线不能完全贴合，因为边线用曲线绘制，而填充区简单使用了插值锚点，未计算该横坐标下在曲线上的点。
- 要注意h5的应用缓存清理起来有点麻烦，而且是废弃特性。


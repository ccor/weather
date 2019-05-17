(function(){
var _dh = function(t){
    var d = t.getDate(),
        h = t.getHours();
    return [(d > 9 ? d : '0'+d), (h > 9 ? h : '0'+ h)].join('');
}

var _dhPast = function(){
    var t = new Date(), h = t.getHours();
    t.setHours(h-1);
    return _dh(t);
}

Vue.component('forcast', {
    template: `
    <div class="forcast"> 
       
        <div class="forcast-content">
          <div class="loadingBox" v-show="loading"><img src="imgs/loading.gif" height="20" width="20"></div>
          <div class="topbar">
                <div class="city">
                    <span class="cityName">{{fdata.cn}}</span>
                </div>
                <div class="updateTime" v-if="fdata.t">{{fdata.t}} 更新</div>
            </div>

            <swiper :options="alarmSwiperOpts" class="alarms" ref="alarmSwiper">
                <a v-for="(a, index) in fdata.w" :key="index" :class="'alarm'+a[1]" class="swiper-slide swiper-no-swiping" href="javascript:void(0);">{{a[3]}}</a>
            </swiper>

            <div class="idxs" v-if="fdata.sk">
                <div class="idx temp left">
                    <span class="tempVal">{{fdata.sk.t}}</span>
                    <span class="tempUnit">℃</span>
                </div>
                <div class="right">
                    <div class="idx aqi" v-if="fdata.sk.aqi" :style="{backgroundColor: fdata.sk.aqisbg}">
                        <span class="aqiVal">{{fdata.sk.aqi}}</span>
                        <span class="aqis">{{fdata.sk.aqis}}</span>
                    </div>
                    <div class="idx wind">
                        <span class="windD">{{fdata.sk.wd}}</span>
                        <span class="windS">{{fdata.sk.wl}}</span>
                    </div>
                    <div class="idx sd">
                        <span>相对湿度</span>
                        <span class="sdVal">{{fdata.sk.sd}}</span>
                    </div>
                </div>
            </div>

            <swiper :options="trend24hSwiperOpts" extWrapperClass="trend-24h-all" class="trend-24h-container" ref="trend24hSwiper">
                <div v-for="(i, index) in fh.a" :key="index" class="swiper-slide col">
                    <div class="holder"></div>
                    <div class="time">{{i[0].substring(2)}}</div>
                </div>
                <div class="dline" ref="dl24h"></div>
                <div class="icons">
                    <div v-for="(i, index) in fh.b" :style="{width: i[1]*45 + 'px'}"><i class="wicon" :class="i[0]"></i></div>
                </div>
                <div class="wls">
                    <div v-for="(i, index) in fh.c" class="wl" :style="{width: i[1]*45-1 + 'px'}">{{i[0] | wl}}</div>
                </div>
                <template #footer>
                    <div class="swiper-scrollbar" slot="scrollbar"></div>
                </template>
            </swiper>

            <div class="trend-1d-container">
                <div v-for="i in fdata.fd.d" class="col">
                    <div class="weekday">{{i[0]}}</div>
                    <div class="icon"><i class="wicon" :class="'d'+i[3]"></i></div>
                    <div class="holder"></div>
                    <div class="icon"><i class="wicon" :class="'n'+i[4]"></i></div>
                    <div class="wd">{{fdata.fd.dn ? i[5] : i[6]}}</div>
                    <div class="wl">{{fdata.fd.dn ? i[7] : i[8]}}</div>
                </div>
                <div class="dline topTemp" ref="topTemp"></div>
                <div class="dline lowTemp" ref="lowTemp"></div>
            </div>

            <ul class="zsList" v-if="fdata.zs">
                <li class="zs zwx">
                    <div class="zsIcon"></div>
                    <div class="zsTitle">紫外线指数</div>
                    <div class="zsText">{{fdata.zs.zwx}}</div>
                </li>
                <li class="zs cy">
                    <div class="zsIcon"></div>
                    <div class="zsTitle">穿衣指数</div>
                    <div class="zsText">{{fdata.zs.cy}}</div>
                </li>
                <li class="zs xc">
                    <div class="zsIcon"></div>
                    <div class="zsTitle">洗车指数</div>
                    <div class="zsText">{{fdata.zs.xc}}</div>
                </li>
                <li class="zs gm">
                    <div class="zsIcon"></div>
                    <div class="zsTitle">感冒指数</div>
                    <div class="zsText">{{fdata.zs.gm}}</div>
                </li>
            </ul>
        </div> 
    </div>  
    `,
    props: ['cityId'],
    data: function(){
        return {
            loading: false,
            tip: '下拉刷新',
            fdata: {fd:{}},
            forcastSwiperOpts: {
                direction: 'vertical',
                on:{ 
                    touchMove(){
                        this.tip = this.$el.swiper.translate > 50 ? '松开刷新' : '下拉刷新';
                    },
                    touchEnd(){
                        if(this.translate > 50){
                            this.getForcastData();
                        }
                    }
                }
            },
            alarmSwiperOpts: {
                direction: 'vertical',
                autoplay: { disableOnInteraction: false },
                loop: true
            },
            trend24hSwiperOpts: {
                slidesPerView: 'auto',
                freeMode: true,
                scrollbar: {
                    el: '.swiper-scrollbar',
                    hide: true
                }
            }
        };  
    },
    computed: {
        fh: function(){
            if(this.fdata.fh){
                var h = this.fdata.fh.h,
                    dh = _dhPast(),
                    i = h.findIndex((v) => {
                        return v >= dh;
                    });
                var a = i > -1 ? h.slice(i, i + 24 < h.length ? i + 24 : h.length - 1) : [];
                a = a.map(function(it){
                    var t = parseInt(it[0].substring(2));
                    it[2] = (t < 6 || t >= 20 ? 'n' : 'd') + it[2];
                    return it;
                });
                //e.g. ['d01', 1], ['d01',3]
                var t = null, t2 = null;
                var b = [], c = [], index = -1, index2 = -1;
                for(var i in a){
                    if(t == a[i][2]){
                        b[index][1] ++;
                    }else{
                        t = a[i][2];
                        b[++index] = [t, 1];
                    }
                    if(t2 == a[i][4]){
                        c[index2][1] ++;
                    }else{
                        t2 = a[i][4];
                        c[++index2] = [t2, 1];
                    }
                }

                return {a, b, c};

            }
            return {};
        }
    },
    watch: {

        fdata: function(d){
            if(d.fd.ld){
                this.reDrawLine();
            }

            if(d.fh && d.fh.h){
                this.$nextTick(function(){
                        drawLine2({
                            el: this.$refs.dl24h,
                            width: 45 * this.fh.a.length,
                            height: 100,
                            data: this.fh.a.map((i)=>{return i[1]}),
                            color: '#8ec2f2',
                            above: true,
                            data2: this.fh.b
                        });
                    // }
                })
            }
            this.$nextTick(function(){
                this.$emit('update', this.fdata);
                if(this.$el.swiper){

                    this.$el.swiper.update();
                }else{
                    var vm = this;
                }
            });
        }
    },
    mounted: function(){
        this.getForcastData();
    },
    beforeDestroy: function(){
        if(this.$refs.alarms && this.$refs.alarms.swiper){
            this.$refs.alarms.swiper.destroy();
        }
    },
    filters: {
        wd: (v) => ["无持续风向", "东北风", "东风", "东南风", "南风", "西南风", "西风", "西北风", "北风", "旋转风"][v],
        wl: (v) => ["<3级", "3-4级", "4-5级", "5-6级", "6-7级", "7-8级", "8-9级", "9-10级", "10-11级", "11-12级"][v]
    },
    methods: {
        resize: function(){
            if(this.fdata.fd.ld){
                this.reDrawLine();
            }
         },
        reDrawLine: function(){
            this.$nextTick(function(){
                drawLine({
                    el: this.$refs.topTemp,
                    height: 60,
                    data: this.fdata.fd.ld[0],
                    color: '#f68d3b',
                    above: true
                });
                drawLine({
                    el: this.$refs.lowTemp,
                    height: 60,
                    data: this.fdata.fd.ld[1],
                    color: '#8ec2f2',
                    above: false
                });
            })
        },
        getForcastData: function(){
            if(!this.cityId){
                return;
            }
            this.loading = true;

            var vm = this;
            $.getJSON('/weather/' + this.cityId, function(ret) {
                
                if(ret.sk){
                    var sk = ret.sk;
                    var AQIS = [['优' ,'#9CCA7F'], ['良','#F9DA65'], ['轻度污染','#F29F39'], ['中度污染','#DB555E'], ['重度污染','#BA3779'], ['严重污染','#881326']];
                    var aqi = sk.aqi;
                    var AQI = AQIS[(aqi > 0 && aqi < 50) ? 0 : (aqi >= 50 && aqi < 100) ? 1 : (aqi >= 100 && aqi < 150) ? 2 : (aqi >= 150 && aqi <= 200) ? 3 : (aqi > 200 && aqi <= 300) ? 4 : 5];
                    sk.aqis = AQI[0];
                    sk.aqisbg = AQI[1];
                }
                
                if(ret.fd){
                    var ld = ret.fd.ld = [[],[]],
                        h = new Date().getHours();
                    ret.fd.dn = h > 0 && h < 18;
                    for(var i = 0, len = ret.fd.d.length; i < len; i++){
                        var f = ret.fd.d[i];
                        ld[0].push(f[1]);
                        ld[1].push(f[2]);
                    }
                }

                vm.fdata = Object.assign({}, vm.fdata, ret);
                vm.loading = false;
            });
        }
    }
});


})();

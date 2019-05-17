$(document).ready(function(){

    var regNum = new RegExp("^[0-9]*[0-9][0-9]*$"),
        regEn = new RegExp("^[A-Za-z]+$"),
        regCn = new RegExp("[一-龥]");

    
    var debounce = (func, wait) => {
        var timeout, args, context, timestamp, result
        var later = function() {
          var last = Date.now() - timestamp
          if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last)
          } else {
            timeout = null
            result = func.apply(context, args)
            if (!timeout) context = args = null
          }
        }
        return function() {
          context = this
          args = arguments
          timestamp = Date.now()
          if (!timeout) {
            timeout = setTimeout(later, wait)
          }
          return result
        }
    };


    Vue.component('forcast', {
        template: '#forcast-template',
        props: ['cityId'],
        data: function(){
            return {
                loading: false,
                fdata: {}
            };
        },
        watch: {
            fdata: function(d){
                if(d.ld1){
                    this.reDrawLine();
                }

                if(d.alarms){
                    this.$nextTick(function(){
                        if(this.$refs.alarms.swiper){
                            if(d.alarms.length > 1){
                                this.$refs.alarms.swiper.update();
                            }else{
                                this.$refs.alarms.swiper.destroy();
                            }

                        }else{
                            if(d.alarms.length > 1){
                                new Swiper(this.$refs.alarms, {
                                    direction: 'vertical',
                                    autoplay: {disableOnInteraction: false},
                                    loop: true
                                });
                            }
                        }
                    });
                }
            }
        },
        mounted: function(){
            this.getForcastData(this.cityId);
        },
        beforeDestroy: function(){
            if(this.$refs.alarms && this.$refs.alarms.swiper){
                this.$refs.alarms.swiper.destroy();
            }
        },
        methods: {
            resize: function(){
                if(this.fdata.ld1){
                    this.reDrawLine();
                }
             },
            reDrawLine: function(){
                this.$nextTick(function(){
                    drawLine({
                        el: this.$refs.topTemp,
                        height: 60,
                        data: this.fdata.ld1,
                        color: '#f68d3b',
                        above: true
                    });
                    drawLine({
                        el: this.$refs.lowTemp,
                        height: 60,
                        data: this.fdata.ld2,
                        color: '#8ec2f2',
                        above: false
                    });
                })
            },
            getForcastData: function(cityId){
                var url = "http://d1.weather.com.cn/weather_index/" + cityId + ".html";
                this.loading = true;

                var vm = this;
                $.get('/proxy?url='+encodeURIComponent(url), function(data) {
                    var t = data.split(/;? ?var *(\w+) *= */);
                    if(t.length > 2){
                        t[0] = '{';
                        for(var i = 1; i < 10; i++){
                            if(i % 2  == 1){
                                t[i] = '"'+t[i]+'":'
                            }else{
                                t[i] += ',';
                            }
                        }
                        t[10] += '}';
                    }
                    var ret = {};
                    try{
                        var ret = JSON.parse(t.join(''));
                    }catch(e){
                        console.log(e);
                    }
                    
                    var fdata = {sk: null, zs: null, fc:null, ld1: null, ld2: null, alarms: null};

                    if(ret.dataSK){
                        var dataSK = ret.dataSK;
                        var sk = fdata.sk = {};
                        var AQIS = [['优' ,'#9CCA7F'], ['良','#F9DA65'], ['轻度污染','#F29F39'], ['中度污染','#DB555E'], ['重度污染','#BA3779'], ['严重污染','#881326']];
                        var aqi = sk.aqi = dataSK.aqi;
                        var AQI = AQIS[(aqi > 0 && aqi < 50) ? 0 : (aqi >= 50 && aqi < 100) ? 1 : (aqi >= 100 && aqi < 150) ? 2 : (aqi >= 150 && aqi <= 200) ? 3 : (aqi > 200 && aqi <= 300) ? 4 : 5];
                        sk.aqis = AQI[0];
                        sk.aqisbg = AQI[1];
                        sk.temp = dataSK.temp;
                        sk.sd = dataSK.sd;
                        sk.windD = dataSK.WD;
                        sk.windS = dataSK.WS;
                        fdata.updateTime = dataSK.time;
                        fdata.cityName = dataSK.cityname;
                    }else{
                        fdata.updateTime = null;
                    }

                    if(ret.dataZS){
                        var dataZS = ret.dataZS;
                        var zs = fdata.zs = {};
                        zs.zwx = dataZS.zs.uv_hint;
                        var ct = dataZS.zs.ct_hint;
                        zs.cy = ("炎热" == ct || "热" == ct) ? "短袖" : ("舒适" == ct) ? "衬衫" : ("较舒适" == ct) ? "薄外套" : ("较冷" == ct) ? "厚毛衣" : "羽绒服";
                        zs.xc = dataZS.zs.xc_hint;
                        zs.gm = dataZS.zs.gm_hint;
                    }

                    
                    var ld1,ld2;
                    if(ret.fc){
                        var fc = ret.fc,
                            fc0 = fdata.fc = [],
                            ld1 = fdata.ld1 = [],
                            ld2 = fdata.ld2 = [],
                            date = new Date().getHours(),
                            dn = date > 0 && date < 18, len = fc.f.length > 5 ? 5 : fc.f.length;
                        for(var i = 0; i < len; i++){
                            var f = fc.f[i];
                            fc0[i]= {fj: f.fj, d: 'd' + f.fa, n: 'n' + f.fb, w: dn ? f.fe : f.ff, wl : dn ? f.fg : f.fh};
                            ld1[i] = f.fc;
                            ld2[i] = f.fd;
                        }
                    }

                    if(ret.alarmDZ && ret.alarmDZ.w && ret.alarmDZ.w.length > 0){
                        var alarms = fdata.alarms = [];
                        var alarmDZ = ret.alarmDZ;
                        var w = alarmDZ.w;
                        var lnk = 'http://www.weather.com.cn/alarm/newalarmcontent.shtml?file=';
                        for(var i = 0; i < w.length; i++){
                            var color = w[i].w7;
                            alarms[i] = {
                                clazz:  color == '蓝色' ? 'alarmB' : color == '黄色' ? 'alarmY' : color == '红色' ? 'alarmR' : color == '白色' ? 'alarmW' : 'alarmO',
                                text: (w[i].w3 ? w[i].w3 : w[i].w2 ? w[i].w2 : w[i].w1) + '发布' + w[i].w5 + w[i].w7 + '预警'
                            };
                        }
                    }

                    vm.fdata = Object.assign({}, vm.fdata, fdata);
                    vm.loading = false; 

                });
            }
        }
    });

    var app = new Vue({
        el: '#app',
        data: {
            cities: [],
            forcasts: []
        },
        mounted: function(){
            this.cities = this.loadCities();
            if(this.cities.length == 0){
                this.recCity('101010100', '北京');
            }
            this.$nextTick(function(){
                new Swiper(this.$refs.forcastBox, {
                    pagination: {
                      el: '.swiper-pagination'
                    }
                });
                window.addEventListener('resize', debounce((e)=>{
                    for(var i in this.$children){
                        var vm = this.$children[i];
                        if(vm.resize){
                            vm.resize();
                        }
                    }
                }, 300));
            })
        },
        methods: {
            updateSwiper: function(){
                this.$nextTick(function(){
                    if(this.$refs.forcastBox.swiper){
                        this.$refs.forcastBox.swiper.update();
                    }
                });
            },
            loadCities: function(){
                if(window.localStorage){
                    return JSON.parse(localStorage.getItem('cities'))||[];
                }
                return [];
            },
            saveCities: function(){
                if(window.localStorage){
                    localStorage.setItem('cities', JSON.stringify(this.cities))
                }
            },
            recCity: function(cityId, cityName){

                var cities = this.cities;
                var has = false;
                $.each(cities, function(i, c){
                    if(cityId == c.i){
                        cities.unshift(cities.splice(i, 1)[0]);
                        has = true;
                        return false;
                    }
                });
                if(!has){
                    cities.unshift({i: cityId, c: cityName});
                    if(cities.length > 10){
                        cities.splice(10);
                    }
                }
                this.saveCities();

            },
            delCity: function (cityId){
                var cities = this.cities;
                $.each(cities, function(i, c){
                    if(cityId == c.i){
                        cities.splice(i, 1);
                        return false;
                    }
                });
                this.saveCities();
                this.updateSwiper();
            },
            swtichCity: function(){
                var input = $(".cityInputBox input[name=cityName]");
                var cityId = input.attr('num') || '';
                var cityName = input.val();
                if(cityId){
                    this.cityName = cityName;
                    $(".citySwtichBox").hide();
                    this.recCity(cityId, cityName);
                    this.getWeather(cityId);
                    input.attr('num', '').val('');
                }

            },
            swtichHisCity: function(cityId, cityName){
                this.cityName = cityName;
                this.recCity(cityId, cityName);
                this.getWeather(cityId);
                $(".citySwtichBox").hide();
            },
            getWeather: function(cityId){
                this.$nextTick(function(){
                    if(this.$refs.forcastBox.swiper){
                        this.$refs.forcastBox.swiper.update();
                    }
                })
            },
            showCitySwtich: function(){
                $(".citySwtichBox").show();
            }
        }
    });


    $(".citySwtichBox .close").on('click', function(e) {
        $(".citySwtichBox").hide();
    });
    $(".cityInputBox .cityList").on('click', 'li', function(){
        $(".cityInputBox input[name=cityName]").val($(this).text().split('-')[0]).attr('num', $(this).attr('num'));
        $(".cityInputBox .cityList").hide();
    });
    $(".cityInputBox input[name=cityName]").focus(function() {
        $(this).val("").attr('num', '');
    }).keyup(function(){
        var a = $(this).val(), hs = '', n = 0;
        if(a.length > 0){
            var ar = new RegExp(a, 'ig');
            if(regNum.test(a)){
                $.each(CITIES, function(i, c){
                    return ar.test(c[0]) ? (hs += ['<li num="', c[0], '">', c[1], '-', c[3], '-', c[0].replace(ar, '<b>$&</b>'), '</li>'].join(''), ++n < 10) : !0;
                })
            }else if(regEn.test(a)){
                $.each(CITIES, function(i, c){
                    return ar.test(c[2])? (hs += ['<li num="', c[0], '">', c[1], '-', c[3], '-', c[2].replace(ar, '<b>$&</b>'), '</li>'].join(''), ++n < 10) : !0;
                })
            }else if(regCn.test(a)){
                $.each(CITIES, function(i, c){
                    return ar.test(c[1]) || ar.test(c[3]) ? (hs += ['<li num="', c[0], '">', (c[1] + '-' + c[3]).replace(ar, '<b>$&</b>'), '</li>'].join(''), ++n < 10) : !0;
                })
            }
        }
        $(".cityInputBox .cityList").html(hs).toggle(!!hs);;
    });

});




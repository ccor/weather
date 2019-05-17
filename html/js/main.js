
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
        template: '#forcast-template',
        props: ['cityId'],
        data: function(){
            return {
                loading: false,
                fdata: {fd:{}}
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
                    var a = h.slice(i, i + 24 < h.length ? i + 24 : h.length - 1);

                    a = a.map(function(it){
                        var t = parseInt(it[0].substring(2));
                        it[2] = (t < 6 || t >= 20 ? 'n' : 'd') + it[2];
                        return it;
                    });
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

                if(d.w){
                    this.$nextTick(function(){
                        if(this.$refs.alarms.swiper){
                            if(d.w.length > 1){
                                this.$refs.alarms.swiper.update();
                            }else{
                                this.$refs.alarms.swiper.destroy();
                            }

                        }else{
                            if(d.w.length > 1){
                                new Swiper(this.$refs.alarms, {
                                    direction: 'vertical',
                                    autoplay: {disableOnInteraction: false},
                                    loop: true
                                });
                            }
                        }
                        
                    });
                }

                if(d.fh && d.fh.h){
                    this.$nextTick(function(){
                        if(this.$refs.trend24h.swiper){

                        }else{
                            var s = new Swiper(this.$refs.trend24h, {
                                slidesPerView: 'auto',
                                freeMode: true,
                                scrollbar: {
                                    el: '.swiper-scrollbar',
                                    hide: true
                                }
                            });
                        }

                        drawLine2({
                            el: this.$refs.dl24h,
                            width: 45 * this.fh.a.length,
                            height: 100,
                            data: this.fh.a.map((i)=>{return i[1]}),
                            color: '#8ec2f2',
                            above: true,
                            data2: this.fh.b
                        });
                    })
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
        filters: {
            wd (v) {
                return ["无持续风向", "东北风", "东风", "东南风", "南风", "西南风", "西风", "西北风", "北风", "旋转风"][v];
            },
            wl (v) {
                return ["<3级", "3-4级", "4-5级", "5-6级", "6-7级", "7-8级", "8-9级", "9-10级", "10-11级", "11-12级"][v];
            }
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
            getForcastData: function(cityId){
                this.loading = true;

                var vm = this;
                $.getJSON('/weather/'+cityId, function(ret) {
                    
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





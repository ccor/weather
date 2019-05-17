
$(document).ready(function(){

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
    
    function loadCities(){
        if(window.localStorage){
            return JSON.parse(localStorage.getItem('cities') || '[]');
        }
        return [];
    }
    function saveCities(cities){
        if(window.localStorage){
            localStorage.setItem('cities', JSON.stringify(cities));
        }
    }

    var app = new Vue({
        el: '#app',
        data: {
            msg: '',
            citySelectorShow: false,
            cityNameIn: '',
            cityList: [],
            cities: loadCities(),
            mainSwiperOpts:{
                initialSlide: 1,
                resistanceRatio: 0
            },
            forcastSwiperOpts:{
                pagination: {
                  el: '.swiper-pagination'
                },
                on: {
                    touchMove: function(e){
                        if(this.$el.swiper.translate > 50){
                            this.$parent.$emit('swipe-right');
                        }
                    }
                }
            }
        },
        watch:{
            cities: function(n, o){
                saveCities(this.cities);
            }
        },
        mounted: function(){
            if(this.cities.length == 0){
                this.addCity('101010100', '北京');
            }
            this.$nextTick(function(){
                var vm = this;
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
            onSwipeRight: function(){
                this.$refs.mainSwiper.$el.swiper.slideTo(0, 500);
            },
            update: function(fdata){
                for(var i in this.cities){
                    if(this.cities[i].i == fdata.ci){
                        var d = {};
                        if(fdata.fd){
                            var c = fdata.fd.d[0];
                            d.tr = c[1] + '/' + c[2];
                            d.ic = fdata.fd.dn ? 'd'+c[3] : 'n' + c[4];
                         }
                         if(fdata.sk){
                            d.t = fdata.sk.t;   
                         }
                        this.$set(this.cities[i], 'd', d);
                    }
                }
            },
            addCity: function(ci, cn){
                var cities = this.cities;
                var has = false;
                $.each(cities, function(i, c){
                    if(ci == c.i){
                        has = true;
                        return false;
                    }
                });
                if(!has){
                    cities.push({i: ci, c: cn});
                }

            },
            sortCity: function(o, n){
                this.cities.splice(n, 1, ...this.cities.splice(o, 1 , this.cities[n]));
            },
            delCity: function (cityId){
                var cities = this.cities;
                $.each(cities, function(i, c){
                    if(cityId == c.i){
                        cities.splice(i, 1);
                        return false;
                    }
                });
            },
            showCitySelector: function(){
                if(this.cities.length > 8){
                    this.toast('最多只能添加9个城市!');
                }else{
                    this.citySelectorShow = true;
                }
            },
            toast: function(msg){
                this.$refs.toast.show(msg);
            }
        }

    });


});





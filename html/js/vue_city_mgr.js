(function(){

var regNum = new RegExp("^[0-9]*[0-9][0-9]*$"),
    regEn = new RegExp("^[A-Za-z]+$"),
    regCn = new RegExp("[一-龥]");

Vue.component('toast', {
    template:`
    <div class="m-toast-pop">      
        <div class="m-toast-inner">
            <div class="m-toast-inner-text">{{msg}}</div>
        </div>      
    </div>
    `,
    data (){
        return {
            msg: ''
        }
    },
    methods: {
        show (txt) {
            this.msg = txt;
            var el = this.$el;
            $(el).fadeIn();
            setTimeout(function() {
                $(el).fadeOut();
            }, 2000);
        }
    }
});

Vue.component('city-selector', {
    template: `
    <div class="citySwtichBox" :class="{hide: !value}">
        <div class="cityInputBox">
            <input type="text" class="itext" placeholder="请输入城市名称" v-model="cityNameIn" @keyup="cityNameInputKeyup"/>
            <a href="javascript:void(0);" class="btn btn-cancel" @click="hideCitySwtich">取消</a>
        </div>
        <ul class="cityList">
            <li v-for="c in cityList" v-html="c.t" @click="clickCity(c)" :class="{added: c.c}"></li>
        </ul>
    </div>
    `,
    props:['value', 'cities'],
    data: function(){
        return {
            cityNameIn: '',
            cityList: []
        };
    },
    methods: {
        clickCity: function(c){
            if(c && !c.c){
                this.$emit('choose', c.i, c.n);
                this.hideCitySwtich();
            }
        },
        hideCitySwtich: function(){
            this.cityNameIn = '';
            this.cityList = [];
            this.$emit("input", false);
        },
        cityNameInputKeyup: function(){
            var a = this.cityNameIn, l=[], n=0, max=16, vm = this;
            if(a.length > 0){
                var ar = new RegExp(a, 'ig');
                if(regNum.test(a)){
                    $.each(CITIES, function(i, c){
                        return ar.test(c[0]) ? (l.push({i: c[0], n: c[1], t: [c[1], c[3], c[0].replace(ar, '<b>$&</b>')].join('-')}), ++n < max) : !0 ;
                    })
                }else if(regEn.test(a)){
                    var ar2 = a.length < 4 ? new RegExp(a.split('').join('\\w{0,4}')) : 0;
                    $.each(CITIES, function(i, c){
                        return ar.test(c[2])? (l.push({i: c[0], n: c[1], t: [c[1], c[3], c[2].replace(ar, '<b>$&</b>')].join('-')}), ++n < max) 
                        : (ar2 && ar2.test(c[2])) ? (l.push({i: c[0], n: c[1], t: [c[1], c[3], c[2].replace(ar2, '<b>$&</b>')].join('-')}), ++n < max) : !0;
                    })

                }else if(regCn.test(a)){
                    $.each(CITIES, function(i, c){
                        return ar.test(c[1]) || ar.test(c[3]) ? (l.push({i: c[0], n: c[1], t: (c[1] + '-' + c[3]).replace(ar, '<b>$&</b>')}), ++n < max) : !0;
                    })
                }
                $.each(l, function(i, c){
                    var pos = vm.cities.findIndex(function(v){
                        return v.i == c.i;
                    });
                    if(pos > -1){
                        c.c = !0;
                        c.t += ' (已添加)';
                    }
                });
                this.cityList = l;
            }else{
                this.cityList = [];
            }
        }
    }
});


Vue.component('city-mgr', {
    template: `
     <div class="cities">
        <div class="opbar">
            <a href="javascript:void(0);" class="btn btn-add" @click="$emit('add')">+</a>
            <div class="title">城市列表</div>
            <a href="javascript:void(0);" class="btn btn-mod" @click="editing = !editing">{{editing ? '完成' : '编辑'}}</a>
        </div>

        <draggable :list="list" handle=".handle" class="city-list" direction="vertical" @end="onEnd">
           <div v-for="c in cities" :key="c.i" class="city">
                <i class="iconfont icon-delete-s" v-show="editing" @click="$emit('del', c.i)"></i>
                <div class="cityname">{{c.c}}</div>
                <div class="winfo" v-if="c.d">
                    <div class="temp">{{c.d.t}}℃</div>
                    <div class="temp-range">{{c.d.tr}}℃</div>
                    <div class="icon"><i class="wicon" :class="c.d.ic"></i></div>
                </div>
                <i class="iconfont icon-caidan handle" v-show="editing"></i>
           </div>
        </draggable>

    </div>
    `,
    props:['cities'],
    data: function(){
        return {
            citySelectorShow: false,
            editing: false
        };
    },
    computed: {
        list: function(){
            return Object.assign([], this.cities);
        }
    },
    methods: {
        onEnd: function(e){
            if(e.newIndex != e.oldIndex){
                this.$emit('sort', e.oldIndex, e.newIndex);
            }
        }
    }
});


})();
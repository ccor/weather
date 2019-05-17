(function(){


Vue.component('swiper', {
    template:`
    <div class="swiper-container">      
        <slot name="header"></slot>
        <div class="swiper-wrapper" :class="extWrapperClass">
            <slot></slot>
        </div>
        <slot name="footer"></slot>
    </div>
    `,
    props: ['options', 'extWrapperClass'],
    data (){
        return {
        }
    },
    mounted: function(){
        this.update();
    },
    updated (){
        this.update();
    },
    beforeDestroy() {
        this.$nextTick(function() {
            if (this.$el.swiper && this.$el.swiper.destroy) {
               this.$el.swiper.destroy()
            }
        })
    },
    methods: {
       init (){
            var opts = Object.assign({}, this.options);
            if(opts.on){
                Object.keys(opts.on).forEach(key => {
                    opts.on[key] = opts.on[key].bind(this);
                });
            }
            var swiper = new Swiper(this.$el, opts);
            return swiper;
       },
       update () {
            this.$nextTick(()=>{
                //根据slide的数量决定swiper的初始化及更新
                var len = this.$el.querySelectorAll('.swiper-wrapper:first-of-type > .swiper-slide').length;
                var swiper = this.$el.swiper;

                if(len == 0) {
                    if(swiper){
                        swiper.destroy();
                    }
                    return;
                }

                if(swiper){
                    swiper.update();
                }else{
                    swiper = this.init();
                }

                if(this.options.autoplay){
                    if( this.options.loop ? len > 3 : len > 1){
                        swiper.autoplay.start();
                    }else{
                        swiper.autoplay.stop();
                    }
                }
            });
       }
    }
});

})();
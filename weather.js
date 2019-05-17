const urllib = require('urllib');
const fs = require('fs');

const WEATHER_CACHE_FILE = 'weather_{cityId}.json';

function dualNum(i){
    return String(i > 9 ? i : '0' + i); 
}
function ymd(d){
    return d.getFullYear()+ dualNum(d.getMonth()+1)+ dualNum(d.getDate());
}
function script2json(txt){
    var t = txt.split(/[; \n\r\t]*var *(\w+) *= */);
     var lt = t[t.length-1];
     if(lt.length > 1 && lt.charAt(lt.length-1) == ';'){
        t[t.length-1] = lt.substring(0, lt.length-1);
     }
    if(t.length > 2){
        t[0] = '{';
        for(var i = 1; i < t.length-1; i++){
            if(i % 2  == 1){
                t[i] = '"'+t[i]+'":'
            }else{
                t[i] += ',';
            }
        }
        t[t.length-1] += '}';
    }
    var o = {};
    try{
        o = JSON.parse(t.join(''));
    }catch(e){
        console.log(e);
    }
    return o;
}
function ct2cy(ct){
    return ("炎热" == ct || "热" == ct) ? "短袖" : ("舒适" == ct) ? "衬衫" : ("较舒适" == ct) ? "薄外套" : ("较冷" == ct) ? "厚毛衣" : "羽绒服"
}

async function req(url, referer){
    return await urllib.request(url, {headers:{
        'Referer': referer || uri.replace(/\/\/[^./]+/, '//www')
    }}).catch(function(err){
        console.error(err);
    });
}



async function getWeather (cityId){
    var n = {};
    var ret = await req('http://d1.weather.com.cn/weather_index/'+cityId+'.html', 'http://www.weather.com.cn/');
    if(ret && ret.res.statusCode == 200){
        var txt = ret.data.toString();
        var o = script2json(txt);

        if(o.dataSK){
            var sk = o.dataSK;
            n.t = sk.time, n.ci = sk.city, n.cn = sk.cityname;
            n.sk = {t:sk.temp, aqi:sk.aqi, sd:sk.sd, wd:sk.WD, wl:sk.WS};
        }
        if(o.dataZS && o.dataZS.zs){
            var zs = o.dataZS.zs;
            n.zs = {zwx: zs.uv_hint, ct: zs.ct_hint, cy:ct2cy(zs.ct_hint), xc:zs.xc_hint, gm:zs.gm_hint};
        }
        if(o.fc){
            var d = [];
            n.fd = {d};
            for(var i = 0, len = o.fc.f.length; i < len; i++){
                var f = o.fc.f[i];
                //[weekday, top, low, d, n, wd1, wd2, wl1, wl2]
                d.push([f.fj, f.fc, f.fd, f.fa, f.fb, f.fe, f.ff, f.fg, f.fh]);
            }
        }

        if(o.alarmDZ && o.alarmDZ.w && o.alarmDZ.w.length > 0){
            var a = o.alarmDZ.w;
            n.w = [];
            for(var i in a){
                var w = a[i];
                //[kind, grade, pubtime, title, content, link]
                n.w.push([w.w4, w.w6, w.w8, w.w13, w.w9, w.w11]);
            }
        }
    }

    ret = await req('http://www.weather.com.cn/weather1dn/'+cityId+'.shtml', 'http://www.weather.com.cn/weather1d/'+cityId+'.shtml');
    if(ret && ret.res.statusCode == 200){
        var txt = ret.data.toString();
        var pos  = txt.indexOf('var hour3data');
         if(pos > 0){
            var txt= txt.substring(pos, txt.indexOf('</script>', pos)).trim();
            var o = script2json(txt);
            var now = new Date();
            var ymd1 = ymd(now);
            now.setDate(now.getDate()+1);
            ymd2 = ymd(now);

            var h = n.fh = {t: o.uptime.substring(0, 5), s: [o.sunup[0], o.sunset[0]], h: []};
            for(var i = 0; i < 3; i++){
                var c = o.hour3data[i];
                for(var j = 0, len = c.length; j < len; j++){
                    var x = c[j], d = x.jf.substring(0, 8);
                    if(d == ymd1 || d == ymd2){
                        //[ddHH,temp,icon,wd,wl]
                        h.h.push([x.jf.substring(6), x.jb, x.ja, x.jd, x.jc]);
                    }
                }
            }
        }
    }
    return n;
}

function isValidJson(txt){
    try{
        JSON.parse(txt);
        return true;
    }catch(e){
        return false;
    }
}

exports.get = (req, res) => {
    var txt, cityId = req.params.cityId, f = WEATHER_CACHE_FILE.replace('{cityId}', cityId);
    if(fs.existsSync(f) && Date.now() - fs.statSync(f).mtimeMs < 7200000){
        txt = fs.readFileSync(f).toString();
        if(isValidJson(txt)){ //load from cache
            res.send(txt);
            return;
        }
    }

    getWeather(cityId).then(function(data){
        fs.writeFileSync(f, JSON.stringify(data));
        res.send(data);
    });
    
}

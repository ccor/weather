function getAnchors(p1x, p1y, p2x, p2y, p3x, p3y) {
    var l1 = (p2x - p1x) / 2,
        l2 = (p3x - p2x) / 2,
        a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y)),
        b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y));
    a = p1y < p2y ? Math.PI - a : a;
    b = p3y < p2y ? Math.PI - b : b;
    var alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2,
        dx1 = l1 * Math.sin(alpha + a),
        dy1 = l1 * Math.cos(alpha + a),
        dx2 = l2 * Math.sin(alpha + b),
        dy2 = l2 * Math.cos(alpha + b);
    return {
        x1: p2x - dx1,
        y1: p2y + dy1,
        x2: p2x + dx2,
        y2: p2y + dy2
    };
}

function drawLine(opt){
    var data = opt.data || [],
        len = data.length,
        ele = typeof opt.el == 'string' ? document.getElementById(opt.el) : opt.el,
        width = opt.width || ele.offsetWidth,
        height = opt.height,
        color = opt.color,
        pos = opt.above ? -14 : 14;
    
    var max = Math.max(...data), min = Math.min(...data);
    var w = width / len, h = max == min ? (height - 40) / 1 : (height - 40) / (max - min);
    var c = [], p;

    ele.innerHTML = '';
    var paper = Raphael(ele, width, height);
    paper.clear();

    for(var i = 0; i < len; i++){
        var x = Math.round(w * i + w / 2), y = Math.round((max - data[i]) * h + 20);
        c.push({x, y});
        paper.circle(x, y, 2).attr({
            fill: color,
            stroke: color
        });
        paper.text(x - 15, y + pos, data[i] + "℃").attr({
            fill: "#333",
            "font-size": "12px",
            "text-anchor": "start"
        });
        if(!i){
            p = ["M", x, y, "C", x, y];
        }else if( i > 1){
            var pt1 = c[i-2], pt2 = c[i-1];
            var a = getAnchors(pt1.x, pt1.y, pt2.x, pt2.y, x, y);
            p = p.concat([a.x1, a.y1, pt2.x, pt2.y, a.x2, a.y2]);
        }
    }
    p = p.concat([x, y, x, y]);
    paper.path().attr({'path':p}).attr({stroke: color});
}


function drawLine2(opt){
    var data = opt.data || [],
        len = data.length,
        ele = typeof opt.el == 'string' ? document.getElementById(opt.el) : opt.el,
        width = opt.width || ele.offsetWidth,
        height = opt.height,
        color = opt.color,
        pos = opt.above ? -14 : 14,
        gutter = 10,
        data2 = opt.data2 || [['', len]];
    
    var max = Math.max(...data), min = Math.min(...data);
    var w = width / len,
        h = max == min ? (height - gutter - 40) / 1 : (height - gutter - 40) / (max - min);
    var c = [], p = [], bgp = [];

    ele.innerHTML = '';
    var paper = Raphael(ele, width, height);
    paper.clear();

    for(var i = 0 , j = 0 , k = 0 , o = !0; i < len; i++){
        var x = Math.round(w * i + w / 2), y = Math.round((max - data[i]) * h + 20);
        c.push({x, y});
        paper.circle(x, y, 2).attr({
            fill: color,
            stroke: color
        });
        paper.text(x - 15, y + pos, data[i] + "℃").attr({
            fill: "#333",
            "font-size": "12px",
            "text-anchor": "start"
        });

        if(!i){
            p = ["M", 0, y, "C", 0, y, 0, y, x, y, x, y];
            bgp = ["M", 0, height, "L", 0, y, "C", x, y];
        }else if( i > 1){
            var pt1 = c[i-2], pt2 = c[i-1];
            var a = getAnchors(pt1.x, pt1.y, pt2.x, pt2.y, x, y);
            p = p.concat([a.x1, a.y1, pt2.x, pt2.y, a.x2, a.y2]);

            if(k < data2[j][1]){
                bgp = bgp.concat([a.x1, a.y1, pt2.x, pt2.y, a.x2, a.y2]);
            }else if(k == data2[j][1]) {
                bgp = bgp.concat([a.x1, a.y1, a.x2, a.y2, "L", a.x2, height, "z"]);
                paper.path().attr({path: bgp}).attr({stroke: "none", opacity: o ? .3 : .1, fill: color});
                bgp = ["M", a.x2, height, "L", a.x2, a.y2, "C", pt2.x, pt2.y];
                k = 0;
                j++;
                o = !o;
            }else{
                bgp = bgp.concat([pt1.x, pt1.y, a.x1, a.y1, "L", a.x1, height, "z"]);
                paper.path().attr({path: bgp}).attr({stroke: "none", opacity: o ? .3 : .1, fill: color});
                bgp = ["M", a.x1, height, "L", a.x1, a.y1, "C", pt2.x, pt2.y];
                k = 1;
                j++;
                o = !o;
            }
        }
        k++;
    }

    var x2 = x + w/2;
    p = p.concat([x, y, x, y, x2, y, x2, y, x2, y]);
    bgp = bgp.concat([x, y, x, y, x2, y, x2, y, x2, y, "L", x2, height, "z"]);
    paper.path().attr({path: p}).attr({stroke:color});
    paper.path().attr({path: bgp}).attr({stroke: "none", opacity: o ? .3 : .1, fill: color});
}

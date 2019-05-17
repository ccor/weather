 //获取锚点
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

var isDom = typeof HTMLElement === 'object' ?
    function(obj) { return obj instanceof HTMLElement; } :
    function(obj) { return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string'; };

function drawLine(opt){
    var data = opt.data || [];
    var ele = isDom(opt.el) ? opt.el : document.getElementById(opt.el);
    ele.innerHTML = '';
    opt.width = ele.offsetWidth;
    var max = Math.max(...data), min = Math.min(...data);
    var h = max == min ? (opt.height - 40) / 1 : (opt.height - 40) / (max -min);
    var w = opt.width / data.length;
    var circles = [], paths = [];
    var c = [];
    for(var i = 0; i < data.length; i++){
        c.push({x: Math.round(w * i + w / 2), y: Math.round((max - data[i]) * h + 20)});
    }

    var paper = Raphael(ele, opt.width, opt.height);
    paper.clear();

    var pos = opt.above ? -14 : 14;
    for(var i = 0; i < c.length; i++){
        paper.circle(c[i].x, c[i].y, 2).attr({
            fill: opt.color,
            stroke: opt.color
        });
        paper.text(c[i].x - 15, c[i].y + pos, data[i] + "℃" || "").attr({
            fill: "#333",
            "font-size": "12px",
            "text-anchor": "start"
        });
    }

    var p;
    for(var i=0, ii = c.length; i < ii; i++){
        var point = c[i];
        var x = point.x;
        var y = point.y;
        if(!i){
             p = ["M", x, y, "C", x, y];
        }
        if (i && i < ii - 1) {
           var point1 = c[i-1];
           var point2 = c[i+1];
            var a = getAnchors(point1.x, point1.y, x, y, point2.x, point2.y);//获取锚点
            p = p.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
        }
    }
    p = p.concat([x,y,x,y]);
    paper.path().attr({'path':p}).attr({stroke:opt.color});

}
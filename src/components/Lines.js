
function makeLines(draw, bg, circles) {

    function makeLine(draw, c1, c2) {
	
    }
    
    const out = draw.group();

    const children = circles.children();
    var outer = [children[0], children[1], children[2]];

    

    out.on('check', function () {
	if (bg.data('success')) {
	    bg.fire('failure');
	}
	else {
	    bg.fire('success');
	}
    });
    
    return out;
}

export default makeLines;

function linesIntersect(l1, l2) {
    // super huge thanks to:
    // http://jeffe.cs.illinois.edu/teaching/373/notes/x06-sweepline.pdf

    // a bunch of accessing and terminology fixing
    var p0, x0, y0, p1, x1, y1, p2, x2, y2, p3, x3, y3;
    
    p0 = SVG.get(l1.data("start"));
    x0 = p0.cx(); y0 = p0.cy();
    
    p1 = SVG.get(l1.data("end"));
    x1 = p1.cx(); y1 = p1.cy(); 

    p2 = SVG.get(l2.data("start"));
    x2 = p2.cx(); y2 = p2.cy(); 

    p3 = SVG.get(l2.data("end"));
    x3 = p3.cx(); y3 = p3.cy(); 
    
    // if the lines share points, pretend they don't intersect
    // since they're on the same circle
    crossed = (!samePoint(x0, y0, x2, y2) &&
               !samePoint(x0, y0, x3, y3) &&
               !samePoint(x1, y1, x2, y2) &&
               !samePoint(x1, y1, x3, y3)) &&
        // check the orientations of bunches of points
        // see PDF linked above for details
        // or ask a math person
        (CCW(x0, y0, x2, y2, x3, y3) !==
         CCW(x1, y1, x2, y2, x3, y3) &&
         CCW(x2, y2, x0, y0, x1, y1) !==
         CCW(x3, y3, x0, y0, x1, y1));
    
    return crossed;
}

// check to see if two points are basically the same
function samePoint(x0, y0, x1, y1, allowance) {
    return (Math.abs(x0 - x1) < allowance &&
            Math.abs(y0 - y1) < allowance);
}

// check to see if three points are counterclockwise
function CCW(x0, y0, x1, y1, x2, y2) {
    return 0 > Math.sign(cross(x1 - x0, y1 - y0,
                               x2 - x0, y2 - y0));
}

// vectors yay!
function cross(x0, y0, x1, y1) {
    return x0 * y1 - x1 * y0;
}

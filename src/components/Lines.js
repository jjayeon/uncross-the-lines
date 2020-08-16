import { SVG } from '@svgdotjs/svg.js'


function makeLines(draw, bg, circles) {

    function makeLine(draw, c1, c2) {
	return draw.line(c1.cx(), c1.cy(),
			 c2.cx(), c2.cy())
	    .stroke('red')
	    .data({
		c1: c1.id(),
		c2: c2.id(),
		crossed: true
	    })

	    .on('redraw', function() {
		const c1 = SVG('#'+this.data('c1')),
		      c2 = SVG('#'+this.data('c2'));

		this.plot(c1.cx(), c1.cy(),
			  c2.cx(), c2.cy())
		    .stroke(this.data('crossed') ? 'red' : 'green');
	    })

	    .on('check', function() {
		var crossed = false;
		const l1 = this;
		this.parent().each(function() {
		    if (!crossed) {
			crossed = linesIntersect(l1, this);
		    }
		});
		this.data({ crossed: crossed });
		this.fire('redraw');
	    });
    }

    // DEBUGGING
    const w_min = draw.data('w_min'),
	  w_max = draw.data('w_max'),
	  h_min = draw.data('h_min'),
	  h_max = draw.data('h_max'),
	  cw = (w_min + w_max) / 2,
	  ch = (h_min + h_max) / 2,
	  r  = Math.min((w_max - w_min) / 2,
			(h_max - h_min) / 2);
    // end debugging
 
    const out = draw.group();

    out.on('redraw', function () {
	this.each(function () {
	    this.fire('redraw');
	});
    })
    
	.on('check', function () {
	    this.each(function() {
		this.fire('check');
	    });
	    
	    var success = true;
	    this.each(function() {
		if (success) {
		    success = success && !this.data('crossed');
		} 
	    });
	    
	    if (success) {
		bg.fire('success');
	    }
	    else {
		bg.fire('failure');
	    }
	});

    // POPULATION ALGORITHM
    const children = circles.children(),
	  t = r / children.length,
	  angles = [Math.PI/6,
		    Math.PI/6 + 2*Math.PI/3,
		    Math.PI/6 + 4*Math.PI/3];
    
    for (var i = 0; i < children.length; i++) {
	const a = angles[i % angles.length];
	children[i].center(cw + t * (i+1) * Math.cos(a),
			   ch + t * (i+1) * Math.sin(a));
    }

    var outer = [children[0], children[1], children[2]];

    for (const i in outer) {
	makeLine(out, outer[i], outer[(i+1) % outer.length]);
    }

    for (var i = 3; i < children.length; i++) {
	const c1 = children[i];
	for (const j in outer) {
	    const c2 = outer[j];
	    makeLine(out, c1, c2);
	}
	outer[i % 3] = c1;
    }
    // END POPULATION ALGORITHM

    // HELPER FUNCTIONS
    function linesIntersect(l1, l2) {
	// super huge thanks to:
	// http://jeffe.cs.illinois.edu/teaching/373/notes/x06-sweepline.pdf

	// a bunch of accessing and terminology fixing
	var p0, x0, y0, p1, x1, y1, p2, x2, y2, p3, x3, y3;
	
	p0 = SVG('#'+l1.data("c1"));
	x0 = p0.cx(); y0 = p0.cy();
	
	p1 = SVG('#'+l1.data("c2"));
	x1 = p1.cx(); y1 = p1.cy(); 

	p2 = SVG('#'+l2.data("c1"));
	x2 = p2.cx(); y2 = p2.cy(); 

	p3 = SVG('#'+l2.data("c2"));
	x3 = p3.cx(); y3 = p3.cy(); 
	
	// if the lines share points, pretend they don't intersect
	// since they're on the same circle
	const crossed = (!samePoint(x0, y0, x2, y2) &&
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
    function samePoint(x0, y0, x1, y1) {
	const allowance = 10;
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

    return out.fire('check');
}

export default makeLines;

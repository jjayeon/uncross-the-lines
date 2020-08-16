// function to draw lines between all the circles, such that we know for sure there is a solution.
// also includes logic for checking for game victory --- see linesIntersect().

import { SVG } from '@svgdotjs/svg.js'

function makeLines(draw, bg, circles) {

    // helper function for drawing a line between two circles.
    function makeLine(draw, c1, c2) {

	// initial plot + data
	return draw.line(c1.cx(), c1.cy(),
			 c2.cx(), c2.cy())
	    .stroke('red')
	    .data({
		c1: c1.id(),
		c2: c2.id(),
		crossed: true // whether or not we've crossed a line. (hah)
	    })

	// on redraw, re-plot to follow circles,
	// and recolor yourself based on crossed.
	    .on('redraw', function() {
		const c1 = SVG('#'+this.data('c1')),
		      c2 = SVG('#'+this.data('c2'));

		this.plot(c1.cx(), c1.cy(),
			  c2.cx(), c2.cy())
		    .stroke(this.data('crossed') ? 'red' : 'green');
	    })

	// on check, iterate thru all lines,
	// checking to see if we intersect with them.
	    .on('check', function() {

		// store result in here.
		var crossed = false;

		const l1 = this;
		this.parent().each(function() {
		    if (!crossed) {
			crossed = linesIntersect(l1, this);
		    }
		});
		// store result in data.
		this.data({ crossed: crossed });
	    });
    }
    // end makeLine()

    const out = draw.group();

    // on redraw, just tell all children to redraw.
    out.on('redraw', function () {
	this.each(function () {
	    this.fire('redraw');
	});
    })

    // on check, tell all children to check...
	.on('check', function () {
	    this.each(function() {
		this.fire('check');
	    });

	    // and then see if any lines are crossed.
	    // if not, we know we're successful!
	    var success = true;
	    this.each(function() {
		if (success) {
		    success = !this.data('crossed');
		} 
	    });
	    bg.fire(success ? 'success' : 'failure');
	    this.fire('redraw'); // redraw to reflect state.
	});

    // CHECKING FOR LINE INTERSECTION
    function linesIntersect(l1, l2) {
	// super huge thanks to:
	// http://jeffe.cs.illinois.edu/teaching/373/notes/x06-sweepline.pdf

	// basically, the idea is to check if certain arrangements of points
	// are arranged counterclockwise.

	// HELPER FUNCTIONS
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

	// cross product. yay vectors!
	function cross(x0, y0, x1, y1) {
	    return x0 * y1 - x1 * y0;
	}
	
	// a bunch of accessing and terminology fixing
	const p0 = SVG('#'+l1.data("c1")),
	      x0 = p0.cx(), y0 = p0.cy(),
	      
	      p1 = SVG('#'+l1.data("c2")),
	      x1 = p1.cx(), y1 = p1.cy(), 

	      p2 = SVG('#'+l2.data("c1")),
	      x2 = p2.cx(), y2 = p2.cy(), 

	      p3 = SVG('#'+l2.data("c2")),
	      x3 = p3.cx(), y3 = p3.cy(); 
	
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
    // end linesIntersect()

    // POPULATION ALGORITHM
    // this is where we actually draw the lines.
    // TODO: make this less obnoxious,
    // both in terms of the code and in terms of difficulty.
    const w_min = draw.data('w_min'),
	  w_max = draw.data('w_max'),
	  h_min = draw.data('h_min'),
	  h_max = draw.data('h_max'),
	  cw = (w_min + w_max) / 2,
	  ch = (h_min + h_max) / 2,
	  r  = Math.min((w_max - w_min) / 2,
			(h_max - h_min) / 2);
    
    const children = circles.children(),
	  t = r / children.length,
	  angles = [Math.PI/6,
		    Math.PI/6 + 2*Math.PI/3,
		    Math.PI/6 + 4*Math.PI/3];
    
    for (var i = 0; i < children.length; i++) {
	const a = angles[i % angles.length];
	// children[i].center(cw + t * (i+1) * Math.cos(a),
	//  		   ch + t * (i+1) * Math.sin(a));
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

    return out.fire('check');
}

export default makeLines;

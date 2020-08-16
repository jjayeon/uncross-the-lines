// make a whole group of circles. some custom events:
// "scramble" scrambles the circle's positions.
// "clear" flags all circles as unselected.
// "select" will flag a circle at a point as selected.
// "dx" and "dy" will move all selected circles, but staying in bounds.

function makeCircles(draw) {

    // helper function for drawing a circle.
    function makeCircle(draw, radius) {
	draw.circle(radius)
	// circles "know" whether or not they're selected.
	// when it's time to move, we'll only move circles that have the "selected" flag.
	    .on('select', function() {
		this.fill('rgb(150, 0, 0)')
		    .data('selected', true, true);
	    })
	    .on('deselect', function() {
		this.fill('rgb(0, 0, 0)')
		    .data('selected', false, true);	    
	    })
	    .fire('deselect');
    }
    // end makeCircle()

    // pulling boundaries from draw.data() --- needed to scramble.
    const w_min = draw.data('w_min'),
	  w_max = draw.data('w_max'),
	  h_min = draw.data('h_min'),
	  h_max = draw.data('h_max'),

	  // circle values.
	  numCircles = 10,
	  radius = 20,
	  
	  out = draw.group();
    
    // helper function for getting a circle at a certain coordinate.
    // a little hacky, but SVG won't let me store functions in data().
    out.getCircleAt = function(x, y) {
	
	// we're using this pattern to ensure we only select one circle.
	var circle = null;
	this.each(function() {
	    if (!circle) {
		if (this.inside(x, y)) {
		    circle = this;
		}
	    }
	});
	return circle;
    }

    // on clear, simply deselect all circles.
    out.on('clear', function() {
	this.each(function() {
	    this.fire('deselect');
	})
    })
    // on select, iterate through children and find one that's at the given coordinate.
	.on('select', function(e) {
	    const px = e.detail.px, py = e.detail.py;

	    const circle = this.getCircleAt(px, py);
	    if (circle) {
		circle.fire('select');
	    }
	})

    // on scramble, simply scramble the positions (staying in bounds).
	.on('scramble', function() {
	    function randRange(min, max) {
		return Math.random() * (max - min) + min;
	    }
	    
	    this.each(function() {
		this.fire('deselect')
		    .center(randRange(w_min, w_max),
			    randRange(h_min, h_max));
	    });
	})
    
    // custom move functions. only move selected circles,
    // and only move them if they'll stay in bounds.
	.on('dx', function(e) {
	    this.each(function() {
		
		if(this.data('selected')) {
		    const newx = this.cx() + e.detail.dx;
		    
		    if (draw.inBoundsX(newx)) {
			this.cx(newx);
		    }
		}
	    })
	})
    	.on('dy', function(e) {
	    this.each(function() {
		
		if(this.data('selected')) {
		    const newy = this.cy() + e.detail.dy;
		    
		    if (draw.inBoundsY(newy)) {
			this.cy(newy);
		    }
		}
	    })
	})

    // make the circles!
    for (var i = 0; i < numCircles; i++) {
	makeCircle(out, radius);
    }

    return out.fire('scramble');
}

export default makeCircles;

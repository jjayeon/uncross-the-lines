// make a whole group of circles. the variables, real quick:
// draw: the canvas, w: width of canvas, h: height of canvas, n: num circles,
// r: radius of each circle, b: buffer
// and some custom events:
// "solve" puts all the circles in a circle.
// "scramble" scrambles their positions.
// "clear" flags all circles as unselected.
// "select" will flag a circle at a point as selected.
// "dmove" will move all selected circles, but staying in bounds.

function makeCircles(draw) {
    const w_min = draw.data('w_min'),
	  w_max = draw.data('w_max'),
	  h_min = draw.data('h_min'),
	  h_max = draw.data('h_max');

    // circle values.
    const numCircles = 10;
    const radius = 20;
    const bigCircleRadius = Math.min((w_max - w_min) / 2,
				     (h_max - h_min) / 2);
    console.log(bigCircleRadius);
    
    const out = draw.group();

    // helper function for getting a circle at a certain coordinate.
    out.getCircleAt = function(x, y) {
	var circle = null;
	var looping = true;
	this.each(function(i, children) {
	    if (looping) {
		const child = children[i];
		if (child.inside(x, y)) {
		    circle = child;
		    looping = false;
		}
	    }
	});
	return circle;
    }
    
    for (var i = 0; i < numCircles; i++) {

	out.circle(radius)
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

    // on "solve", we'll put the circles in a big circle.
    return out.on('solve', function() {
	
	this.each(function(i, children) {
	    const circle = children[i];

	    // this goes in a circle.
	    // if you're puzzled, ask your trig professor.
	    circle.fire('deselect')
		.center((w_min + w_max) / 2 +
			bigCircleRadius * Math.cos(Math.PI*2 * (i/children.length)),
			(h_min + h_max) / 2 +
			bigCircleRadius * Math.sin(Math.PI*2 * (i/children.length)));
	});
    })
    // on "scramble", simply scramble the positions.
	.on('scramble', function() {
	    function randRange(min, max) {
		return Math.random() * (max - min) + min;
	    }
	    
	    this.each(function(i, children) {
		const circle = children[i];

		circle.fire('deselect')
		    .center(randRange(w_min, w_max),
			    randRange(h_min, h_max));
	    });
	})
    // simply deselect all circles.
	.on('clear', function() {
	    this.each(function(i, children) {
		children[i].fire('deselect');
	    })
	})
    // iterate through children and find one that's at the given coordinate.
	.on('select', function(e) {
	    const px = e.detail.px, py = e.detail.py;

	    const circle = this.getCircleAt(px, py);
	    if (circle) {
		circle.fire('select');
	    }
	    // we're using this "looping" pattern to ensure we only select one circle.
	})
    // custom move functions. only move selected circles,
    // and only move them if they'll stay in bounds.
	.on('dx', function(e) {
	    this.each(function(i, children) {
		const child = children[i];
		
		if(child.data('selected')) {
		    const newx = child.cx() + e.detail.dx;
		    
		    if (draw.inBoundsX(newx)) {
			child.cx(newx);
		    }
		}
	    })
	})
    	.on('dy', function(e) {
	    this.each(function(i, children) {
		const child = children[i];
		
		if(child.data('selected')) {
		    const newy = child.cy() + e.detail.dy;
		    
		    if (draw.inBoundsY(newy)) {
			child.cy(newy);
		    }
		}
	    })
	})
	.fire('scramble');
}

export default makeCircles;

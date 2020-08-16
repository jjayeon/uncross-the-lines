// this one is a doozy.
// to handle input, we're making an invisible rectangle the size of the canvas,
// and every time you click on it, it'll pass information to any objects on that point.
// this layer will also keep track of things like whether shift is held down,
// whether the mouse is held down, etc.

import { SVG } from '@svgdotjs/svg.js';

function makeInput(draw, circles, lines, selection, reset) {
    const w = draw.data('width'),
	  h = draw.data('height'),
	  w_min = draw.data('w_min'),
	  w_max = draw.data('w_max'),
	  h_min = draw.data('h_min'),
	  h_max = draw.data('h_max'),

	  // the rectangle to return.
	  out = draw.rect(w, h);

    // some boilerplate to pass keystrokes to our input layer.
    // SVG.js can handle clicks natively, but not keystrokes. go figure.
    document.onkeydown = function(e) {
	out.fire('keydown', e);
    }
    document.onkeyup = function(e) {
	out.fire('keyup', e);
    }

    // oh no state variables
    // trust me we need all of these
	out.data({
	    // the most recent mouse position.
	    mouseX: 0,
	    mouseY: 0,

	    // whether or not we moved in this mouse cycle.
	    moved: false,
	    // whether or not we're drawing a box.
	    boxing: false,
	    // if we clicked on a circle, store it here.
	    circle: null,
	    // and whether or not our circle was selected before.
	    clickedNewCircle: false,

	    // state variables for whether stuff is held down.
	    shiftdown: false,
	    mousedown: false
	})
    
    // oh no logic
    // mouse input:
	.on('mousedown', function(e) {
	    
	    // this transforms the click point into a point SVG can understand.
	    const p = draw.point(e.x, e.y);
	    
	    this.data({ mousedown: true });

	    // this block tells us if there's a circle under the mouse cursor on click,
	    // as well as if it's a "new" (unselected) circle or not.
	    const circle = circles.getCircleAt(p.x, p.y);
	    const clickedNewCircle = circle && !circle.data('selected')

	    this.data({ circle: (circle ? circle.id() : null) });
	    this.data({ clickedNewCircle: clickedNewCircle });
	    // as of here, we know that:
	    // circle will contain the circle under the pointer, or null if there is none.
	    // clickedNewCircle will be true if circle was unselected before, and false otherwise.

	    // first of all, if there was no circle, just clear everything.
	    if (circle === null) {
		if (!this.data('shiftdown')) {
		    circles.fire('clear');
		}
		// reset if needed.
		if (reset.inside(p.x, p.y)) {
		    reset.fire('reset');
		}
		// otherwise, start drawing a box.
		else {
		    selection.fire('anchor', {x: p.x, y: p.y});
		    selection.show();
		    this.data({ boxing: true });
		}
	    }
	    // if we're here, we know we clicked on a circle.
	    else {
		// if we're holding down shift, we should toggle the selection.
		if (this.data('shiftdown')) {
		    if (circle.data('selected')) {
			circle.fire('deselect');
		    }
		    else {
			circle.fire('select');
		    }

		}
		// if we're not holding down shift, just select this circle.
		else {
		    if (clickedNewCircle) {
		    	circles.fire('clear');
		    }
		    circle.fire('select');
		}

	    }
	})
    
    // now for mouse movement:
	.on('mousemove', function(e) {
	    const p = draw.point(e.x, e.y);

	    this.data({ moved: true });

	    // this weirdness gets the recent motion of the mouse cursor.
	    const prevX = this.data('mouseX');
	    const prevY = this.data('mouseY');

	    const dx = p.x - prevX;
	    const dy = p.y - prevY;
	    
	    this.data({ mouseX: p.x });
	    this.data({ mouseY: p.y });
	    // now we know that dx and dy have the cursor's recent change in position.

	    // only fire if the mouse is held down.
	    if (this.data('mousedown')) {

		// if we're drawing a box, redraw it.
		if (this.data('boxing')) {
		    selection.fire('redraw', { x: p.x, y: p.y });
		}

		// "Shift" stops circles from moving.
		// I found this to be the best way to get consistent behavior. 
		else if (!this.data('shiftdown')) {

		    // if all's well, start moving the selection!
		    if (draw.inBoundsX(p.x)) {
			circles.fire('dx', { dx: dx });
		    }
		    if (draw.inBoundsY(p.y)) {
			circles.fire('dy', { dy: dy });
		    }

		    // update our lines.
		    lines.fire('redraw');
		}
	    }
	})
    
    // and when the mouse is released:
	.on('mouseup', function(e) {
	    const p = draw.point(e.x, e.y);
	    
	    this.data({ mousedown: false });

	    // if we moved the cursor...
	    if (this.data('moved')) {

		// if we drew a box...
		if (this.data('boxing')) {

		    // select every circle that intersects with the box.
		    circles.each(function() {
			if (selection.intersects(this)) {
			    this.fire('select');
			}
		    }); 
		}
	    }

	    // if we're here, we clicked in place.
	    else {
		// if it's a normal click, clear the selection.
		if (!this.data('shiftdown')) {
	    	    circles.fire('clear');
		}

		// if we clicked a circle, select it.
		if (this.data('circle')) {
		    SVG('#'+this.data('circle')).fire('select');
		}
		// you might be wondering, we modified selection in mousedown.
		// why are we doing it again here?
		// the answer is that if you click a selected circle without holding shift,
		// you should deselect all other circles and just select that one.
		// after a ton of trial and error, this is the best way i found to do that.
	    }

	    // check to see if we've won.
	    lines.fire('check');

	    selection.hide();
	    this.data({
		moved: false,
		boxing: false,
		circle: null,
		clickedNewCircle: false
	    });
	})

    // keyboard input:
	.on('keydown', function(e) {
	    const key = e.detail.key;

	    // do different things depending on which key.
	    switch(key) {
		// r: reset the board.
	    case 'r': reset.fire('reset'); break;
		// shift: toggle the "shift" state.
	    case 'Shift': this.data({ shiftdown: true }); break;
	    }
	})
	.on('keyup', function(e) {
	    const key = e.detail.key;

	    switch(key) {
		// shift: toggle the "shift" state.
	    case 'Shift': this.data({ shiftdown: false }); break;
	    }
	});

    return out.fill({ opacity: 0 })
}

export default makeInput;

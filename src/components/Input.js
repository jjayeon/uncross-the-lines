// this one is a doozy.
// to handle input, we're making an invisible rectangle the size of the canvas,
// and every time you click on it, it'll pass information to any objects on that point.
// this layer will also keep track of things like whether shift is held down,
// whether the mouse is held down, etc.

function makeInput(draw, g_circles, selection, reset) {
    const w = draw.data('width'),
	  h = draw.data('height'),
	  w_min = draw.data('w_min'),
	  w_max = draw.data('w_max'),
	  h_min = draw.data('h_min'),
	  h_max = draw.data('h_max'),
	  out = draw.rect(w, h);

    // some boilerplate to pass keystrokes to our input layer.
    // SVG.js can handle clicks natively, but not keystrokes. go figure.
    document.onkeydown = function(e) {
	out.fire('keydown', e);
    }
    document.onkeyup = function(e) {
	out.fire('keyup', e);
    }

    // just an ordinary transparent rectangle...
    return out.fill({ opacity: 0 })

    // oh no state variables
    // trust me we need all of these
	.data({
	    // the most recent mouse position.
	    mouseX: 0,
	    mouseY: 0,

	    // whether or not we moved in this mouse cycle.
	    moved: false,
	    // whether or not we're drawing a box.
	    boxing: false,
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
	    const p = draw.point(e.pageX, e.pageY);
	    this.data({ mousedown: true });

	    // this block tells us if there's a circle under the mouse cursor on click,
	    // as well as if it's a "new" (unselected) circle or not.
	    const circle = g_circles.getCircleAt(p.x, p.y);
	    const clickedNewCircle = circle && !circle.data('selected')
	    
	    this.data({ clickedNewCircle: clickedNewCircle });
	    // as of here, we know that:
	    // circle will contain the circle under the pointer, or null if there is none.
	    // clickedNewCircle will be true if circle was unselected before, and false otherwise.

	    // first of all, if there was no circle, just clear everything.
	    if (circle === null) {
		if (!this.data('shiftdown')) {
		    g_circles.fire('clear');
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
		    	g_circles.fire('clear');
		    }
		    circle.fire('select');
		}

	    }
	})
    // now for mouse movement:
	.on('mousemove', function(e) {
	    const p = draw.point(e.pageX, e.pageY);

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
			g_circles.fire('dx', { dx: dx });
		    }
		    if (draw.inBoundsY(p.y)) {
			g_circles.fire('dy', { dy: dy });
		    }
		}
		this.data({ moved: true });
	    }
	})
    // and when the mouse is released:
	.on('mouseup', function(e) {
	    const p = draw.point(e.pageX, e.pageY);
	    this.data({ mousedown: false });

	    // if we moved the cursor...
	    if (this.data('moved')) {

		// if we drew a box...
		if (this.data('boxing')) {

		    // select every circle that intersects with the box.
		    g_circles.each(function(i, children) {
			const child = children[i];

			if (selection.intersects(child)) {
			    child.fire('select');
			}
		    }); 
		    this.data({ boxing: false });
		}
	    }

	    // if we click a selected circle without holding shift,
	    // we should select just that circle.
	    else if (!this.data('shiftdown')) {
	    	g_circles.fire('clear');
	    	g_circles.fire('select', { px: p.x, py: p.y });
	    }

	    selection.hide();
	    this.data({ clickedCircle: false });
	    this.data({ clickedNewCircle: false });
	    this.data({ moved: false });
	})

    // keyboard input:
	.on('keydown', function(e) {
	    const key = e.detail.key;
	    switch(key) { // do different things depending on which key.
		
	    case 'r': reset.fire('reset'); break;                // r: reset the board.
	    case ' ': g_circles.fire('solve'); break;            // space: "solve" the board (make a circle).
	    case 'Shift': this.data({ shiftdown: true }); break; // shift: toggle the "shift" state.
	    }
	})
	.on('keyup', function(e) {
	    const key = e.detail.key;
	    switch(key) {
		
	    case 'Shift': this.data({ shiftdown: false }); break; // shift: toggle the "shift" state.
	    }
	});
}

export default makeInput;

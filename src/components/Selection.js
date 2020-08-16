// the selection box is a green rectangle that lets the user 'box select' some circles.
// it should behave a lot like the selection box in an RTS.

function makeSelectionBox(draw) {

    const out = draw.rect()
	  .stroke({ color: 'rgb(0, 150, 0)', opacity: 1})
	  .fill({ color: 'rgb(0, 150, 0)', opacity: 0.2})
	  .data({
	      anchorX: 0,
	      anchorY: 0
	  });

    // a helper function that checks if the selection box is intersecting another shape.
    out.intersects = function(that) {
	const b1 = this.rbox(),
	      b2 = that.rbox();

	// check each corner against the other shape.
	return (this.inside(b2.x , b2.y) ||
		this.inside(b2.x , b2.y2) ||
		this.inside(b2.x2, b2.y) ||
		this.inside(b2.x2, b2.y2) ||

		that.inside(b1.x , b1.y) ||
		that.inside(b1.x , b1.y2) ||
		that.inside(b1.x2, b1.y) ||
		that.inside(b1.x2, b1.y2));
    }

    // on 'anchor', fix the box to a certain position.
    // (also, reset its size).
    out.on('anchor', function(e) {
	this.data({ anchorX: e.detail.x,
		    anchorY: e.detail.y })
	    .size(0, 0);
	
    })
    // on 'redraw', do some magic to set the top left corner,
    // and build the box from there.
    // note that our "true" anchor is saved in data.
	.on('redraw', function(e) {
	    const ax = this.data('anchorX'),
		  ay = this.data('anchorY'),
		  ex = e.detail.x,
		  ey = e.detail.y;
	    
	    this.move(Math.min(ax,  ex),
		      Math.min(ay,  ey))
		.size(Math.abs(ax - ex),
		      Math.abs(ay - ey));
	});

    return out.hide();
}

export default makeSelectionBox;

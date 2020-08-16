// make a button that scrambles the circle positions.
// returns a group, not the canvas.
function makeResetButton(draw, circles) {
    const w = draw.data('buttonWidth'),
	  h = draw.data('buttonHeight'),
	  out = draw.group().size(w, h);

    out.on('reset', function() {
	circles.fire('scramble');
    });

    // orange rectangle
    out.rect(w, h)
	.fill('rgb(255, 112, 77)');

    // and some instruction text
    out.text('reset')
	.font({ size: 24 })
    	.center(w/2, h/2);

    return out;
}

export default makeResetButton;

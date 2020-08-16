// make a button that scrambles the circle positions.

function makeResetButton(draw, circles, lines) {

    // pull values out of draw.data().
    const w = draw.data('buttonWidth'),
	  h = draw.data('buttonHeight'),
	  
	  out = draw.group();

    // on reset, scramble the circles, and tell the lines
    // to recheck themselves.
    out.on('reset', function() {
	circles.fire('scramble');
	lines.fire('check');
    });

    // orange rectangle
    out.rect(w, h)
	.fill('rgb(255, 112, 77)');

    // and some instruction text.
    // TODO: make this prettier.
    out.text('reset')
	.font({ size: 24 })
    	.center(w/2, h/2);

    return out;
}

export default makeResetButton;

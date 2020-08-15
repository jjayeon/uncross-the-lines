// make a button that scrambles the circle positions.
// returns a group, not the canvas.
function makeResetButton(draw, w, h, g_circles) {
    
    const out = draw.group().size(w, h);

    out.on('reset', function() {
	g_circles.fire('scramble');
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

import { SVG } from '@svgdotjs/svg.js'

// this function contains the bulk of the logic.
// it's pretty much just a series of calls to the below functions.
// i put it up here because to anyone trying to read my code,
// seeing this first makes more sense than looking at the abstract functions first.
function init() {
    
    // don't make circles this close to the edge.
    const buffer = 40;

    // TODO: someday, i would like to determine these values
    // based on the user's platform/screen size.
    // someday.
    const buttonWidth = 80;
    const buttonHeight = 40;
    
    const draw = makeDraw();
    const bg = makeBG(draw);
    const button = makeResetButton(draw, buttonWidth, buttonHeight, bg);
}

init();

// FUN PROGRAMMING STUFF:
// ----------------------------------------------------------------

// creates the SVG object itself. bound to "draw" in "init()".
function makeDraw() {
    return SVG().addTo('#drawing').size('100%', '100%');
}

// make a big rectangle covering the whole canvas.
// changes color on 'success' and 'failure' events.
// like all the make functions, we'll pass "draw" as an argument.
// this avoids global variables!
function makeBG(draw) {
    return draw.rect('100%', '100%')
	.on('success',  function() {
	    this.fill({ color: 'rgb(240, 255, 240)' })})
	.on('failure', function() {
	    this.fill({ color: 'rgb(255, 240, 240)' })})
	.fire('failure');
}

// make a button that resets the canvas.
// right now, there's nothing to reset,
// but for testing purposes i had it change the BG color. two in one test!
// returns the new group.
function makeResetButton(draw, w, h, bg) {
    var out = draw.group().size(w, h);

    out.data('success', true, true)
	.click(function() {
	    if (this.data('success')) {
		bg.fire('success');
		this.data('success', false, true);
	    }
	    else {
		bg.fire('failure');
		this.data('success', true, true);
	    }
	});

    // orange rectangle
    out.rect(w, h)
	.front()
	.fill({ color: 'rgb(255, 112, 77)' });

    // and some instruction text
    out.text('reset').center(w/2, h/2);

    return out;
}

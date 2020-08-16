// make a big rectangle covering the whole canvas.
// changes color on 'success' and 'failure' events,
// and stores the game's win state.
function makeBG(draw) {
    const w = draw.data('width'),
	  h = draw.data('height');

    // stores the game's win state.
    return draw.rect(w, h)
	.data('success', false, true)

    // update state + recolor.
	.on('success',  function() {
	    this.fill('rgb(240, 255, 240)')
		.data('success', true, true);})
	.on('failure', function() {
	    this.fill('rgb(255, 240, 240)')
		.data('success', false, true);})
    
	.fire('failure');
}

export default makeBG;

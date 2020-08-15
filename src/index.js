import { SVG } from '@svgdotjs/svg.js'

function makeDraw() {
    return SVG().addTo('#drawing').size('100%', '100%');
}

function makeBG(draw) {
    return draw.rect('100%', '100%')
	.back()
	.on('success',  function() {
	    this.fill({ color: 'rgb(240, 255, 240)' })})
	.on('failure', function() {
	    this.fill({ color: 'rgb(255, 240, 240)' })})
	.fire('failure');
}

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
    
    out.rect(w, h)
	.front()
	.fill({ color: 'rgb(255, 112, 77)' });

    out.text('reset').center(w/2, h/2);

    return out;
}

function go() {
    const buffer = 40;
    
    const buttonWidth = 80;
    const buttonHeight = 40;
    
    const draw = makeDraw();
    const bg = makeBG(draw);
    const button = makeResetButton(draw, buttonWidth, buttonHeight, bg);
}

go();

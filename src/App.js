// welcome!
// this is a one-shot javascript implementation of the great game "uncross the lines",
// in which --- you guessed it --- you uncross some lines.
// my "special feature" is that you can use shift to select multiple circles,
// and draw boxes to select like in an RTS.
// ----------------------------------------------------------------

import { SVG } from '@svgdotjs/svg.js';
// as you can see, this project uses SVG.js.
// go thru their crap documentation on svgjs.com for an overview.

import makeResetButton from './components/Button.js';
import makeCircles from './components/Circles.js';
import makeBG from './components/Background.js';
import makeInput from './components/Input.js';

function App() {

    // CONSTANTS:
    // --------------------------------
    // getting the screen size.
    const width  = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) *  (9/10);
    const height = (window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight) * (9/10);
    // note the 9/10 at the end --- that's a hack to prevent overspill at the edge.

    // determine button dimensions based on screen size.
    // if width > height (horizontal), make it a bit smaller,
    // and if width < height (vertical), make it a bit bigger.
    const buttonWidth = width / ((width > height) ? 10 : 3);
    // the button's height is always a function of its width.
    const buttonHeight = buttonWidth / 3;
    
    // don't make circles this close to the edge.
    const buffer = buttonHeight;

    // get the true bounds of the canvas.
    const w_min = buffer, w_max = width - buffer,
	  h_min = buffer, h_max = height - buffer;
    
    // circle values.
    const numCircles = 10;
    const circleRadius = 20;

    // SVG STUFF:
    // --------------------------------
    const draw = SVG().addTo('#drawing').size(width, height);

    // define some helper functions on draw.
    // draw is the only namespace that's guaranteed to be in all contexts, so we're putting it here.
    // TODO: do this in a way that isn't obscenely disgusting.
    draw.inBoundsX = function (x) {
	return w_min < x && x < w_max;
    }
    draw.inBoundsY = function (y) {
	return h_min < y && y < h_max;
    }
    // the circles that the user can click on.
    const g_circles = makeCircles(draw, w_min, w_max, h_min, h_max, numCircles, circleRadius, buffer);
    g_circles.getCircleAt = function(x, y) {
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
    
    // the lines connecting the circles.
    const g_lines = draw.group();

    // and the other SVG stuff --- the background, reset button, and input layer.
    // see ./components/Input.js for more info on the input layer.
    const bg = makeBG(draw, width, height);
    const reset = makeResetButton(draw, buttonWidth, buttonHeight, g_circles);
    const input = makeInput(draw, width, height, reset, g_circles);

    // some boilerplate to pass keystrokes to our input layer.
    // SVG.js can handle clicks natively, but not keystrokes. go figure.
    document.onkeydown = function(e) {
	input.fire('keydown', e);
    }
    document.onkeyup = function(e) {
	input.fire('keyup', e);
    }
    
    // put everything in the right order.
    bg.front();
    reset.front();
    g_lines.front();
    g_circles.front();
    input.front();
}

export default App;

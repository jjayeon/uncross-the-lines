// welcome!
// this is a one-shot javascript implementation of the great game "uncross the lines",
// in which --- you guessed it --- you uncross some lines.
// my "special feature" is that you can use shift to select multiple circles,
// and draw boxes to select like in an RTS.
// ----------------------------------------------------------------

import { SVG } from '@svgdotjs/svg.js';
// as you can see, this project uses SVG.js.
// go thru their crap documentation on svgjs.com for an overview.

import makeBG from './components/Background.js';
import makeResetButton from './components/Button.js';
import makeSelectionBox from './components/Selection.js';
import makeCircles from './components/Circles.js';
import makeLines from './components/Lines.js';
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
    // these values are being defined here because they require
    // a whole mess of dependencies I don't want to deal with.
    
    // SVG STUFF:
    // --------------------------------
    const draw = SVG().addTo('#drawing')
	  .size(width, height)
	  .data({
	      // include all our "global" variables in draw.data().
	      width: width,
	      w_min: buffer,
	      w_max: width - buffer,

	      height: height,
	      h_min: buffer,
	      h_max: height - buffer,

	      buttonWidth: buttonWidth,
	      buttonHeight: buttonHeight,
	      buffer: buffer
	  });

    // define some helper functions for checking bounds.
    // unfortunately, you can't use SVG.js data() for functions,
    // so this is the best way to have these functions available globally.
    draw.inBoundsX = function(x) {
	const w_min = this.data('w_min'),
	      w_max = this.data('w_max');
	return w_min < x && x < w_max;
    }
    draw.inBoundsY = function(y) {
	const h_min = this.data('h_min'),
	      h_max = this.data('h_max');
	return h_min < y && y < h_max;
    }
    
    // the background...
    const bg = makeBG(draw),
	  // the circles that the user can click on...
	  circles = makeCircles(draw),
	  // the lines connecting the circles...
	  lines = makeLines(draw, bg, circles),
	  // the selection box...
	  selection = makeSelectionBox(draw),
	  // the big orange reset button...
	  reset = makeResetButton(draw, circles, lines),
	  // and the input layer.
	  // see ./components/Input.js for more info.
	  input = makeInput(draw, circles, lines, selection, reset);
    
    // put everything in the right order.
    bg.front();
    reset.front();
    lines.front();
    circles.front();
    selection.front();
    input.front();
}

export default App;

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
// each of these files has more nice comments~

function App() {

    // CONSTANTS:
    // these values are being defined here because
    // there's no way to calculate them inside draw.data().
    // --------------------------------
    // getting the screen size.
    const width  = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) *  (9/10),
	  height = (window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight) * (9/10),
	  // note the 9/10 at the end --- that's a hack to prevent overspill at the edge.

	  // determine button dimensions based on screen size.
	  // if width > height (horizontal), make it a bit smaller,
	  // and if width < height (vertical), make it a bit bigger.
	  // TODO: be smarter about this.
	  buttonWidth = width / ((width > height) ? 10 : 3),
	  // the button's height is always a function of its width.
	  buttonHeight = buttonWidth / 3,
	  // don't make circles this close to the edge.
	  buffer = buttonHeight;
    
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
    
    // the various SVG components.
    // see their respective files for more info.
    const bg =        makeBG(draw),
	  selection = makeSelectionBox(draw),
	  circles =   makeCircles(draw),
	  lines =     makeLines(draw, bg, circles),
	  reset =     makeResetButton(draw, circles, lines),
	  input =     makeInput(draw, circles, lines, selection, reset);
    // order is important --- some of these objects needs references to the previous ones.
    
    // put everything in the right order.
    bg.front();
    reset.front();
    lines.front();
    circles.front();
    selection.front();
    input.front();
}

// and done!
export default App;

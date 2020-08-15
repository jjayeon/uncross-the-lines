import { SVG } from '@svgdotjs/svg.js'

var draw = SVG().addTo('#drawing').size("100%", "100%");

var bg = draw.rect("100%", "100%").attr({ fill: "rgb(255, 240, 240)" });

var text = draw.text("this website is still under construction. \nthank you for checking in~");

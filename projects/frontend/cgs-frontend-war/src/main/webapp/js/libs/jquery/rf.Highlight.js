/*------------------------------------------------------------------------------
  Copyright (c) 2009 Matt Kirman (http://mattkirman.com)
  Copyright (c) 2009 Redflex LLP (http://redflex.co.uk)

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
------------------------------------------------------------------------------*/

(function($){

	$.fn.highlight = function(userDefinedSettings){

		var s = $.extend({
			/* defaults */
			color: [255, 255, 187],
			duration: 500,
			steps: 20,
			wait: 250
		}, userDefinedSettings);

		$(this).css({
			backgroundColor: 'rgba('+s.color[0]+','+s.color[1]+','+s.color[2]+',1)'
		});

		var timeout = s.duration / s.steps;
		var alphaDiff = 1 / s.steps;

		setTimeout(fade, s.wait, this, s.color[0], s.color[1], s.color[2], 1, timeout, alphaDiff);

	}

	fade = function(item, color1, color2, color3, alpha, timeout, alphaDiff){
		alpha -= alphaDiff;
		$(item).css({
			backgroundColor: 'rgba('+color1+','+color2+','+color3+','+alpha+')'
		})

		if (alpha <= 0){
			$(item).css('backgroundColor','');
		} else {
			setTimeout(fade, timeout, item, color1, color2, color3, alpha, timeout, alphaDiff);
		}
	}

})(jQuery);

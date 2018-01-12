/* 
 * Copyright (c) 2016, Pierre-Anthony Lemieux <pal@sandflow.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @module imscHTML
 */

;
(function (imscHTML, imscNames, imscStyles) {

    /**
     * Function that maps <pre>smpte:background</pre> URIs to URLs resolving to image resource
     * @callback IMGResolver
     * @param {string} <pre>smpte:background</pre> URI
     * @return {string} PNG resource URL
     */


    /**
     * Renders an ISD object (returned by <pre>generateISD()</pre>) into a 
     * parent element, that must be attached to the DOM. The ISD will be rendered
     * into a child <pre>div</pre>
     * with heigh and width equal to the clientHeight and clientWidth of the element,
     * unless explicitly specified otherwise by the caller. Images URIs specified 
     * by <pre>smpte:background</pre> attributes are mapped to image resource URLs
     * by an <pre>imgResolver</pre> function. The latter takes the value of <code>smpte:background</code>
     * attribute and an <code>img</code> DOM element as input, and is expected to
     * set the <code>src</code> attribute of the <code>img</code> to the absolute URI of the image.
     * <pre>displayForcedOnlyMode</pre> sets the (boolean)
     * value of the IMSC1 displayForcedOnlyMode parameter. The function returns
     * an opaque object that should passed in <code>previousISDState</code> when this function
     * is called for the next ISD, otherwise <code>previousISDState</code> should be set to 
     * <code>null</code>.
     * 
     * @param {Object} isd ISD to be rendered
     * @param {Object} element Element into which the ISD is rendered
     * @param {?IMGResolver} imgResolver Resolve <pre>smpte:background</pre> URIs into URLs.
     * @param {?number} eheight Height (in pixel) of the child <div>div</div> or null 
     *                  to use clientHeight of the parent element
     * @param {?number} ewidth Width (in pixel) of the child <div>div</div> or null
     *                  to use clientWidth of the parent element
     * @param {?boolean} displayForcedOnlyMode Value of the IMSC1 displayForcedOnlyMode parameter,
     *                   or false if null         
     * @param {?module:imscUtils.ErrorHandler} errorHandler Error callback
     * @param {Object} previousISDState State saved during processing of the previous ISD, or null if initial call
     * @param {?boolean} enableRollUp Enables roll-up animations (see CEA 708)
     * @return {Object} ISD state to be provided when this funtion is called for the next ISD
     */

    imscHTML.render = function (    isd,
                                    element,
                                    imgResolver,
                                    eheight,
                                    ewidth,
                                    displayForcedOnlyMode,
                                    errorHandler,
                                    previousISDState,
                                    enableRollUp,
									dom_document
                                ) {

		// if alternative dom document functions wanted, use it
		if (dom_document){
			imscHTML.document = dom_document;
			imscHTML.Node = dom_document.Node;
		} else {
			imscHTML.document = document;
			imscHTML.Node = Node;
		}
		
        /* maintain aspect ratio if specified */
        var height = eheight || element.clientHeight;
        var width = ewidth || element.clientWidth;

        if (isd.aspectRatio !== null) {

            var twidth = height * isd.aspectRatio;

            if (twidth > width) {

                height = Math.round(width / isd.aspectRatio);

            } else {

                width = twidth;

            }

        }

        var rootcontainer = imscHTML.document.createElement("div");

        rootcontainer.style.position = "relative";
        rootcontainer.style.width = width + "px";
        rootcontainer.style.height = height + "px";
        rootcontainer.style.margin = 0;
        rootcontainer.style.top = 0;
        rootcontainer.style.bottom = 0;
        rootcontainer.style.left = 0;
        rootcontainer.style.right = 0;
        rootcontainer.style.zIndex = 0;

        var context = {
            h: height,
            w: width,
            regionH: null,
            regionW: null,
            imgResolver: imgResolver,
            displayForcedOnlyMode: displayForcedOnlyMode || false,
            isd: isd,
            errorHandler: errorHandler,
            previousISDState: previousISDState,
            enableRollUp : enableRollUp || false,
            currentISDState: {}
        };

		// can't have display:none, because it can;t then measure.
		//rootcontainer.style.display = 'none';
		rootcontainer.style.top = -1000;
        element.appendChild(rootcontainer);

        for (var i in isd.contents) {

            processElement(context, rootcontainer, isd.contents[i]);

        }
		rootcontainer.style.top = 0;

		//rootcontainer.style.display = 'block';
        return context.currentISDState;

    };

    function processElement(context, dom_parent, isd_element) {

        var e;

        if (isd_element.kind === 'region') {

            e = imscHTML.document.createElement("div");
            e.style.position = "absolute";
			e.style.display = 'flex';
			e.style.flexDirection = 'column';
			e.style.alignItems = 'stretch';
			

        } else if (isd_element.kind === 'body') {

            e = imscHTML.document.createElement("div");
			e.style.display = 'flex';
			e.style.flexDirection = 'column';
			e.style.alignItems = 'stretch';

        } else if (isd_element.kind === 'div') {

            e = imscHTML.document.createElement("div");
			e.style.display = 'flex';
			e.style.flexDirection = 'column';

        } else if (isd_element.kind === 'p') {

			e = imscHTML.document.createElement("p");
			e.style.whiteSpace = 'wrap';

        } else if (isd_element.kind === 'span') {

            e = imscHTML.document.createElement("span");
			e.style.display = 'inline-flex';
			e.style.flexDirection = 'row';
			e.style.whiteSpace = 'pre';
			e.style.lineHeight = 'normal';

        } else if (isd_element.kind === 'br') {

            e = imscHTML.document.createElement("br");

        }

        if (!e) {

            reportError(context.errorHandler, "Error processing ISD element kind: " + isd_element.kind);

            return;

        }

        /* override UA default margin */

        e.style.margin = 0;

        /* tranform TTML styles to CSS styles */

        var proc_e = e;

		for (var i in STYLING_MAP_DEFS) {

            var sm = STYLING_MAP_DEFS[i];

            var attr = isd_element.styleAttrs[sm.qname];

            if (attr !== undefined && sm.map !== null) {

                sm.map(context, e, isd_element, attr);

            }

        }

        // handle multiRowAlign and linePadding - only apply to p
		if (isd_element.kind === 'p'){
			var mra = isd_element.styleAttrs[imscStyles.byName.multiRowAlign.qname];

			e.style.display = 'flex';
			e.style.flexDirection = 'row'; 

			if (mra && mra !== "auto") {
				var p = e;
				//p.style.flexWrap = 'wrap';
				e = imscHTML.document.createElement("div");
				e.style.display = 'flex';
				e.style.flexDirection = 'column';
				var a = 'center';
				switch(p.style.textAlign){
					case 'start':
					case 'left':
						a = 'flex-start';
						break;
					case 'end':
					case 'right':
						a = 'flex-end';
						break;

					case 'center':
						a = 'center';
						break;
				}
				p.style.justifyContent = a;
				p.style.alignItems = 'center'; // center contains spans vertically inside

				// set atts onto div as well.
				for (var _i in STYLING_MAP_DEFS) {
					var _sm = STYLING_MAP_DEFS[_i];
					var _attr = isd_element.styleAttrs[_sm.qname];
					if (_attr !== undefined && _sm.map !== null) {
						_sm.map(context, e, isd_element, _attr);
					}
				}

				e.style.alignItems = a;
				p.style.textAlign = mra;
				e.appendChild(p);
				proc_e = p;
				context.mra = mra;
			}


			var lp = isd_element.styleAttrs[imscStyles.byName.linePadding.qname];

			if (lp && lp > 0) {
				context.lp = lp;
			}
		}

		// append child before so we can measure from parent
        dom_parent.appendChild(e);

        // wrap characters in spans to find the line wrap locations
        if (isd_element.kind === "span" && isd_element.text) {

			var wrap = isd_element.styleAttrs[imscStyles.byName.wrapOption.qname];

			if (wrap === 'wrap'){
				var texts = [isd_element.text];
				if (isd_element.space === 'preserve'){
					texts = isd_element.text.split('\n');
				}

				for (var t = 0; t < texts.length; t++){
					var words = texts[t].split(' ');
					var lastspan = null;
					var leadingspaces = 0;
					var spacestring = '';
					var span = null;
					var spaces;
					for (var j = 0; j < words.length; j++) {
						var word = words[j];
						if (word.length){
							spacestring = '';
							span = imscHTML.document.createElement("span");
							span.style.display = 'inline-flex';	
							span.style.whiteSpace = 'pre';
							for (spaces = 0; spaces < leadingspaces; spaces++){
								spacestring = spacestring + ' ';
							}

							if (j > 0){
								spacestring = spacestring + ' ';
							}

							word = spacestring+word;
							e.appendChild(span); // append before to allow parent to be accessed in text setter
							span.textContent = word;
							leadingspaces = 0;
						} else {
							// if the last word is followed by spaces
							if (j > 0)
								leadingspaces++;
							if (j === words.length - 1){
								spacestring = '';
								for (spaces = 0; spaces < leadingspaces; spaces++){
									spacestring = spacestring + ' ';
								}
								// add them as a new span
								span = imscHTML.document.createElement("span");
								span.style.display = 'inline-flex';
								span.style.whiteSpace = 'pre';
								e.appendChild(span); // append before to allow parent to be accessed in text setter
								span.textContent = spacestring;
								leadingspaces = 0;
							}
						}
					}
					
					// if not the last, then need to insert a br
					if (t < texts.length - 1){
			            var _br = imscHTML.document.createElement("br");
						e.appendChild(_br);
					}
				}
			} else {
				// no need to split up as it's not to be wrapped
                e.textContent = isd_element.text;
			}
        }



		// this processes all children of our element
        for (var k in isd_element.contents) {
            processElement(context, proc_e, isd_element.contents[k]);
        }

        // handle linePadding and multiRowAlign

        if (isd_element.kind === "p") {

            var elist = [];

            constructElementList(proc_e, elist, "red");

            /* TODO: linePadding only supported for horizontal scripts */

			var lppix = (context.lp)? (context.lp * context.h) : 0;
			proc_e.style.linePadding = lppix;
			
			// set a margin of the required ammount,
			// so that things wordwrap at the correct place
			//proc_e.style.margin = lppix+'px';
			
            var plist = processLinePaddingAndMultiRowAlign(elist, lppix, proc_e);
			//proc_e.style.margin = '0px';


			// enforce p height based on content and lineHeight
			for (var _p = 0; _p < plist.length; _p++){
				// line height is the minimum.
				// if it's a fixed size, then it's a fixed size.
				var ht;
				
				if (plist[_p].style.lineHeight.endsWith("px")){
					ht = parseFloat(plist[_p].style.lineHeight);
				} else {
					
					ht = plist[_p].offsetHeight;
				}
				
				var minht = 0;
				for (var _c = 0; _c < plist[_p].children.length; _c++){
					var _child = plist[_p].children[_c];
					if (minht < _child.offsetHeight){
						minht = _child.offsetHeight;
					}
					for (var _c2 = 0; _c2 < _child.children.length; _c2++){
						var _child2 = _child.children[_c2];
						if (minht < _child2.offsetHeight){
							minht = _child2.offsetHeight;
						}
					}
				}
				
				if (ht < minht){
					ht = minht;
				}
				
				// don't let flexbox squash this futher.
				plist[_p].style.minHeight = ht+'px';
			}


            /* TODO: clean-up the spans ? */

            if (context.lp)
                delete context.lp;
            if (context.mra)
                delete context.mra;
        }

        /* region processing */

        if (isd_element.kind === "region") {

            /* build line list */

            var linelist = [];

            constructLineList(proc_e, linelist);

            /* perform roll up if needed */
            
            var wdir = isd_element.styleAttrs[imscStyles.byName.writingMode.qname];

            if ((wdir === "lrtb" || wdir === "lr" || wdir === "rltb" || wdir === "rl") &&
                context.enableRollUp && 
                isd_element.contents.length > 0 &&
                isd_element.styleAttrs[imscStyles.byName.displayAlign.qname] === 'after') {

                /* horrible hack, perhaps default region id should be underscore everywhere? */

                var rid = isd_element.id === '' ? '_' : isd_element.id;

                var rb = new RegionPBuffer(rid, linelist);

                context.currentISDState[rb.id] = rb;

                if (context.previousISDState &&
                    rb.id in context.previousISDState &&
                    context.previousISDState[rb.id].plist.length > 0 &&
                    rb.plist.length > 1 &&
                    rb.plist[rb.plist.length - 2].text ===
                    context.previousISDState[rb.id].plist[context.previousISDState[rb.id].plist.length - 1].text) {

                    var body_elem = e.firstElementChild;

                    body_elem.style.bottom = "-" + rb.plist[rb.plist.length - 1].height + "px";
                    body_elem.style.transition = "transform 0.4s";
                    body_elem.style.position = "relative";
                    body_elem.style.transform = "translateY(-" + rb.plist[rb.plist.length - 1].height + "px)";

                }

            }

        }
    }


    function RegionPBuffer(id, lineList) {

        this.id = id;

        this.plist = lineList;

    }


    function constructElementList(element, elist, bgcolor) {

        if (element.childElementCount === 0) {

            elist.push({
                "element": element,
                "bgcolor": bgcolor}
            );

        } else {

            var newbgcolor = element.style.backgroundColor || bgcolor;

            var child = element.firstChild;

            while (child) {

                if (child.nodeType === imscHTML.Node.ELEMENT_NODE) {

                    constructElementList(child, elist, newbgcolor);

                }

                child = child.nextSibling;
            }
        }

    }


    function constructLineList(element, llist) {

        if (element.childElementCount === 0 && element.localName === 'span') {

            var r = element.getBoundingClientRect();

            if (llist.length === 0 ||
                (!isSameLine(r.top, r.height, llist[llist.length - 1].top, llist[llist.length - 1].height))
                ) {

                llist.push({
                    top: r.top,
                    height: r.height,
                    text: element.textContent
                });

            } else {

                if (r.top < llist[llist.length - 1].top) {
                    llist[llist.length - 1].top = r.top;
                }

                if (r.height > llist[llist.length - 1].height) {
                    llist[llist.length - 1].height = r.height;
                }

                llist[llist.length - 1].text += element.textContent;

            }

        } else {


            var child = element.firstChild;

            while (child) {

                if (child.nodeType === imscHTML.Node.ELEMENT_NODE) {

                    constructLineList(child, llist);

                }

                child = child.nextSibling;
            }
        }

    }
    
    function isSameLine(top1, height1, top2, height2) {

        return (((top1 + height1) < (top2 + height2)) && (top1 > top2)) || (((top2 + height2) <= (top1 + height1)) && (top2 >= top1));

    }

	function stripline(el, line){
		// this will only be set of leaves
		var len;
		var i;

		len = el.children.length;
		for (i = len-1; i >= 0; i--){
			var e = el.children[i];
			e.style.whiteSpace = 'pre';

			if (0){
			switch (e.style.whitespace){
				case 'pre-wrap':
					break;
				case 'pre':
					break;
				case 'normal':
					e.style.whiteSpace = 'nowrap';
					break;
				case '':
				case undefined:
				case 'noWrap':
					// no change
					break;

			}
			}


			if (e.localName === 'br'){
				// lose brs
				el.removeChild(e);
			} else {
				// strip from children
				stripline(e, line);
				// lose empty nodes
				if (e.children.length === 0){
					if (e.textContent.length === 0){
						el.removeChild(e);
					}
				}

				// check this child is our  line
				if (e.id.length){
					if (e.id.indexOf('x') >= 0){
						// on more than one line
					} else {
						if (e.id != line){
						   el.removeChild(e);
						}
					}
				}
			}
		}
	};


	// TODO: when no dom is present, we don't have positions yet
	function getendelements(el, ends){
		var len;
		var i;
		
		len = el.children.length;
		for (i = len-1; i >= 0; i--){
			// only process leaves
			var e = el.children[i];
			if (e.children.length === 0){
				var elrect = e.getBoundingClientRect();
				if (ends.leftx > elrect.left){
					ends.leftx = elrect.left;
					ends.leftel = el.children[i];
				}
				if (ends.rightx < elrect.left+elrect.width){
					ends.rightx = elrect.left+elrect.width;
					ends.rightel = el.children[i];
				}
			}
			getendelements(el.children[i], ends);
		}
	};


	function combinespans(el){
		// if it's a span
		if (el.localName === 'span'){
			// only interested if more than one
			if (el.children.length > 1){
				if (el.children[0].childNodes.length > 0){
					// only interested if text content
					if (el.children[0].childNodes[0].data && el.children[0].childNodes[0].data.length){
						// we know that the only nodes with text are all the same style
						var text = '';
						for (var i = 0; i < el.children.length; i++){
							text = text + el.children[i].childNodes[0].data; // spaces already included
						}
						el.children[0].childNodes[0].data = text;
						for (i = el.children.length-1; i > 0 ; i--){
							el.removeChild(el.children[i]);
						}
					}
				}
			}
		}
		for(var c = 0; c < el.children.length; c++){
			combinespans(el.children[c]);
		}
	};


    function processLinePaddingAndMultiRowAlign(elist, lp, el) {

		var plist = [];
		
		dir = el.style.direction;

		// TODO - check direction
		var a = 'center';
		switch(el.style.textAlign){
			case 'start':
			case 'left':
				a = 'flex-start';
				break;
			case 'end':
			case 'right':
				a = 'flex-end';
				break;

			case 'center':
				a = 'center';
				break;
		}
		el.style.justifyContent = a;
		//el.style.justifyContent = el.style.textAlign;
		
		
		var isSpacePreseve = ((el.style.whiteSpace === 'pre') || (el.style.whiteSpace === 'pre-wrap'));
		
		el.style.whiteSpace = 'pre';
		
		// find the *available* width - the nearest width style; we know we have one
		var wparent = el;
		while (wparent && !wparent.style.width){
			wparent = wparent.parentElement;
		}
		
		var maxwidth = 1024;
		if (wparent){
			console.log("parent width" + wparent.style.width);
			maxwidth = parseFloat(wparent.style.width);
		} else {
			console.log("no width on parent");
		}
		
		// gather spans between <br/>
		
		// gather each line of spans
		var brlines = [];
		var brelements = [];
		var brlinecount = 0;
		brlines[brlinecount] = [];
		var linesize = [];
		linesize[brlinecount] = 0;
		
        for (var i = 0; i < elist.length; i++) {
			// if we find a br, then start a new line
			if (elist[i].element.localName === "br"){
				brlinecount++;
				brlines[brlinecount] = [];
				linesize[brlinecount] = 0;
			} else {
				if ((elist[i].element.localName === "span") && (elist[i].element.children.length === 0)){
					if (linesize[brlinecount] + elist[i].element.offsetWidth > maxwidth-(2*lp)){
						var linestart = false;
						if (linesize[brlinecount] === 0){
							linestart = true;
						}
						brlinecount++;
						brlines[brlinecount] = [];
						linesize[brlinecount] = 0;
						
						// take space off front, only if no space preserve, and not first span
						if (!isSpacePreseve && !linestart){
						    if (elist[i].element.childNodes.length){
							     var t = elist[i].element.childNodes[0].data;
                                if (t){
                                    t = t.slice(1);
                                    elist[i].element.childNodes[0].data = t;
                                }
						    }
						}					}
					linesize[brlinecount] += elist[i].element.offsetWidth;
				}
				
				brlines[brlinecount].push(elist[i]);

				if (elist[i].element.id != '')
    				elist[i].element.id = elist[i].element.id + 'x';
				elist[i].element.id = elist[i].element.id + brlinecount;
			}
		}
		// if we had a last line without a br
		if (brlines[brlinecount].length)
			brlinecount++;

		
        var mradiv = imscHTML.document.createElement("div");
		mradiv.id = 'multiRowAlignDiv';
		mradiv.style.display = 'flex'; 
		mradiv.style.flexDirection = 'column';
		el.parentElement.insertBefore(mradiv, el);
		
		// for each brline, get the spans in presentation order, and allocate to lines
		for (i = 0; i < brlinecount; i++){
			// create a new 'line' - a complete clone of this p
			var p = el.cloneNode(true);
			p.style.whiteSpace = 'nowrap';
			p.class = 'brline'+i;

			// element to center spans vertically in p
			var s = imscHTML.document.createElement("span");
			s.style.display = 'flex';
			s.style.flexDirection = 'row';
			s.style.alignItems = 'baseline';

			// strip out anything not in this line
			stripline(p, i);

			// add words back together
			combinespans(p);

			// move all children onto s
			var children = [];
			for (var c = 0; c < p.children.length; c++){
				children.push(p.children[c]);
			}
			for (c = p.children.length-1; c >= 0; c--){
				p.removeChild(p.children[c]);
			}
			for (c = 0; c < children.length; c++){
				s.appendChild(children[c]);
			}
			
			// put s in p
			p.appendChild(s);
			p.alignItems = 'center';

			plist.push(p);
			// add this new line
			mradiv.appendChild(p);

			// add padding to the first and only child of the new p
			if (lp){
				// find leftmost and rightmost elements, and add padding
				var ends = { leftx:10000, rightx:0, leftel:null, rightel:null, index:0 };
				getendelements(p, ends);
				if (ends.leftel){
					ends.leftel.style.paddingLeft = lp+'px';
				}
				if (ends.rightel){
					ends.rightel.style.paddingRight = lp+'px';
				}
			}
		}
		
		// remove ourselves
		el.parentElement.removeChild(el);
		
		// listy of ops we created instead of the one passed in
		return plist;
    }
	

    function HTMLStylingMapDefintion(qName, mapFunc) {
        this.qname = qName;
        this.map = mapFunc;
    }

    var STYLING_MAP_DEFS = [

        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling backgroundColor",
            function (context, dom_element, isd_element, attr) {
                dom_element.style.backgroundColor = "rgba(" +
                    attr[0].toString() + "," +
                    attr[1].toString() + "," +
                    attr[2].toString() + "," +
                    (attr[3] / 255).toString() +
                    ")";
            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling color",
            function (context, dom_element, isd_element, attr) {
                dom_element.style.color = "rgba(" +
                    attr[0].toString() + "," +
                    attr[1].toString() + "," +
                    attr[2].toString() + "," +
                    (attr[3] / 255).toString() +
                    ")";
            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling direction",
            function (context, dom_element, isd_element, attr) {
                dom_element.style.direction = attr;
            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling display",
            function (context, dom_element, isd_element, attr) {}
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling displayAlign",
            function (context, dom_element, isd_element, attr) {

                /* see https://css-tricks.com/snippets/css/a-guide-to-flexbox/ */

                /* TODO: is this affected by writing direction? */

                dom_element.style.display = "flex";
                dom_element.style.flexDirection = "column";


                if (attr === "before") {

                    dom_element.style.justifyContent = "flex-start";

                } else if (attr === "center") {

                    dom_element.style.justifyContent = "center";

                } else if (attr === "after") {

                    dom_element.style.justifyContent = "flex-end";
                }

            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling extent",
            function (context, dom_element, isd_element, attr) {
                /* TODO: this is super ugly */

                context.regionH = (attr.h * context.h);
                context.regionW = (attr.w * context.w);

                /* 
                 * CSS height/width are measured against the content rectangle,
                 * whereas TTML height/width include padding
                 */

                var hdelta = 0;
                var wdelta = 0;

                var p = isd_element.styleAttrs["http://www.w3.org/ns/ttml#styling padding"];

                if (!p) {

                    /* error */

                } else {

                    hdelta = (p[0] + p[2]) * context.h;
                    wdelta = (p[1] + p[3]) * context.w;

                }

                dom_element.style.height = (context.regionH - hdelta) + "px";
                dom_element.style.width = (context.regionW - wdelta) + "px";

            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling fontFamily",
            function (context, dom_element, isd_element, attr) {

                var rslt = [];

                /* per IMSC1 */

                for (var i in attr) {

                    if (attr[i] === "monospaceSerif") {

                        rslt.push("Courier New");
                        rslt.push('"Liberation Mono"');
                        rslt.push("Courier");
                        rslt.push("monospace");

                    } else if (attr[i] === "proportionalSansSerif") {

                        rslt.push("Arial");
                        rslt.push("Helvetica");
                        rslt.push('"Liberation Sans"');
                        rslt.push("sans-serif");

                    } else if (attr[i] === "monospace") {

                        rslt.push("monospace");

                    } else if (attr[i] === "sansSerif") {

                        rslt.push("sans-serif");

                    } else if (attr[i] === "serif") {

                        rslt.push("serif");

                    } else if (attr[i] === "monospaceSansSerif") {

                        rslt.push("Consolas");
                        rslt.push("monospace");

                    } else if (attr[i] === "proportionalSerif") {

                        rslt.push("serif");

                    } else {

                        rslt.push(attr[i]);

                    }

                }

                dom_element.style.fontFamily = rslt.join(",");
            }
        ),

        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling fontSize",
            function (context, dom_element, isd_element, attr) {
                dom_element.style.fontSize = (attr * context.h) + "px";
            }
        ),

        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling fontStyle",
            function (context, dom_element, isd_element, attr) {
                dom_element.style.fontStyle = attr;
            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling fontWeight",
            function (context, dom_element, isd_element, attr) {
                dom_element.style.fontWeight = attr;
            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling lineHeight",
            function (context, dom_element, isd_element, attr) {
                if (attr === "normal") {

                    dom_element.style.lineHeight = "normal";

                } else {

                    dom_element.style.lineHeight = (attr * context.h) + "px";
                }
            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling opacity",
            function (context, dom_element, isd_element, attr) {
                dom_element.style.opacity = attr;
            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling origin",
            function (context, dom_element, isd_element, attr) {
                dom_element.style.top = (attr.h * context.h) + "px";
                dom_element.style.left = (attr.w * context.w) + "px";
            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling overflow",
            function (context, dom_element, isd_element, attr) {
                dom_element.style.overflow = attr;
            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling padding",
            function (context, dom_element, isd_element, attr) {

                /* attr: top,left,bottom,right*/

                /* style: top right bottom left*/

                var rslt = [];

                rslt[0] = (attr[0] * context.h) + "px";
                rslt[1] = (attr[3] * context.w) + "px";
                rslt[2] = (attr[2] * context.h) + "px";
                rslt[3] = (attr[1] * context.w) + "px";

                dom_element.style.padding = rslt.join(" ");
            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling showBackground",
            null
            ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling textAlign",
            function (context, dom_element, isd_element, attr) {

                var ta;
                var dir = isd_element.styleAttrs[imscStyles.byName.direction.qname];

                /* handle UAs that do not understand start or end */

                if (attr === "start") {

                    ta = (dir === "rtl") ? "right" : "left";

                } else if (attr === "end") {

                    ta = (dir === "rtl") ? "left" : "right";

                } else {

                    ta = attr;

                }

                dom_element.style.textAlign = ta;

            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling textDecoration",
            function (context, dom_element, isd_element, attr) {
                dom_element.style.textDecoration = attr.join(" ").replace("lineThrough", "line-through");
            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling textOutline",
            function (context, dom_element, isd_element, attr) {

                if (attr === "none") {

                    dom_element.style.textShadow = "";

                } else {

					var color = "rgba(" +
                        attr.color[0].toString() + "," +
                        attr.color[1].toString() + "," +
                        attr.color[2].toString() + "," +
                        (attr.color[3] / 255).toString() +
                        ")";
//                    dom_element.style.textShadow = color + " 0px 0px " +
//                        (attr.thickness * context.h) + "px";
					var px = (attr.thickness * context.h);

                    dom_element.style.textShadow = 
						color + " "+px+"px "+px+"px " +px/3+"px," +
						color + " -"+px+"px -"+px+"px " +px/3+"px," +
						color + " -"+px+"px "+px+"px " +px/3+"px," +
						color + " "+px+"px -"+px+"px " +px/3+"px," +
						color + " "+px+"px 0px " +px/3+"px," +
						color + " -"+px+"px 0px " +px/3+"px," +
						color + " 0px "+px+"px " +px/3+"px," +
						color + " 0px -"+px+"px " +px/3+"px";

                }
            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling unicodeBidi",
            function (context, dom_element, isd_element, attr) {

                var ub;

                if (attr === 'bidiOverride') {
                    ub = "bidi-override";
                } else {
                    ub = attr;
                }

                dom_element.style.unicodeBidi = ub;
            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling visibility",
            function (context, dom_element, isd_element, attr) {
                dom_element.style.visibility = attr;
            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling wrapOption",
            function (context, dom_element, isd_element, attr) {

                if (attr === "wrap") {

                    if (isd_element.space === "preserve") {
                        dom_element.style.whiteSpace = "pre-wrap";
                    } else {
                        dom_element.style.whiteSpace = "normal";
                    }

                } else {

                    if (isd_element.space === "preserve") {

                        dom_element.style.whiteSpace = "pre";

                    } else {
                        dom_element.style.whiteSpace = "noWrap";
                    }

                }

            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling writingMode",
            function (context, dom_element, isd_element, attr) {
                if (attr === "lrtb" || attr === "lr") {

                    dom_element.style.writingMode = "horizontal-tb";

                } else if (attr === "rltb" || attr === "rl") {

                    dom_element.style.writingMode = "horizontal-tb";

                } else if (attr === "tblr") {

                    dom_element.style.writingMode = "vertical-lr";

                } else if (attr === "tbrl" || attr === "tb") {

                    dom_element.style.writingMode = "vertical-rl";

                }
            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml#styling zIndex",
            function (context, dom_element, isd_element, attr) {
                dom_element.style.zIndex = attr;
            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.smpte-ra.org/schemas/2052-1/2010/smpte-tt backgroundImage",
            function (context, dom_element, isd_element, attr) {

                if (context.imgResolver !== null && attr !== null) {

                    var img = imscHTML.document.createElement("img");

                    var uri = context.imgResolver(attr, img);

                    if (uri) img.src = uri;

                    img.height = context.regionH;
                    img.width = context.regionW;

                    dom_element.appendChild(img);
                }
            }
        ),
        new HTMLStylingMapDefintion(
            "http://www.w3.org/ns/ttml/profile/imsc1#styling forcedDisplay",
            function (context, dom_element, isd_element, attr) {

                if (context.displayForcedOnlyMode && attr === false) {
                    dom_element.style.visibility = "hidden";
                }

            }
        )
    ];

    var STYLMAP_BY_QNAME = {};

    for (var i in STYLING_MAP_DEFS) {

        STYLMAP_BY_QNAME[STYLING_MAP_DEFS[i].qname] = STYLING_MAP_DEFS[i];
    }

    function reportError(errorHandler, msg) {

        if (errorHandler && errorHandler.error && errorHandler.error(msg))
            throw msg;

    }

})(typeof exports === 'undefined' ? this.imscHTML = {} : exports,
    typeof imscNames === 'undefined' ? require("./names") : imscNames,
    typeof imscStyles === 'undefined' ? require("./styles") : imscStyles);
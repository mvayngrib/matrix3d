(function(window) {
	var i = 0, 
		started,
		$prev, 
		$page, 
		$next,
		$wnd = $(window),
		transitions = {
			none: {
				fromPageTransition: function() {
					return identity();
					//return identityTransition(); // reuse
				},
				toPageBeforeTransition: function() {
					return identity();
					//return identityTransition();
				}
			},
			left: {
				fromPageTransition: function() {
					return translation(-$wnd.width());
				},
				toPageBeforeTransition: function(to) {
					return translation($wnd.width());
				}
			},
			right: {
				fromPageTransition: function() {
					return translation($wnd.width());
				},
				toPageBeforeTransition: function() {
					return translation(-$wnd.width());
				}
			},
			up: {
				fromPageTransition: function() {
					return translation(0, -$wnd.height());
				},
				toPageBeforeTransition: function() {
					return translation(0, window.innerHeight + window.scrollY);
				}					
			},
			down: {
				fromPageTransition: function() {
					return translation(0, $wnd.height());
				},
				toPageBeforeTransition: function() {
					return translation(0, -$wnd.height());
				}					
			},
			zoomIn: {
				fromPageTransition: function() {
					return identity();
	//						return identityTransition();
				},
				toPageBeforeTransition: function() {
					return scale(0, 0);
				}
			},
			downLeft: {
				fromPageTransition: function() {
					//return identity();
					return transitions.upRight.toPageBeforeTransition();
				},
				toPageBeforeTransition: function() {
					return translation($wnd.width(), -$wnd.height());
				}					
			},
			downRight: {
				fromPageTransition: function() {
					return transitions.upLeft.toPageBeforeTransition();
				},
				toPageBeforeTransition: function() {
					return translation(-$wnd.width(), -$wnd.height());
				}					
			},
			upLeft: {
				fromPageTransition: function() {
					return transitions.downRight.toPageBeforeTransition();
				},
				toPageBeforeTransition: function() {
					return translation($wnd.width(), $wnd.height());
				}					
			},
			upRight: {
				fromPageTransition: function() {
					return transitions.downLeft.toPageBeforeTransition();
				},
				toPageBeforeTransition: function() {
					return translation(-$wnd.width(), $wnd.height());
				}					
			}
			/*,
			skewRight: {
				fromPageTransition: function() {
					return transitions.right.fromPageTransition();
				},
				toPageBeforeTransition: function() {
					return transitions.right.toPageBeforeTransition();
				}
			},*/

		};

	function Transition() {
		this._sequence = [];
		return this;
	};

	Transition.prototype.add = function(transform, duration, ease) {
		this._sequence.push({
			transform: transform,
			duration: duration,
			ease: ease
		});
		
		return this;
	};

	Transition.prototype.clone = function() {
		var trans = new Transition();
		for (var i = 0, length = this._sequence.length; i < length; i++) {
			var step = this._sequence[i];
			trans.add(transform.dup(), step.duration, step.ease);
		}
		
		return trans;
	};

	Transition.prototype.run = function(element, override) {
		var tween = createjs.get(this._el, {override: override});
		for (var i = 0, length = this._sequence.length; i < length; i++) {
			var step = this._sequence[i];
			if (step.transform) {
				tween.to({
					transform: step.transform.elements
				}, step.duration, step.ease);
			}
			else
				tween.wait(step.duration);
		}
		
		return tween;
	};
			
	function toPageTransition(to) {
		return identity();
	};

	for (var name in transitions) {
		var trans = transitions[name];
		if (!trans.toPageTransition)
			trans.toPageTransition = toPageTransition;
	}

	cssTweener = createjs.CSSPlugin;
	transformer = createjs.Matrix3DPlugin;			
	createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
	transformer.install(createjs.Tween);
	//		cssTweener.install(createjs.Tween);
			
	Matrix.prototype.scale = function() {
		if (!this.isSquare())
			throw "only a square matrix can be scaled uniformly";
			
		var rows = this.rows(),
			m = Matrix.Zero(rows, rows),
			elements = m.elements;
			
		for (var i = 0; i < rows; i++) {
			m.elements[i][i] = arguments[i] || 1;
		}
		
		return this.multiply(m);
	};

	function translation(x, y, z) {
		var i = identity();
		i.elements[3] = [x || 0, y || 0, z || 0, 1];
		return i;
	}

	function translate(matrix, x, y, z) {
		return matrix.x(translation(x, y, z));
	}

	function doTransition(from, to, transition, ease) {
		var speed = 1000;
			complete = false;
			
		function onComplete() {
			if (!complete) {
				complete = true;
				if (from)
					$(from).removeClass('ui-page-active');
			}
		}

		ease = ease || createjs.Ease.sineInOut;
		transform(to, transition.toPageBeforeTransition(to));
		if (from)
			transform(from, transition.fromPageTransition(), speed, ease).call(onComplete);

		$(to).addClass('ui-page-active');
		transform(to, transition.toPageTransition(), speed, ease).call(onComplete);
		
		if (!from)
			onComplete();
	}

	function position(what, where) {
		var matrix = identity();
		for (var i = 0; i < arguments.length; i++) {
			matrix.elements[3][i] = arguments[i];
		}
		
		return matrix;
	}

	function scale(/*x, y, z*/) {
		var matrix = identity();
		for (var i = 0; i < arguments.length; i++) {
			matrix.elements[i][i] = arguments[i];
		}
		
		return matrix;
	}

	function skew(/*x, y, z*/) {
		var x = Math.tan(arguments[0] || 0),
			y = Math.tan(arguments[1] || 0),
			z = Math.tan(arguments[2] || 0);
			
		return $M([
		  [1, y, z, 0],
		  [x, 1, z, 0],
		  [x, y, 1, 0],
		  [0, 0, 0, 1]
		]);
	}

	function setTransform(el, matrix) {
		transformer.setStylePropertyValue(el.style, 'transform', transformer.toMatrix3DString(matrix));
	}

	function transform(el, matrix, speed, ease) {
		matrix = matrix.elements || matrix;
		if (!speed) {
			setTransform(el, matrix);
			return;
		}
		
		return createjs.Tween.get(el).to({
			transform: matrix
		}, speed, ease);
	}

	function identity() {
		return Matrix.I(4);
	}		

	function identityTransition(el) {
		return new Transition(el);
	};
	
	window.transitions = transitions;
	window.transition = doTransition;
})(window);
/*
* Matrix3DPlugin
*/

/**
* @module TweenJS
*/

(function() {
	"use strict";
  /**
   * A TweenJS plugin for using the matrix3d transform. To use simply install after
   * TweenJS has loaded:
   *
   *      createjs.Matrix3DPlugin.install();
   *
   * Please note that the Matrix3DPlugin is not included in the TweenJS minified file.
   * @class Matrix3DPlugin
   * @constructor
   **/
  var Matrix3DPlugin = function() {
    throw("Matrix3DPlugin cannot be instantiated.")
  }

  var vendorPrefixes = ['', '-moz-', '-ms-', '-o-', '-webkit-'];
  
  /**
   * Defaults to 'px' in all browsers. Can be set to something else, like 'em', for Firefox only.  
   * @property TRANSLATION_UNITS
   * @protected
   * @static
   **/
  Matrix3DPlugin.TRANSLATION_UNITS = 'px'; // feel free to set it to 'em', etc.
  var isFirefox = /(mozilla)(?:.*? rv:([\w.]+))?/.test(navigator.userAgent); // Firefox wants units for translation transform - px, em, etc. This plugin uses px.

  function getNewIdentityMatrix() {
    return [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
  };
  
  function toMatrix3DString(transform) {
  	var s = "matrix3d(";
  	for (var i = 0; i < 4; i++) {
  		for (var j = 0; j < 4; j++) {
  			s += transform[i][j] + ',';
  		}
  	}
  	
  	return s.slice(0, s.length - 1) + ')';
  };

  function getStylePropertyValue(computedStyle, prop) {
    var value;
    for (var i = 0; i < vendorPrefixes.length; i++) {
      value = computedStyle.getPropertyValue(vendorPrefixes[i] + prop);
      if (value && value !== 'none')
        break;
    }
    
    return value || 'none';
  }

  function setStylePropertyValue(style, prop, value) {
    for (var i = 0; i < vendorPrefixes.length; i++) {
      style[vendorPrefixes[i] + prop] = value;
    }
  }

	function extractTransform(el) {
		var computedStyle = window.getComputedStyle(el, null); // "null" means this is not a pesudo style.
		// You can retrieve the CSS3 matrix string by the following method.
		var transform = getStylePropertyValue(computedStyle, 'transform');
		return transform == 'none' ? getNewIdentityMatrix() : parseTransform(transform);
	}

	var matrices = [];
	function parseTransforms(transformsStr) {
	  if (!transformsStr || transformsStr === 'none')
	    return null;
	  
	  var match;
	  
	  while ((match = transformsStr.match(/((translate|rotate|skew|perspective|scale|matrix|matrix3d)[XYZ]?)\((\d+)(px|em|deg|rad|\%|in)\)/i))) {
	    transformsStr = transformsStr.slice(transformsStr.indexOf(match[0]) + match[0].length);
//	    matrices.push(opToMatrix(op, amount, units));
	    matrices.push(opToMatrix(match[1] /* operation like translate, rotate */ , parseFloat(match[3]) /* amount to transform */, match[4] /* px, em, %, etc. */));
	  }
	}
	
	function opToMatrix(op, amount, units) {
	  
	};
	
	var TransformOp = function(op, amount, units) {
	  switch (op) {
	  case 'translate':
	    return Translate(amount, units);
	  }
	};
	
	function Op() {
	}

	function Translate(tx, ty, tz) {
	  Op.call(this);
	  this.tx = parseFloat(tx) || 0;
    this.ty = parseFloat(ty) || 0;
    this.tz = parseFloat(tz) || 0;
	};
	
	Translate.prototype.toMatrix = function() {
	  var translationMatrix = getNewIdentityMatrix(),
	      translationRow = iClone[4];
	  
	  if (this.tx)
	    translationRow[0] = this.tx;
    if (this.ty)
      translationRow[1] = this.ty;
    if (this.tz)
      translationRow[2] = this.tz;
    
    return translationMatrix;
	};
	
  function TranslateX(tx) {
    Translate.call(this, tx);
  };

  function TranslateY(ty) {
    Translate.call(this, 0, ty);
  };

  function TranslateZ(tz) {
    Translate.call(this, 0, 0, tz);
  };

  function Rotate(angle) {
    Op.call(this);
    this.angle = parseFloat(angle);
    this.units = /deg/.test(angle) ? 'deg' : 'rad';
    if (this.units == 'deg')
      this.angle = this.angle * 2 * Math.Pi / 360;
  };
  
  Rotate.prototype.toMatrix = function() {
    var angle = this.angle;
    return [
      [Math.cos(angle),  Math.sin(angle), 0, 0], 
      [-Math.sin(angle), Math.cos(angle), 0, 0], 
      [0,                0,               1, 0], 
      [0,                0,               0, 1]
    ];
  };
  
  function RotateX(angle) {
    Rotate.call(this, angle);
  };

  RotateX.prototype.toMatrix = function() {
    var angle = this.angle;
    return [
      [1,                0,                0,               0], 
      [0,                Math.cos(angle),  Math.sin(angle), 0], 
      [0,                -Math.sin(angle), Math.cos(angle), 0], 
      [0,                0,                0,               1]
    ];    
  };

  function RotateY(angle) {
    Rotate.call(this, angle);
  };

  RotateY.prototype.toMatrix = function() {
    var angle = this.angle;
    return [
      [Math.cos(angle),  0, Math.sin(angle), 0], 
      [0,                1, 0,               0], 
      [-Math.sin(angle), 1, Math.cos(angle), 0], 
      [0,                0, 0,               1]
    ];    
  };
  
  function RotateZ(angle) {
    Rotate.call(this, angle);
  };
  
  function Scale(x, y, z) {
    Op.call(this);
    this.sx = x || 1;
    this.sy = y || 1;
    this.sz = z || 1;
  };
  
  Scale.prototype.toMatrix = function() {
    return [
      [this.x, 0,      0,      0],
      [0,      this.y, 0,      0],
      [0,      0,      this.z, 0],
      [0,      0,      0,      1]
    ];
  };
  
  function ScaleX(amount) {
    Scale.call(this, amount);
  };

  function ScaleY(y) {
    Scale.call(this, 1, amount);
  };

  function ScaleZ(z) {
    Scale.call(this, 1, 1, amount);
  };
  
  //TODO: Skew
  function Skew(x, y, z) {
    Op.call(this);
    this.sx = x || 0;
    this.sy = y || 0;
    this.sz = z || 0;
  };
  
  Skew.prototype.toMatrix = function() {
    return [
      [1,                 Math.tan(this.sy), Math.tan(this.sz), 0],
      [Math.tan(this.sx), 1,                 Math.tan(this.sz), 0],
      [Math.tan(this.sx), Math.tan(this.sy), 1,                 0],
      [0,                 0,                 0,                 1]
    ];
  };

  function SkewX(x) {
    Skew.call(this, x);
  };

  function SkewY(y) {
    Skew.call(this, 0, y);
  };

  function SkewZ(z) {
    Skew.call(this, 0, 0, z);
  };

	function parseTransform(transformStr) {
		// matrix(a, b, c, d, tx, ty) is a shorthand for matrix3d(a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1).
		var matrixMatch = transformStr.match(/^matrix\((.*)\)/),
  			matrix3dMatch = !matrixMatch && transformStr.match(/^matrix3d\((.*)\)/),
  			nums = (matrixMatch || matrix3dMatch)[1].split(','),
  			matrix = [];
		
		if (matrixMatch)
			nums = [nums[0], nums[1], "0", "0", nums[2], nums[3], "0", "0", "0", "0", "1", "0", nums[4], nums[5], "0", "1"];
		
		for (var i = 0; i < 4; i++) {
			var row = matrix[i] = [];
			for (var j = 0; j < 4; j++) {
				row[j] = parseFloat(nums[i * 4 + j].trim());
			}
		}
		
		return matrix;
	}
	
	/**
	 * @property priority
	 * @protected
	 * @static
	 **/
	Matrix3DPlugin.priority = -100; // very low priority, should run last

	/**
	 * Installs this plugin for use with TweenJS. Call this once after TweenJS is loaded to enable this plugin.
	 * @method install
	 * @static
	 **/
	Matrix3DPlugin.install = function() {
		createjs.Tween.installPlugin(Matrix3DPlugin, ['transform']);
	}

	/**
	 * @method init
	 * @protected
	 * @static
	 **/
	Matrix3DPlugin.init = function(tween, prop, value) {
		return extractTransform(tween.target) || getNewIdentityMatrix();
	}

	/**
	 * @method step
	 * @protected
	 * @static
	 **/
	Matrix3DPlugin.step = function(tween, prop, startValue, endValue, injectProps) {
	  // unused
	}


	/**
	 * @method tween
	 * @protected
	 * @static
	 **/
	Matrix3DPlugin.tween = function(tween, prop, value, startValues, endValues, ratio, wait, end) {
		var style;
		if (prop != 'transform' || !(style = tween.target.style)) 
			return value; 
		
		value = tweenMatrix(startValues[prop], endValues[prop], ratio);
		setStylePropertyValue(style, 'transform', toMatrix3DString(value)); // set both, in case we don't need prefix
		return value;
	}
	
	Matrix3DPlugin.toMatrix3DString = toMatrix3DString;
	Matrix3DPlugin.getNewIdentityMatrix = getNewIdentityMatrix;
  Matrix3DPlugin.setStylePropertyValue = setStylePropertyValue;
	
	function tweenMatrix(v0, v1, ratio) {
		var v = [],
			multiply = createjs.Tween.prototype._multiply;
			
		for (var i = 0; i < 4; i++) {
			var row = v[i] = [],
				v0i = v0[i],
				v1i = v1[i];
			for (var j = 0; j < 4; j++) {
				row[j] = step(v0i[j], v1i[j], ratio);
			}
		}
		
		return v;
	};

	function getSuffix(val) {
    var match = val.match(/^(-?\d+)(.*)/);
    return match && match[2];
	}
	
	function step(v0, v1, ratio) {
	  var suffix = '';
    if (typeof v0 == 'string') {
      suffix = getSuffix(v0);
      v0 = parseFloat(v0);
    }
    
	  if (typeof v1 == 'string') {
	    suffix = getSuffix(v1);
      v1 = parseFloat(v1);
	  }
	    
		var newVal = parseFloat(round(v0+(v1-v0)*ratio));
		return suffix ? newVal + suffix : newVal;
	}
	
	function round(val) {
	  return val.toFixed(10);
	}

createjs.Matrix3DPlugin = Matrix3DPlugin;
}());

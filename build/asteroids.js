/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var loop_1 = __webpack_require__(1);
	var keys_1 = __webpack_require__(2);
	var ship_1 = __webpack_require__(4);
	var bullet_1 = __webpack_require__(7);
	var screen_1 = __webpack_require__(6);
	var ship = new ship_1.Ship({ x: screen_1.default.width / 2, y: screen_1.default.height / 2 });
	var bullets = [];
	var bulletCounter = 0;
	var drawBackground = function () {
	    screen_1.default.draw.rect({ x: 0, y: 0 }, { x: screen_1.default.width, y: screen_1.default.height }, '#000000');
	};
	var update = function (step) {
	    ship.update();
	    for (var i = 0; i < bullets.length; i++) {
	        bullets[i].update(step);
	    }
	    bullets = bullets.filter(function (x) { return x.life > 0; });
	    if (bulletCounter > 0) {
	        bulletCounter -= step;
	    }
	    if (keys_1.Key.isDown(keys_1.Key.CTRL) && bulletCounter <= 0) {
	        bulletCounter = .1;
	        if (bullets.length < 4) {
	            bullets.push(new bullet_1.Bullet(ship));
	        }
	    }
	};
	var render = function (delta) {
	    drawBackground();
	    ship.draw();
	    for (var i = 0; i < bullets.length; i++) {
	        bullets[i].draw();
	    }
	};
	loop_1.loop(update, render);


/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	var timestamp = function () {
	    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
	};
	var now;
	var delta = 0;
	var last = timestamp();
	var step = 1 / 60;
	var init = function (update, render) {
	    var frame = function () {
	        now = timestamp();
	        delta = delta + Math.min(1, (now - last) / 1000);
	        while (delta > step) {
	            delta -= step;
	            update(step);
	        }
	        render(delta);
	        last = now;
	        requestAnimationFrame(frame);
	    };
	    frame();
	};
	exports.loop = function (update, render) {
	    init(update, render);
	};


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	exports.Key = {
	    _pressed: {},
	    LEFT: 37,
	    UP: 38,
	    RIGHT: 39,
	    SHIFT: 16,
	    CTRL: 17,
	    isDown: function (keyCode) {
	        return this._pressed[keyCode];
	    },
	    onKeydown: function (event) {
	        this._pressed[event.keyCode] = true;
	    },
	    onKeyup: function (event) {
	        delete this._pressed[event.keyCode];
	    }
	};
	window.addEventListener('keyup', function (event) { exports.Key.onKeyup(event); }, false);
	window.addEventListener('keydown', function (event) { exports.Key.onKeydown(event); }, false);


/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	var Draw = (function () {
	    function Draw(ctx) {
	        this.ctx = ctx;
	    }
	    Draw.prototype.line = function (p1, p2, strokeStyle, width) {
	        if (width === void 0) { width = 2; }
	        var ctx = this.ctx;
	        ctx.beginPath();
	        ctx.strokeStyle = strokeStyle;
	        ctx.lineWidth = width;
	        ctx.moveTo(p1.x, p1.y);
	        ctx.lineTo(p2.x, p2.y);
	        ctx.stroke();
	        ctx.closePath();
	    };
	    Draw.prototype.shape = function (origin, points, color, closed) {
	        if (closed === void 0) { closed = true; }
	        var p1, p2;
	        for (var i = 0; i < points.length - 1; i++) {
	            p1 = { x: origin.x + points[i].x, y: origin.y + points[i].y };
	            p2 = { x: origin.x + points[i + 1].x, y: origin.y + points[i + 1].y };
	            this.line(p1, p2, color, 2);
	        }
	        if (closed) {
	            this.line(p2, { x: origin.x + points[0].x, y: origin.y + points[0].y }, color, 2);
	        }
	    };
	    Draw.prototype.rect = function (p1, p2, fillStyle) {
	        var ctx = this.ctx;
	        ctx.beginPath();
	        ctx.fillStyle = fillStyle;
	        ctx.fillRect(p1.x, p1.y, p2.x, p2.y);
	        ctx.stroke();
	        ctx.closePath();
	    };
	    Draw.prototype.point = function (p, fillStyle) {
	        if (fillStyle === void 0) { fillStyle = '#ffffff'; }
	        this.rect(p, { x: 2, y: 2 }, fillStyle);
	    };
	    return Draw;
	}());
	exports.Draw = Draw;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var keys_1 = __webpack_require__(2);
	var lut_1 = __webpack_require__(5);
	var screen_1 = __webpack_require__(6);
	var ACCELERATION = 0.2;
	var FRICTION = 0.007;
	var ROTATION = 5;
	var MAX_SPEED = 15;
	var Ship = (function () {
	    function Ship(origin) {
	        this.origin = origin;
	        this.angle = 360;
	        this.vx = 0;
	        this.vy = 0;
	        this.moving = false;
	        this.color = '#ffffff';
	        this.points = [
	            { x: 0, y: -15 },
	            { x: 10, y: 10 },
	            { x: 5, y: 5 },
	            { x: -5, y: 5 },
	            { x: -10, y: 10 }
	        ];
	        this.flame = [
	            { x: 5, y: 8 },
	            { x: 0, y: 20 },
	            { x: -5, y: 8 },
	        ];
	    }
	    Ship.prototype.draw = function () {
	        screen_1.default.draw.shape(this.origin, this.points, this.color, true);
	        if (this.moving && (Math.floor(Math.random() * 10) + 1) % 2 === 0) {
	            screen_1.default.draw.shape(this.origin, this.flame, this.color, false);
	        }
	    };
	    Ship.prototype.update = function () {
	        this.origin.x += this.vx;
	        this.origin.y += this.vy;
	        if (this.origin.x > screen_1.default.width) {
	            this.origin.x -= screen_1.default.width;
	        }
	        if (this.origin.x < 0) {
	            this.origin.x += screen_1.default.width;
	        }
	        if (this.origin.y > screen_1.default.height) {
	            this.origin.y -= screen_1.default.height;
	        }
	        if (this.origin.y < 0) {
	            this.origin.y += screen_1.default.height;
	        }
	        this.vx -= this.vx * FRICTION;
	        this.vy -= this.vy * FRICTION;
	        if (keys_1.Key.isDown(keys_1.Key.UP)) {
	            this.moving = true;
	            this.move();
	        }
	        else {
	            this.moving = false;
	        }
	        if (keys_1.Key.isDown(keys_1.Key.LEFT)) {
	            this.rotate(-ROTATION);
	        }
	        if (keys_1.Key.isDown(keys_1.Key.RIGHT)) {
	            this.rotate(ROTATION);
	        }
	        if (keys_1.Key.isDown(keys_1.Key.CTRL)) {
	        }
	        if (keys_1.Key.isDown(keys_1.Key.SHIFT)) {
	        }
	    };
	    Ship.prototype.rotate = function (angle) {
	        this.angle += angle;
	        if (this.angle < 0) {
	            this.angle += 360;
	        }
	        if (this.angle > 360) {
	            this.angle -= 360;
	        }
	        var c = lut_1.COS[angle];
	        var s = lut_1.SIN[angle];
	        var points = this.points.concat(this.flame);
	        points.forEach(function (p) {
	            var newX = (c * p.x) - (s * p.y);
	            var newY = (s * p.x) + (c * p.y);
	            p.x = newX;
	            p.y = newY;
	        });
	    };
	    Ship.prototype.move = function () {
	        var t = 2 * Math.PI * (this.angle / 360);
	        var x = Math.sin(t);
	        var y = Math.cos(t);
	        if (this.vx >= -MAX_SPEED && this.vx <= MAX_SPEED) {
	            this.vx += x * ACCELERATION;
	        }
	        if (this.vy >= -MAX_SPEED && this.vy <= MAX_SPEED) {
	            this.vy -= y * ACCELERATION;
	        }
	    };
	    Object.defineProperty(Ship.prototype, "speed", {
	        get: function () {
	            return Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
	        },
	        enumerable: true,
	        configurable: true
	    });
	    return Ship;
	}());
	exports.Ship = Ship;


/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	var RAD = {};
	exports.RAD = RAD;
	var COS = {};
	exports.COS = COS;
	var SIN = {};
	exports.SIN = SIN;
	var r = Math.PI / 180;
	for (var i = 1; i <= 360; i++) {
	    RAD[i] = i * r;
	    COS[i] = Math.cos(RAD[i]);
	    SIN[i] = Math.sin(RAD[i]);
	    RAD[-i] = -i * r;
	    COS[-i] = Math.cos(RAD[-i]);
	    SIN[-i] = Math.sin(RAD[-i]);
	}


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var draw_1 = __webpack_require__(3);
	var Screen = (function () {
	    function Screen() {
	        var _this = this;
	        this.canvas = document.getElementById('canvas');
	        this.ctx = this.canvas.getContext('2d');
	        this.draw = new draw_1.Draw(this.ctx);
	        this.init();
	        window.addEventListener('resize', function () {
	            _this.init();
	        });
	    }
	    Screen.prototype.init = function () {
	        this.canvas.width = document.body.clientWidth;
	        this.canvas.height = document.body.clientHeight;
	        this.width = this.canvas.width;
	        this.height = this.canvas.height;
	    };
	    return Screen;
	}());
	exports.Screen = Screen;
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = new Screen();


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var screen_1 = __webpack_require__(6);
	var lut_1 = __webpack_require__(5);
	var BulletSpeed = 8;
	var Bullet = (function () {
	    function Bullet(ship) {
	        this.ship = ship;
	        this.life = 1.5;
	        this.visible = true;
	        var angle = ship.angle;
	        this.vx = lut_1.SIN[angle];
	        this.vy = -lut_1.COS[angle];
	        this.origin = {
	            x: ship.origin.x,
	            y: ship.origin.y
	        };
	        this.origin.x += this.vx * 20;
	        this.origin.y += this.vy * 20;
	        var speed = 0;
	        var dot = (ship.vx * this.vx) + (ship.vy * this.vy);
	        if (dot > 0) {
	            speed = ship.speed;
	        }
	        this.vx *= (BulletSpeed + speed);
	        this.vy *= (BulletSpeed + speed);
	    }
	    Bullet.prototype.draw = function () {
	        if (this.visible) {
	            screen_1.default.draw.point(this.origin);
	        }
	    };
	    Bullet.prototype.update = function (step) {
	        this.origin.x += this.vx;
	        this.origin.y += this.vy;
	        if (this.origin.x > screen_1.default.width) {
	            this.origin.x -= screen_1.default.width;
	        }
	        if (this.origin.x < 0) {
	            this.origin.x += screen_1.default.width;
	        }
	        if (this.origin.y > screen_1.default.height) {
	            this.origin.y -= screen_1.default.height;
	        }
	        if (this.origin.y < 0) {
	            this.origin.y += screen_1.default.height;
	        }
	        this.life -= step;
	        if (this.life <= 0) {
	            this.visible = false;
	        }
	    };
	    return Bullet;
	}());
	exports.Bullet = Bullet;


/***/ }
/******/ ]);
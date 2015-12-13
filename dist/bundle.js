/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(7);
	__webpack_require__(10);
	__webpack_require__(12);
	__webpack_require__(18);
	__webpack_require__(22);
	__webpack_require__(23);
	
	
	alert('start');
	
														// win (shoot -> talk)
	// walk -> stand -> unholster('fire!') -> setTimeout
														// lose (fall)
	
	
	var game = {
		names: ['billy', 'bob', 'mark', 'randy', 'sheffer'],
		opponents: [],
	
		defineGunmanSkill: function(){
			return Math.floor( (1.5 + Math.random()) * 1000 );
		},
	
		randomTrueOrFalse : function(){
			return ((Math.random() - 0.5) < 0) ? false : true;
		},
		defineRandomOpponentName: function(){
			var randNum = Math.floor( Math.random() * game.names.length );
			return game.names[randNum];
		},
		spawnOpponents: function(num){
			var dimension = Math.round( 100 / num );
			for (var i = 0, len = game.names.length, position = -dimension / 2; i < num; i++){
				var name = game.names[ i % len ];
				position += dimension;
				game.opponents.push( new Opponent( name, position + '%' ));
			}
		},
	
		showStats: function(){
			setTimeout(function () {
				var statElement = document.querySelector('#opponentStats');
	
					game.opponents.forEach( function(opp) {
						aDiv = document.createElement('div');
						aDiv.innerHTML = (opp.skill / 1000).toPrecision(3);
						aDiv.id = 'stats-' + opp.domElement.id;
						aDiv.className = 'skillsOptions';
						aDiv.style.left = opp.domElement.style.left;
						statElement.appendChild(aDiv);
					});
	
			}, 25);
		},
	
		kill : function(killedOpp){
			canvas.flick();
			// game.removeAllChildren(killedOpp.domElement);
	
	
			var newArr = [];
			game.opponents.forEach(function(opp){
				if (opp.name != killedOpp.name ){
					newArr.push(opp);
				}
			});
			game.opponents = newArr;
		},
	
		removeAllChildren : function(domElement){
			while (domElement.firstChild) {
				domElement.removeChild(domElement.firstChild);
			}
		},
	
		getOpponentById : function (killedId) {
			for (var i = game.opponents.length; i > 0; i--){
				if(game.opponents[i-1].domElement.id == killedId){
					return game.opponents[i-1];
				}
			}
		},
	
		opponentsWaitThenDo : function(ms, action, sfx){
	
			setTimeout(function () {
				game.opponents.forEach(function(opp){
					opp[action]();
				});
	
				if (sfx) {sounds.playNewStopOld(sfx);}
			}, ms);
		},
	};
	
	
	
	
	
	var gamePlay = {
	
		turn : 0,
	
	
		checkIfInGame : function () {
			var flag = true;
			for (i = game.opponents.length - 1; i >= 0; i--){
				 flag = flag && (gamePlay.gameDurationMs < game.opponents[i].skill);
			}
			return flag;
		},
	
		startTimer : function(){
			gamePlay.timer = setTimeout(function tick() {
	
					gamePlay.gameDurationMs += 10;
					points.myStatsDivElement.innerHTML = 'time ' + (gamePlay.gameDurationMs / 1000).toPrecision(3);
	
	
					if ( !gamePlay.checkIfInGame() && !gamePlay.foulState) {
						clearTimeout(gamePlay.timer);
						console.log('you lose!');
	
	
						canvas.winLose.style.visibility = 'visible';
						canvas.winLose.innerHTML = 'you lose!';
	
	
						game.opponents.forEach(function(opp){
							opp.gunmanSayDomElement.innerHTML = "You're dead";
							opp.domElement.removeChild(opp.svgIcon);
						});
	
						sounds.playOnTop('shoot');
						canvas.red();
						sounds.playNewStopOld('youLost');
						canvas.domElement.removeEventListener('click', gamePlay.shootPhase, true);
	
						game.opponents[game.opponents.length - 1].domElement.removeEventListener('transitionend', startGame);
	
						game.opponentsWaitThenDo(10, 'talk');
						game.opponentsWaitThenDo(3500, 'walkOut');
	
	
					}
	
					else{
						if (game.opponents.length === 0) {
							console.log('you win!');
	
							points.resolveKilledTimePoints();
	
							canvas.winLose.style.visibility = 'visible';
							canvas.winLose.innerHTML = 'You win!';
	
							game.opponents.forEach(function(opp){
								opp.gunmanSayDomElement.innerHTML = 'you win!';
							});
	
							clearTimeout(gamePlay.timer);
							canvas.domElement.removeEventListener('click', gamePlay.shootPhase, true);
							sounds.playNewStopOld('youWon');
	
							gamePlay.turn += 1;
							setTimeout(newRound , 2500);
						}
						else {
							gamePlay.timer = setTimeout(tick, 10);
						}
					}
			}, 10);
		},
	
		gameDurationMs : 0,
	
		shootPhase : function (e) {
			e.stopPropagation();
			sounds.playOnTop('shoot');
	
			if (!gamePlay.gameDurationMs) {
				gamePlay.foul();
			} else if (e.target.id == "head" || e.target.id == "arm" || e.target.id == "belly" || e.target.id == "leg") {
	
				var killingTime = gamePlay.gameDurationMs + 10;
				var killedBodyPart = e.target.id;
				var killedDOMEl = e.target.offsetParent;
				var killedOpponent = game.getOpponentById(killedDOMEl.id);
				points.updateBodyParts(killedBodyPart);
	
	
	
				points.killedTime.push(killedOpponent.skill - killingTime);
	
	
				killedOpponent.gunmanSayDomElement.innerHTML = killedBodyPart + ' ' + points[killedBodyPart] + ' pts';
	
				console.log('you hit ' + killedBodyPart + ' ' + points[killedBodyPart] + 'pts');
	
				var infoEl = document.querySelector('#stats-' + killedDOMEl.id);
				infoEl.innerHTML = '<strike>' + infoEl.innerHTML + '</strike>' + '<br>' + killingTime / 1000;
	
				game.kill(killedOpponent);
				killedOpponent.fall();
	
				if (game.opponents.length === 0) {
					var endTime = Date.now();
				}
			 }
		},
	
		foul : function(){
			console.log('foul');
			clearTimeout(gamePlay.startTimer);
			canvas.foul();
	
	
			canvas.winLose.style.visibility = 'visible';
			canvas.winLose.innerHTML = 'Foul';
	
	
	
			canvas.domElement.removeEventListener('click', gamePlay.shootPhase, true);
			game.opponents[game.opponents.length - 1].domElement.removeEventListener('transitionend', startGame);
	
			game.opponents.forEach(function(opp){
				opp.domElement.style.left = opp.startPosition;
				game.opponentsWaitThenDo(10, 'walkOut', 'foul');
			});
			gamePlay.foulState = true;
		},
	
		foulState : false
	};
	
	var points = {
		myStatsDivElement : document.querySelector('#myStats'),
		pointsDomElement : document.querySelector('#points'),
		amount: 0,
	
		head: 20,
		belly: 15,
		arm: 5,
		leg: 5,
	
		updateBodyParts: function(part){
			points.amount+= points[part];
			points.printPoints();
		},
	
	
		killedTime : [],
	
		resolveKilledTimePoints: function(){
	
			points.killedTime.forEach(function(pts){
				var ppp = Math.round(pts / 50);
				points.amount += ppp;
				console.log('time pts ' + ppp + 'pts');
			});
			points.printPoints();
	
	
	
		},
	
		printPoints: function(){
			points.pointsDomElement.innerHTML = 'points ' + points.amount;
		}
	
	};
	
	
	
	
	
	Opponent.prototype = {
		init : function(){
			this.domElement = document.createElement('div');
			this.domElement.id = 'outlaw-' + (game.opponents.length);
			this.domElement.classList.add('shooter');
	
			this.startPosition = ( game.randomTrueOrFalse() ) ?
					this.domElement.style.left = "-7%" :
					this.domElement.style.left = "107%";
	
			canvas.domElement.appendChild(this.domElement);
	
			this.gunmanSayDomElement = document.createElement('div');
			this.gunmanSayDomElement.className = 'prompts';
	
			this.domElement.appendChild(this.gunmanSayDomElement);
	
	
		},
	
		switchClass : function (newClass){
			this.domElement.className = 'shooter';
			this.domElement.classList.add(newClass);
		},
	
		addSVG : function (){
			this.svgIcon = document.createElement('div');
			this.svgIcon.innerHTML = __webpack_require__(24)("./" + this.name + '_inlineSVG.html');
	
			this.domElement.appendChild(this.svgIcon);
		},
	
		walkIn : function(){
			this.domElement.style.left = this.position;
			this.switchClass('icon-' + this.name + '-walk');
		},
	
		walkOut : function(){
			this.domElement.style.left = this.startPosition;
			this.switchClass('icon-' + this.name + '-walk');
			this.gunmanSayDomElement.style.visibility = 'hidden';
		},
	
		stand : function(){
			this.switchClass('icon-' + this.name + '-stand');
		},
	
		unholster : function(){
			this.switchClass('icon-' + this.name + '-unholster');
		},
	
		aim : function(){
			this.switchClass('icon-' + this.name + '-aim');
			this.addSVG();
			this.gunmanSayDomElement.innerHTML = 'fire!';
			this.gunmanSayDomElement.style.visibility = 'visible';
	
		},
	
		fall : function(){
	
	
	
			this.domElement.removeChild(this.svgIcon);
			this.switchClass('icon-' + this.name + '-fall');
			hatDomElement = document.createElement('div');
			hatDomElement.className = 'hat icon-' + this.name + '-hat';
			hatDomElement.style.top = "25%";
	
			if ( game.randomTrueOrFalse() ) {
				hatDomElement.style.animationName = 'flying-hat-right';
			} else {
				hatDomElement.style.animationName = 'flying-hat-left';
			}
			this.domElement.appendChild(hatDomElement);
			sounds.playOnTop('guyHitFloor');
		},
	
		talk : function(){
			this.switchClass('icon-' + this.name + '-talk');
		},
	
	
	};
	
	function Opponent(name, position){
		this.name = name;
		this.skill = game.defineGunmanSkill();
		this.position = position;
		this.init();
	
	}
	
	
	
	function clearOldData(){
	
		points.killedTime = [];
	
		gamePlay.gameDurationMs = 0;
		points.myStatsDivElement.innerHTML = 'time 00.00';
	
		game.removeAllChildren(document.querySelector('#opponentStats'));
	
		canvas.winLose.style.visibility = 'hidden';
	
	
	
		var canvasChildren = canvas.domElement.children;
		for(var ind = canvasChildren.length-1; ind > 0; ind-- ){
			if (canvasChildren[ind].id.substring(0,6) == 'outlaw' ){
				canvas.domElement.removeChild(canvasChildren[ind]);
			}
		}
	}
	
	
	function newRound(){
		console.log('---------------------------');
		console.log('game turn', gamePlay.turn % game.names.length + 1);
	
	
		clearOldData();
	
	
	
	
	
		game.spawnOpponents(gamePlay.turn % game.names.length + 1);
		game.showStats();
	
		// each opponent perform action after the specified delay in ms
		// and the last arg is music to play along
	
		game.opponentsWaitThenDo(10, 'walkIn', 'oneOutlawIntro');
		game.opponentsWaitThenDo(3600, 'stand', 'prepareToShoot');
	
		// listen to the last opponent trasition (walk 3.5sec) to end
		game.opponents[game.opponents.length - 1].domElement.addEventListener('transitionend', startGame);
	}
	
	function startGame(){
		//listen to shoot clik
		canvas.domElement.addEventListener('click', gamePlay.shootPhase, true);
	
		// pause before shooting
		setTimeout(function () {
	
			if (!gamePlay.foulState) {		//checks if there is no foul
				gamePlay.startTimer();
				game.opponentsWaitThenDo(1, 'unholster');
				game.opponentsWaitThenDo(150, 'aim', 'fire');
			}
		}, game.defineGunmanSkill() * 2);
	
	}
	
	newRound();


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(2);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(6)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../../node_modules/css-loader/index.js!./../../node_modules/sass-loader/index.js!./mainStyles.scss", function() {
				var newContent = require("!!./../../../../../node_modules/css-loader/index.js!./../../node_modules/sass-loader/index.js!./mainStyles.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports
	
	
	// module
	exports.push([module.id, "@font-face {\n  font-family: homestead;\n  src: url(" + __webpack_require__(4) + "); }\n\n@font-face {\n  font-family: homesteadInline;\n  src: url(" + __webpack_require__(5) + "); }\n\nbody {\n  background-color: black; }\n\n.shooter {\n  position: absolute;\n  top: 80%;\n  transform: translate(-50%, -100%);\n  z-index: 5000;\n  transition: left 3.5s ease-out; }\n\n.hat {\n  position: fixed;\n  transform: translate(-50%, -50%);\n  left: 50%;\n  animation: 1s forwards ease-in;\n  z-index: -5000; }\n\n@keyframes flying-hat-right {\n  0% {\n    transform: rotate(0deg); }\n  50% {\n    top: -100%; }\n  100% {\n    left: 300%;\n    transform: rotate(1080deg); } }\n\n@keyframes flying-hat-left {\n  0% {\n    transform: rotate(0deg); }\n  50% {\n    top: -100%; }\n  100% {\n    left: -300%;\n    transform: rotate(1080deg); } }\n\nsvg {\n  fill-opacity: 0; }\n  svg #head {\n    fill: red; }\n  svg #arm {\n    fill: green; }\n  svg #belly {\n    fill: yellow; }\n  svg #leg {\n    fill: navy; }\n", ""]);
	
	// exports


/***/ },
/* 3 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "./dist/images/homestead.ttf?d5eabe909d080bbee3d3bbfe602bdeb4";

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "./dist/images/homestead-inline.ttf?156acfeb4e76cbc9dc1dca2e0e39f0be";

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(8);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(6)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../../node_modules/css-loader/index.js!./sprite-base.css", function() {
				var newContent = require("!!./../../../../../node_modules/css-loader/index.js!./sprite-base.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports
	
	
	// module
	exports.push([module.id, ".icon-sheffer-hat {\n  display: inline-block;\n  background-position: 0px 0px;\n  width: 42px;\n  height: 36px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-randy-hat {\n  display: inline-block;\n  background-position: -42px 0px;\n  width: 52px;\n  height: 40px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-bob-aim {\n  display: inline-block;\n  background-position: -94px 0px;\n  width: 52px;\n  height: 152px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-bob-talk-a {\n  display: inline-block;\n  background-position: -146px 0px;\n  width: 52px;\n  height: 152px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-bob-talk-b {\n  display: inline-block;\n  background-position: -198px 0px;\n  width: 52px;\n  height: 152px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-sheffer-stand {\n  display: inline-block;\n  background-position: -250px 0px;\n  width: 56px;\n  height: 164px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-sheffer-walk-b {\n  display: inline-block;\n  background-position: -306px 0px;\n  width: 56px;\n  height: 164px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-sheffer-walk-a {\n  display: inline-block;\n  background-position: -362px 0px;\n  width: 56px;\n  height: 164px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-billy-hat {\n  display: inline-block;\n  background-position: -418px 0px;\n  width: 56px;\n  height: 22px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-sheffer-talk-b {\n  display: inline-block;\n  background-position: -474px 0px;\n  width: 60px;\n  height: 164px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-sheffer-talk-a {\n  display: inline-block;\n  background-position: -534px 0px;\n  width: 60px;\n  height: 164px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-sheffer-aim {\n  display: inline-block;\n  background-position: -594px 0px;\n  width: 60px;\n  height: 164px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-sheffer-unholster {\n  display: inline-block;\n  background-position: -654px 0px;\n  width: 60px;\n  height: 164px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-bob-stand {\n  display: inline-block;\n  background-position: -714px 0px;\n  width: 68px;\n  height: 154px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-bob-fall {\n  display: inline-block;\n  background-position: -782px 0px;\n  width: 68px;\n  height: 154px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-mark-hat {\n  display: inline-block;\n  background-position: -850px 0px;\n  width: 68px;\n  height: 52px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-sheffer-fall {\n  display: inline-block;\n  background-position: -918px 0px;\n  width: 68px;\n  height: 164px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-billy-talk-b {\n  display: inline-block;\n  background-position: -986px 0px;\n  width: 72px;\n  height: 126px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-billy-unholster {\n  display: inline-block;\n  background-position: -1058px 0px;\n  width: 72px;\n  height: 130px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-billy-walk-a {\n  display: inline-block;\n  background-position: -1130px 0px;\n  width: 72px;\n  height: 132px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-billy-walk-b {\n  display: inline-block;\n  background-position: -1202px 0px;\n  width: 72px;\n  height: 132px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-billy-aim {\n  display: inline-block;\n  background-position: -1274px 0px;\n  width: 72px;\n  height: 126px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-billy-fall {\n  display: inline-block;\n  background-position: -1346px 0px;\n  width: 72px;\n  height: 74px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-billy-talk-a {\n  display: inline-block;\n  background-position: -1418px 0px;\n  width: 72px;\n  height: 126px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-randy-walk-b {\n  display: inline-block;\n  background-position: -1490px 0px;\n  width: 74px;\n  height: 150px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-billy-stand {\n  display: inline-block;\n  background-position: -1564px 0px;\n  width: 76px;\n  height: 132px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-randy-fall {\n  display: inline-block;\n  background-position: -1640px 0px;\n  width: 76px;\n  height: 58px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-randy-stand {\n  display: inline-block;\n  background-position: -1716px 0px;\n  width: 76px;\n  height: 150px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-randy-talk-a {\n  display: inline-block;\n  background-position: -1792px 0px;\n  width: 76px;\n  height: 150px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-randy-talk-b {\n  display: inline-block;\n  background-position: -1868px 0px;\n  width: 76px;\n  height: 150px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-randy-aim {\n  display: inline-block;\n  background-position: -1944px 0px;\n  width: 76px;\n  height: 150px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-randy-walk-a {\n  display: inline-block;\n  background-position: -2020px 0px;\n  width: 76px;\n  height: 150px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-mark-fall {\n  display: inline-block;\n  background-position: -2096px 0px;\n  width: 76px;\n  height: 54px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-randy-unholster {\n  display: inline-block;\n  background-position: -2172px 0px;\n  width: 76px;\n  height: 150px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-bob-walk-b {\n  display: inline-block;\n  background-position: -2248px 0px;\n  width: 80px;\n  height: 150px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-bob-walk-a {\n  display: inline-block;\n  background-position: -2328px 0px;\n  width: 80px;\n  height: 150px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-bob-unholster {\n  display: inline-block;\n  background-position: -2408px 0px;\n  width: 80px;\n  height: 148px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-mark-unholster {\n  display: inline-block;\n  background-position: -2488px 0px;\n  width: 82px;\n  height: 146px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-mark-aim {\n  display: inline-block;\n  background-position: -2570px 0px;\n  width: 82px;\n  height: 146px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-mark-walk-a {\n  display: inline-block;\n  background-position: -2652px 0px;\n  width: 82px;\n  height: 146px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-mark-walk-b {\n  display: inline-block;\n  background-position: -2734px 0px;\n  width: 82px;\n  height: 146px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-mark-talk-a {\n  display: inline-block;\n  background-position: -2816px 0px;\n  width: 82px;\n  height: 146px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-mark-stand {\n  display: inline-block;\n  background-position: -2898px 0px;\n  width: 82px;\n  height: 146px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n.icon-mark-talk-b {\n  display: inline-block;\n  background-position: -2980px 0px;\n  width: 82px;\n  height: 146px;\n  background-image: url(" + __webpack_require__(9) + ");\n}\n\n", ""]);
	
	// exports


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "./dist/images/sprite-base.png?9a03e29737484cfcbbcd6163cbdd23df";

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(11);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(6)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../../node_modules/css-loader/index.js!./animation.css", function() {
				var newContent = require("!!./../../../../../node_modules/css-loader/index.js!./animation.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports
	
	
	// module
	exports.push([module.id, "\n\n\n.icon-bob-talk {\n    display: inline-block;\n    background-image: url(" + __webpack_require__(9) + ");\n    width: 52px;\n    height: 152px;\n\tanimation: bob-talk 0.5s steps(2) infinite;\n}\n\n@keyframes bob-talk{\n\t0% {\n        background-position: -146px 0px;\n    }\n\t100% {\n        background-position: -250px 0px;\n    }\n}\n\n.icon-sheffer-walk{\n    display: inline-block;\n    background-image: url(" + __webpack_require__(9) + ");\n    width: 56px;\n    height: 164px;\n\tanimation: sheffer-walk 0.35s steps(2) infinite;\n}\n\n@keyframes sheffer-walk{\n\t0% {\n        background-position: -306px 0px;\n    }\n\t100% {\n        background-position: -418px 0px;\n    }\n}\n\n\n.icon-sheffer-talk {\n    display: inline-block;\n    background-image: url(" + __webpack_require__(9) + ");\n    width: 60px;\n    height: 164px;\n\tanimation: sheffer-talk 0.5s steps(2) infinite;\n}\n\n@keyframes sheffer-talk{\n\t0% {\n        background-position: -474px 0px;\n    }\n\t100% {\n        background-position: -594px 0px;\n    }\n}\n\n\n.icon-billy-talk {\n    display: inline-block;\n    background-image: url(" + __webpack_require__(9) + ");\n    width: 72px;\n    height: 126px;\n\tanimation: billy-talk 0.5s steps(2) infinite;\n}\n\n@keyframes billy-talk{\n\t0% {\n        background-position: -986px 0px;\n    }\n\t100% {\n        background-position: -1850px 0px;\n\n    }\n}\n\n\n\n.icon-billy-walk{\n    display: inline-block;\n    background-image: url(" + __webpack_require__(9) + ");\n    width: 72px;\n    height: 132px;\n\tanimation: billy-walk 0.35s steps(2) infinite;\n}\n\n@keyframes billy-walk{\n\t0% {\n        background-position: -1130px 0px;\n    }\n\t100% {\n        background-position: -1274px 0px;\n    }\n}\n\n.icon-billy-fall {\n    background-image: url(" + __webpack_require__(9) + ");\n    background-position: -1346px 0px;\n\twidth: 72px;\n\theight: 74px;\n\tanimation: billy-fall 0.7s cubic-bezier(.31,.07,.2,.72);\n}\n@keyframes billy-fall {\n\t\t0% {top: 80%;}\n\n\t\t25% {top: 70%;}\n\t\t39% {top: 80%;}\n\n\t\t65% {top: 76%;}\n\t\t73% {top: 80%;}\n\n\t\t95% {top: 78%;}\n\n\t\t100% {top: 80%;}\n}\n\n\n.icon-randy-walk{\n    display: inline-block;\n    background-image: url(" + __webpack_require__(9) + ");\n\tanimation: randy-walk 0.35s steps(2) infinite;\n}\n\n@keyframes randy-walk{\n\t0% {\n        background-position: -2020px 0px;\n        width: 76px;\n        height: 150px;\n    }\n\t100% {\n        background-position: calc(-986px + 24px) 0px;\n        width: 74px;\n        height: 150px;\n    }\n}\n\n\n.icon-randy-fall {\n    background-image: url(" + __webpack_require__(9) + ");\n    background-position: -1640px 0px;\n    width: 76px;\n    height: 58px;\n\tanimation: billy-fall 0.7s cubic-bezier(.31,.07,.2,.72);\n}\n@keyframes billy-fall {\n\t\t0% {top: 80%;}\n\n\t\t25% {top: 70%;}\n\t\t39% {top: 80%;}\n\n\t\t65% {top: 76%;}\n\t\t73% {top: 80%;}\n\n\t\t95% {top: 78%;}\n\n\t\t100% {top: 80%;}\n}\n\n\n\n.icon-randy-talk{\n    display: inline-block;\n    background-image: url(" + __webpack_require__(9) + ");\n    width: 76px;\n    height: 150px;\n\tanimation: randy-talk 0.5s steps(2) infinite;\n}\n\n@keyframes randy-talk{\n\t0% {\n        background-position: -1792px 0px;\n    }\n\t100% {\n        background-position: -1944px 0px;\n    }\n}\n\n\n\n.icon-mark-fall {\n    background-image: url(" + __webpack_require__(9) + ");\n    background-position: -2096px 0px;\n    width: 76px;\n    height: 54px;\n\tanimation: billy-fall 0.7s cubic-bezier(.31,.07,.2,.72);\n}\n@keyframes billy-fall {\n\t\t0% {top: 80%;}\n\n\t\t25% {top: 70%;}\n\t\t39% {top: 80%;}\n\n\t\t65% {top: 76%;}\n\t\t73% {top: 80%;}\n\n\t\t95% {top: 78%;}\n\n\t\t100% {top: 80%;}\n}\n\n\n\n.icon-bob-walk{\n    display: inline-block;\n    width: 80px;\n    height: 150px;\n    background-image: url(" + __webpack_require__(9) + ");\n\tanimation: bob-walk 0.35s steps(2) infinite;\n}\n\n@keyframes bob-walk{\n\t0% {\n        background-position: -2328px 0px;\n    }\n\t100% {\n        background-position: calc(-2172px + 4px) 0px;\n    }\n}\n\n\n.icon-mark-walk{\n    display: inline-block;\n    width: 82px;\n    height: 146px;\n    background-image: url(" + __webpack_require__(9) + ");\n\tanimation: mark-walk 0.35s steps(2) infinite;\n}\n\n@keyframes mark-walk{\n\t0% {\n        background-position: -2652px 0px;\n    }\n\t100% {\n        background-position: -2816px 0px;\n    }\n}\n\n\n.icon-mark-talk{\n    display: inline-block;\n    background-image: url(" + __webpack_require__(9) + ");\n    width: 82px;\n    height: 146px;\n\tanimation: mark-talk 0.5s steps(2) infinite;\n}\n\n@keyframes mark-talk{\n\t0% {\n        background-position: -2816px 0px;\n    }\n\t100% {\n        background-position: -3144px 0px;\n    }\n}\n", ""]);
	
	// exports


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(13);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(6)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../../node_modules/css-loader/index.js!./../../node_modules/sass-loader/index.js!./canvas.scss", function() {
				var newContent = require("!!./../../../../../node_modules/css-loader/index.js!./../../node_modules/sass-loader/index.js!./canvas.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports
	
	
	// module
	exports.push([module.id, ".canvas {\n  margin: auto;\n  position: relative;\n  width: calc(800px * 0.75);\n  height: calc(600px * 0.85);\n  overflow: hidden;\n  outline: 1px solid mistyrose;\n  background-position: center center;\n  background-repeat: no-repeat;\n  background-size: contain; }\n\n.canvas-light {\n  background-image: url(" + __webpack_require__(14) + "); }\n\n.canvas-dark {\n  background-image: url(" + __webpack_require__(15) + "); }\n\n.canvas-red {\n  background-image: url(" + __webpack_require__(16) + "); }\n\n.canvas-white {\n  background-color: white; }\n\n.canvas-foul {\n  background-image: url(" + __webpack_require__(17) + "); }\n", ""]);
	
	// exports


/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAHgCAYAAABdBwn1AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gUdAQ4wN+ug2AAAGMhJREFUeNrt3bFu29iaB3B64SKPkAUmhYsUUwxwkWo2SBOlSm51y8UiRerMExiICwfIE0xqFymm3GqcapxiB7O3MhaYYgoXKWaA+BFu5y2sIx1Hx+SRSB2TR79fI4OiKIoiafz5fUfcuzpurhoAAIAC/s0mAAAABBAAAEAAAQAAEEAAAAABBAAAQAABAAAEEAAAQAABAAAQQAAAAAEEAABAAAEAAAQQAABAAAEAABBAAAAAAQQAAEAAAQAABBAAAEAAAQAAEEAAAAABBAAAQAABAAAEEAAAQAABAAAQQAAAAAEEAABAAAEAAAQQAABAAAEAABBAAAAAAQQAAEAAAQAABBAAAAABBAAAEEAAAAABBAAAQAABAAAEEAAAAAEEAAAQQAAAAAEEAABAAAEAAAQQAAAAAQQAABBAAAAAAQQAAEAAAQAABBAAAAABBAAAEEAAAAABBAAAQAABAAAEEAAAAAEEAAAQQAAAAAEEAABAAAEAAAQQAAAAAQQAABBAAAAABBAAAEAAAQAABBAAAAABBAAAEEAAAAAEEAAAQAABAAAEEAAAAAEEAAAQQAAAAAQQAABAAAEAAAQQAAAAAQQAABBAAAAABBAAAEAAAQAABBAAAAABBAAAEEAAAAAEEAAAYGT2bQIAgOnZO8qb7+rYtmJcVEAAAIBiVEAAACZkUflIVTaeLv+cPZldz793tpimGsIYqIAAAAACCAAAUB8tWAAAI3djwHlb69Wn5aSz5rr1anY1Wy5n3o6lFYu7pAICAAAUowICAFCjUA15spwUqiEGpnOXVEAAAAABBAAAqI8WLACAkUre8yMx4LzN2a/LdqtwbxC4SyogAACAAAIAAAggAAAAAggAACCAAAAACCAAAIAAAgAACCAAAAACCAAAIIAAAAAIIAAAgAACAAAIIAAAAAIIAAAggAAAAAggAACAAAIAAAggAAAAAggAACCAAAAACCAAAIAAAgAACCAAAAACCAAAIIAAAAAIIAAAgAACAAAIIAAAAAIIAAAggAAAAAggAADAyO3bBLCevaP1X3N1vPra1LRNlzvU+nV93rb5AAByqIAAAAACCAAAUB8tWJAptCL9/P1y2ud/3T7/wb3V13b58W958/3wf9tZv7jFajHtH+2fQ1sWALAOFRAAAKAYFRBocWMA9rwScPpl/eVc/fHL9fK+fTbIeoUqx1Drd1efAwDYPSogAACAAAIAANRHCxZMWO6g9S6p1qqhlg0AEFMBAQAAilEBARZUPQCAbVMBAQAABBAAAKA+WrBgS+K7kJ++ejaJ9Xt9sJz2/vN6y7txTxJ3RwcAbqECAgAAFKMCAgXFg7xDxSDc1bxpblYlxiz8bG/TLH+6N9yJPf5sKiEAwNdUQAAAAAEEAACojxYsuCOhZen0y/qvHVOr1qL16t2yLav572e+YGDy4h/XaD0PajeFtaiAAAAAxaiAUL3cK1ix1NWsdX+WNpaqWPRZHgAF/m+kKhtPl3/Onsyu5987a/3/AdykAgIAAAggAABAfbRgUa1177NxcG/1tfF9OwCo/39G0zTtrVeflpPOmuvWq9nVbLmceTuWViy4nQoIAABQjAoIVYmvYPX5mVua5vWBbQDQKlRDniwnhWqIgelwOxUQAABAAAEAAOqjBQsA2FnJe34kBpy3Oft12W4V7g0C3E4FBAAAEEAAAAABBAAAQAABAADGzyB0mIvvkh7unt5253QAANanAgIAABSjAgKVeP/5+vHgnm0BAIyXCggAACCAAAAA9dGCBZV4fXD9ePpl/dcabF/W4s7Lkatj2wWA3aACAgAAFKMCAgklKgKhYhEGj49t3cN6vf7pFzvEQBaVj6jaMXszu35u72wxTTUEgJqpgAAAAAIIAABQHy1YAFt0Y8B5orXq7Nfr1qvZ1Wz5mnk7llYsAGqkAgIAABSjAgITFO52PtSAc3dPH15qwHnzdP74KZo2//usWQ5CD9UQA9MBqJEKCAAAIIAAAAACCAAAgAACAAAIIAAAAAIIAAAggAAAABVzHxCq9f6zbQAAMDYqIAAAQDEqIFTr9cH14+mX5bSh7hw+hKErNCo+AMAUqIAAAAACCAAAUB8tWHBHQovYJq1TqVayoZfHdOwdrU67OrZdgPGdm1Kcr3aPCggAAFCMCgijk3vFJNZ29WSoq/t9Kgwp2xo0fnBvmM8ePi8TOFai/X/2Znb93N5Z1vEBUOLctPA0Ol89cb7aVSogAACAAAIAANRHCxajEUq2P3+/nNbWQhS3GoXX/vg325HdOE6apkm2N5z9et3KMLuaLV8zb2/Q2gDc1blp0Xr1KTpfNc5Xu0oFBAAAKEYFhDsVXzG5+sf1Y3zn8rsSqitDDWAfenns8LESXxVMXFEMf4cri02zvLpooCcwKuHc9aRxvtoxKiAAAIAAAgAA1EcLFjCI9//5zEYA2DHZ7aEtwo9nNM3y3iDUTQUEAAAQQAAAAAEEAABAAAEAAMbPIHQmK76nRrh7+i7fZ+P954JvdmjAOQCwGRUQAACgGBUQqjV0RaBohWEDrw+uH+M7yZeoCIX3e/3TL4tpP3yrQgIApKmAAAAAAggAAFAfLVhUK7QkbdI6lWpdGnp5AOyGxd3CgaZpVEAAAICCVECoQokKw9CD0PtUVEqsHwCRT/PHp4lpkbO3Z9d/HA/8/nEV5X98HUybCggAACCAAAAA9dGCBQDQR9yK9dTmgC4qIAAAQDEqIJBwcO/6caw/nzv29QPYWZ9sAuiiAgIAAAggAABAfbRgAQDkSg0413YFa1EBAQAAilEBAYBd8mZE6/J2pNso867nyfmATiogAACAAAIAANRHCxaj8f6zbQCwtjc7tu4Dt21dHV8/7h1FE+fTsgecG4QOa1EBAQAAilEBYTReH1w/nn5ZTutzp++xV1RUfIAsb2yC7O3RozoSKiFNE1VDomkGnMNwVEAAAAABBAAAqI8WLKoVWro2aXXq0/pVy/oBd0C71fDbb4O2rOTA9OC4vs2W/JywRSogAABAMSogjM5QV/eHHuQ99CD50Xv3S95zr57ZaUs4tgmqo9pxd9s5sypylTju7qxacDzRZUOCCggAACCAAAAA9dGCBazvUNvVNp3tnV3/kWqLiO9B4O7L06HdavzfR4+2rG0q0vI19L1NnJvooAICAAAUowJCFQ7uXT/uys/T7trn3Vmpq5KuLI6XKkfd39/bij+78wqFqYAAAAACCAAAUB8tWABjpS1i/LRd7d53/damyOZHM7iFCggAAFCMCghATcIVx/hq4xObZRCqHdy2H0y9KvJ0S8v9lPm+zlc7RwUEAAAQQAAAgPpowYJM7z/bBhS2SVvEvJVh9ma2mBTurF76Ds7V0HrFOvvIFNuxSg4Qf+p8hQoIAABQkAoIozH2CsPrg+vH0y/LaX3uRF5bReX01TM78dA2uCoZriSGq4hN40riRlQ96LvvTKkS8rTge31yvkIFBAAAEEAAAIAaacFiNEKL0yatSX1aoXzefl78+/Vj3JpGP7Or1baEXGdHBnD2ovWKbexLY2/HKjkI/cj5ChUQAACgIBUQ7sTe/ArIz98vp4Ur6Af3xrnOqSv8fdZ1jJ/3xmfsMag8fK970ZUuV7j6sf22SNWDUvvYWCshR85llKUCAgAACCAAAEB9tGBRTNyOE7deBS9OfmmaJn0/iXjQ9eufbp/P8sa1vPh7Dt+/8jujofWKu9znRtSO5bxMaSogAABAMXtXx82VzcBWd7LEgPOUcFV9qEHZljeu5QV//+fy75qvui0qfvFnDHcbTv3kZXQn4tkTdwcuQgWEu5RZAck+lzi/MCEqIAAAgAACAADUxyB0tmKTAedtrT5h/vg1qWkxy7v75aWmXf2xnLb37Xya8j+laLtibPviW5uC3aMCAgAAFGMQOsPuUC0DzuOfbk1J/Zxr20DoeHnh+a6fh7W8u1te6jWhQhIqIU1TTzXEIPSRUflgCt72OJc4vzAhKiAAAIAAAgAA1EcLFv13oo4B59A07XdWjwer1zIwXQvWyGjBYgq0YLEjVEAAAIBi/AwvG2sbcN71E69t+rzW8sa1vHgQettr4+fC/hRX1lydYyOqHkx1n/XTvFROBQQAABBAAACA+mjBYi1xW0zw938mZvy2R+vPt8+GXWnLG9fyeux3WrEAYPpUQAAAgGL23/+vjUC+H5/bBtydXT5fOVdv4IVNAM4vjJEKCAAAIIAAAAD12X9030YAGDvnasD5hVqogAAAAMXsn1/aCABj51wNOL9QCxUQAABAAAEAAOqz/1//4YfSAYb2w8fTQZfnXA3OJdvi/EJpKiAAAEAx+398PrUVAEbOuRpwfqEWKiAAAIAAAgAACCAAAAACCAAAMH77NgHA+LlT8fY8um8bAJSkAgIAAAggAABAfbRgwQ54fLL99/jtle2M48PxAdBNBQQAAChGBQQq03k198/5Y2q+o+jv45bnj1enxe/rau9yGzw+Wv+1Z81Z0zRN8+Pz7a/nDx/z5iuxLiV0fl7HB+ucT32nsBEVEAAAQAABAADqs/fbq+bKZqhXqny8a6XiXdkGyVaBtnaSoR3Z16a074Zlv3j+Imv+04+nk/5eHR/1nU935fhYfM64te/p/PFTx7Svn2uaZvZk1jRN05ztnTlXc2dUQAAAgGIMQq9UuGJy/5vlLX4fffdo/txp1jKmfkWk7QpW1dsgvkr2IDGtTfx5U1eFL+aPDxPTEgNvGdfxG18xzr2ym5o/rIPjY3eOjzGdTx0fMH0qIAAAgAACAADURwtWpRb3IDi5XEw7b85X5gsl7FC+jsWl7KmUkuMSevhs57+vfu7c8voUt0HnvQrC5zhJTDuMpr1LzBdaSy4S07Rdjfb4Te33qeMiJbXsSXN8TP58OpXjY0r3fjm/dN6lLBUQAACgGD/Du0Pa7ugaD+YLLv9aXhKp5mc3Wz5vyti3QfIzpga7/hlNC1dx3yWmpaTme9ixYn6Sd1THb2q+8HzusZC60jv2n+Z1fOzO+TSsX7zc1GD1KR4fJX6G98fnzrGUpQICAAAIIAAAQH0MQt8hbSXgeDBfzvw1ft51lzE6oTyfGmQbt5A8bJmWkpqva5Btal248+M3NV9XK0pba4njY3eOj7GfT1PLTg1Wzz0+2l5b5fEBhamAAAAAxRiEDhOWPcj2eKA3DFd2P0TTXiamJbgaOPH9aoLfpeODGo4Pg9CpkQoIAAAggAAAAPUxCB0mLPWb9zcGwDaJaW2DYi863jA1GPdD+3ox7f3K8eH4wPcHQ1MBAQAAijEIHSrRNTByW1wNxPHh+GB6+7CB59wlFRAAAEAAAQAA6qMFCwAAKEYFBAAAEEAAAAABBAAAQAABAAAEEAAAAAEEAAAQQAAAAAEEAABAAAEAAAQQAAAAAQQAABBAAAAAAQQAAEAAAQAApmjfJmAsHp9sZ7m/vbJtAfC/1P9VxkIFBAAAKGbvt1fNlc1ACZ1XZY4T044GmO+o/W1dyQEY6DzuvDqu7+PP+eNJx//Ntv+rx+3/a33XbEIFBAAAEEAAAID6aMFi6xYl4j87ZnwwfzzOXHBu+TglUVJWRgaqONdGhjqvhWW/eP4ia/7Tj6dZ67DNdd6177q13WpoWrHoSQUEAAAoxs/wshU3rs6EqzIPommpikWqQtJ2JaerUpIahJ45MB1gaufb+9/cX0x79N2j+XOnWctIXb2Oz+O5lY/U/GEd4vdoq6j0WeedE/8fXLeL4FXH/9qL+ePDxLSOgenQRQUEAAAQQAAAgPpowWL7csvCuQPnXq05f1e71wNfETBdoRXp8cnlYtp5c74yX2jRCu1ZsVTbU9wedf77eda6pJa9fI/VdUktN7fdK17nnW3H6voxltT/yzDtMJr2LjFfaL26SEzTdkVPKiAAAEAxfoaXQS2ucLVdiWmaYX4msGt5uZWSMF9UCTG4EajhXJwa+B0PVg8u/7pcmRbPF55PvTYlVQmJf5q3Te57xOu8C+fs5E/vpgaDxxX+UOV4l5iWkprvYceK+UleNqACAgAACCAAAEB9tGDR242ycO4guK+fu+35IeS+RzzfvB1LGRmo+pzd3H6ui+dbDnRfnS91/5FYaL3KPZ8+zvxfsGvn5+T/2tQg9NSg8dS0lNzXdtxfy/9OuqiAAAAAxaiAsLFeA87X/SndPlJXYuJBeKkrOom7t7uiA9Dyv+AWzp1b3M6pQejHA71hqHx8iKa9TEzznbMBFRAAAEAAAQAA6uNO6KwlexDcJq1VbXds7Zr29XPx8ye3PP+1uGzt7ugwnnPNgLSG2KY1bOfF8XGRmDF30PhFxxumBqt/8P0zDBUQAACgGIPQWUvnILiUcJXlXcd8hwPMFw8uf5f5oVJ3e3Vn1/bvvLF92PJ+lTqvHA0w35H9mN05Lw/N8cFQVEAAAAABBAAAqI9B6GyurfUqHtwWWqEOO6alDNFu1fW+D1s+29G4v4LcOxr3WfaL5y8y5z/NWodtrnPN30ctFtvoz44ZHyTOM23nnKOO+Y7yzmWPj3xvjJ/9k6lTAQEAAIpRAaG/riuPhwO8x2GB13R9jhEJV5Hvf3N/Me3Rd4/mz51mLSN1BS2+gp9b+UjNH9Yh9bORqeX2Weeav49a3KgMhcrHg47jLVUhaRt423XMtv1s+FEDQEEqIAAAgAACAADURwsWm8ttWwiDvOOB6Yct8x12vHbd5XXNN0GhXefxyeVi2nlzvjJfaAkK7UCxVGtQ3B51/vt51rqklr18j9V1SS136IHuU/8+qh5gmhpcnpJ7n4NXa87f1e71wKkdYNtUQAAAgGLcCZ213BhM+nL++HCDBV30eG2f5eXON8E7oYfvJjXwOx4cHVz+dbkyLZ4vPJ96bUrqqv7px7wB2LnvEa/zVL6P3M87pc+29jZIVR3izzjEXZ27lpdbKQnzPWiq+z4AxkIFBAAAEEAAAID6aMEiy6KV4mU0sW2AeOwi47nbnk/N12Qur1nzfVPTolasKbdh5N6hO55vObB6db7U/S5iofUqd5s9zmzBccf0iX22ttartjap254fQu57xPM9qOs7ArhrKiAAAEAxKiCsJTkIPVdciQjVhg8bLO9D5vxt86Xe98PqbK54ZuwHje1GzwHn6/6Ubh+pfTP109/xD1Ek7t5uHwfYnAoIAAAggAAAAPXRgsXGHp/U9Xm0VECPc0BovTpKTOuSasHqM+3r57qeT7VgxY6cLwCGpAICAAAUowICwEaSVdCuqkf4AYp3HfMdDjBfXNl4l/mhwmviSogKCLt8TDf2f4anAgIAAAggAABAffZtAgB6a2u9uoj+Dq1Qhx3TUoZot+p634ctn+1o+5sx1QKj3YVt7xth2S+ev8ic/9T+SS8qIAAAQDEqIAAMp+tneA8HeI/DAq/Z5OeEe2i7Ah1fbW7jSnSdwr5x/5v7i2mPvnvUe9+IKyq5lY/U/GEd7H+sQwUEAAAQQAAAgPpowQKgv9wB2mGQdzww/bBlvsOO1667vK75CopbYEJ7zfnv5yvzGRi828J3+fjkcjHtvFndT8I+FNqzbts3UvtVar9LSS07tT/b/+iiAgIAABTjTugAbOTGz4K+nD8+3GBBFz1e22d5ufMVuBN62x2o48HHbS7/utza+jHOYy/+nlOD1VP7Rmq/Cs/n7mupSsjpRxU48qmAAAAAAggAAFAfLVgArGXRLvQymtg2QDx2kfHcbc+n5msyl9es+b6paVErVskWk7b2rJi2F27bX7ruA7Ic6L46X+r+I7HQemX/Yx0qIAAAQDEqIABsJDkIPVdciQjVhg8bLO9D5vxt86Xe98PqbK7wsvPHeeO4YBgqIAAAgAACAADURwsWAL3lDpSeCm0lANujAgIAABSzbxMA0JeKAQC5VEAAAAABBAAAEEAAAAAEEAAAQAABAAAQQAAAAAEEAAAQQAAAAAQQAABAAAEAABBAAAAAAQQAABBAAAAABBAAAEAAAQAAEEAAAAABBAAAEEAAAAAEEAAAQAABAAAQQAAAAAEEAAAQQAAAAAQQAABAAAEAABBAAAAAAQQAABBAAAAABBAAAEAAAQAAEEAAAAABBAAAQAABAAAEEAAAQAABAAAQQAAAAAEEAABAAAEAAAQQAABAAAEAABBAAAAAAQQAAEAAAQAABBAAAEAAAQAAEEAAAAABBAAAQAABAAAEEAAAQAABAAAQQAAAAAEEAABAAAEAAAQQAABAAAEAABBAAAAAAQQAAEAAAQAABBAAAAABBAAAEEAAAAABBAAAQAABAAAEEAAAAAEEAAAQQAAAAAEEAABAAAEAAAQQAAAAAQQAABBAAAAAAQQAAEAAAQAABBAAAAABBAAAEEAAAAABBAAAQAABAAAEEAAAAAEEAAAQQAAAAAEEAABAAAEAAAQQAAAAAQQAABBAAAAABBAAAEAAAQAABBAAAAABBAAAEEAAAAAEEAAAQAABAAAEEAAAAAEEAAAQQAAAAFb9P58PZADsK1GEAAAAAElFTkSuQmCC"

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,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"

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,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"

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "./dist/images/background-foul.png?d2d46dcec1b609aea7d4bd46005249af";

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(19);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(6)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../../node_modules/css-loader/index.js!./../../node_modules/sass-loader/index.js!./prompts.scss", function() {
				var newContent = require("!!./../../../../../node_modules/css-loader/index.js!./../../node_modules/sass-loader/index.js!./prompts.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports
	
	
	// module
	exports.push([module.id, ".winLose {\n  visibility: hidden;\n  position: absolute;\n  transform: translate(-50%, -50%);\n  left: 50%;\n  top: 25%;\n  font-size: 20px;\n  font-family: homesteadInline;\n  line-height: calc(68px * 1);\n  text-align: center;\n  width: calc(130px * 1.3);\n  height: calc(68px * 1.3);\n  background: url(" + __webpack_require__(20) + ") no-repeat center center;\n  background-size: contain; }\n\n.prompts {\n  position: absolute;\n  top: -40%;\n  left: -40%;\n  font-size: calc(13px * 0.8);\n  line-height: calc(54px * 0.7);\n  text-align: center;\n  visibility: hidden;\n  font-family: homestead;\n  width: calc(116px * 0.7);\n  height: calc(68px * 0.7);\n  background: url(" + __webpack_require__(21) + ") no-repeat center center;\n  background-size: contain; }\n\n.lives {\n  position: absolute;\n  font-size: 30px;\n  left: 40%;\n  font-family: homestead;\n  color: green; }\n\n.points {\n  position: absolute;\n  right: 0%;\n  font-family: homestead;\n  color: green;\n  font-size: 30px; }\n\n.myStats, .opponentStats {\n  font-family: homestead;\n  font-size: 30px;\n  color: green;\n  position: absolute; }\n\n.opponentStats {\n  position: absolute;\n  font-size: 20px;\n  width: 100%;\n  bottom: 2%; }\n\n.skillsOptions {\n  position: absolute;\n  bottom: 1%;\n  transform: translate(-50%, 0); }\n\nstrike {\n  font-size: 20px;\n  color: red;\n  transition: color 3s; }\n", ""]);
	
	// exports


/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAABECAYAAABQ4BGKAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wwNDSY2HJq0aAAAAS5JREFUeNrt3EEOgkAQRFHHcP8rjysTMtEIJIDV8/5aFlB8qtsQWu/9gTo8XYJaLEcPbK1R+0R6742h2G7oaKTuPZcP17sxdMYb4Zdp7zuFkbcbu8lUhs5iKDMzTWVodUOZmW0qQ4shUIEiokN1Z40uZahHLgQKgUKgEKhAkbKHrvYa+2jg/snQWQxlaqaZDNWh0KG4z1Bm1jCVof5YgEAhUAgUAhUoUvbQ1V5jHw3cPxnqkQuB4v4O1aWZ3cnQ2QwdTX3D2P80k6GzGqpbM8xkKEN16xUmjuz95h9DGbrNWOzj6Nc3GcrQmCnwlN+nwdBiLOknsHqv2LTNUIFCoDDlXjD1Vu1chppyTb0MhQ69qlOrmcxQhmabOnZtNVMZasrNnn6/GWvKhQ4FQ7GTFyp1zjx+IK1vAAAAAElFTkSuQmCC"

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAABECAYAAABQ4BGKAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wwMFCodt9j9vgAAATpJREFUeNrt3MEOgyAQRdHS+P+/TFdNjKkpmCjMcO7eRH1cHuPCUmt9IQ9vryAX29ULSynUvpFaa2Eo2g09Gql77+XH+y4MXXEh/DPtu1IYOdzYJlMZuoqhzIxpKkOzG8rM2KYyNBkCFShCdKjuzNGlDLXlQqAQKAQKgQoUUebQ3VxjHg04fzJ0FUOZGtNMhupQ6FCMM5SZOUxlqA8LECgECoFCoAJFlDl0N9eYRwPOnwy15UKgGN+hujRmdzJ0NUOPpn5h7JxmMnRVQ3VrDDMZylDd+oSJR3r/+cdQhrYZ+zStz3Fmwmiu/n2TocnZZlthT+0Mo+73bhjK0Dm7x3zMUIFCoIg6h07zQI1d2vuNlKFwynXqZSiyd2hvp2brUoYyNLapu65NaSpDnXJjn37PjHXKhQ4FQ9HJByFW1UCjtLLgAAAAAElFTkSuQmCC"

/***/ },
/* 22 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {var sounds = {
		bonusPoint : new Audio('./src/sounds/bonus-point.mp3'),
		doorOpening : new Audio('./src/sounds/door-opening.mp3'),
		fire : new Audio('./src/sounds/fire.mp3'),
		foul : new Audio('./src/sounds/foul.mp3'),
		gameOver : new Audio('./src/sounds/game-over.mp3'),
		guyFalling : new Audio('./src/sounds/guy-falling.mp3'),
		guyHitFloor : new Audio('./src/sounds/guy-hit-floor.mp3'),
		oneOutlawIntro : new Audio('./src/sounds/one-outlaw-intro.mp3'),
		prepareToPlay : new Audio('./src/sounds/prepare-to-play.mp3'),
		prepareToShoot : new Audio('./src/sounds/prepare-to-shoot.mp3'),
		shoot : new Audio('./src/sounds/shoot.mp3'),
		title : new Audio('./src/sounds/title.mp3'),
		twoOutlawsIntro : new Audio('./src/sounds/two-outlaws-intro.mp3'),
		youLost : new Audio('./src/sounds/you-lost.mp3'),
		youWon : new Audio('./src/sounds/you-won.mp3'),
	
	
		playOnTop : function(sfx){
			sounds[sfx].load();
			sounds[sfx].play();
		},
	
		oldSfx : new Audio('./src/sounds/click.ogg'),
		playNewStopOld : function(sfx) {
			sounds.oldSfx.pause();
			sounds.oldSfx = sounds[sfx];
			sounds[sfx].load();
			sounds[sfx].play();
		},
	};
	
	global.sounds = sounds;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 23 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {var canvas = {
		domElement: document.querySelector('#canvas'),
		winLose: document.querySelector('#winLose'),
	
		red: function(){
			canvas.domElement.className = 'canvas canvas-red';
		},
	
		foul: function(){
			canvas.domElement.className = 'canvas canvas-foul';
		},
	
		flick: function(){
	
			var del = 65;
			canvas.domElement.className = 'canvas canvas-white';
	
			setTimeout(function () {
				canvas.domElement.className = 'canvas canvas-light';
			}, del);
	
			setTimeout(function () {
				canvas.domElement.className = 'canvas canvas-dark';
			}, del*2);
	
			setTimeout(function () {
				canvas.domElement.className = 'canvas canvas-light';
			}, del*3);
	
			setTimeout(function () {
				canvas.domElement.className = 'canvas canvas-dark';
			}, del*4);
	
			setTimeout(function () {
				canvas.domElement.className = 'canvas canvas-light';
			}, del*5);
	
			setTimeout(function () {
				canvas.domElement.className = 'canvas canvas-dark';
			}, del*6);
	
			setTimeout(function () {
				canvas.domElement.className = 'canvas canvas-light';
			}, del*7);
		}
	};
	
	global.canvas = canvas;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./billy_inlineSVG.html": 25,
		"./bob_inlineSVG.html": 26,
		"./mark_inlineSVG.html": 27,
		"./randy_inlineSVG.html": 28,
		"./sheffer_inlineSVG.html": 29
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 24;


/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = "<svg xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 72 126\" version=\"1.1\" xmlns:cc=\"http://creativecommons.org/ns#\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\">\n  <path id=\"belly\" d=\"M52,35c-4.57,10.892-6.067,11.731-15.188,11.969-8.19,0.213-11.28-1.79-13.624-3.969-0.10184-4.8527-1.4026-6.0435-3.7812-6.1875,0.06662,0.37795-0.60441,1.6075-0.53125,5.0938,0.72929,3.2032-0.53823,4.759-1.2188,17.344-0.17518,3.2396-1.7376-0.37996-3.0938,2.6562-1.5125,3.3862-0.49026,8.8689-1.0938,10.406-2.7203,6.93,2.4255-1.3914,2.5938,7.4375-0.87444,4.6777,0.35289,0.88408-1.5938,6.4062,3.2439-1.8465,3.7337-0.22177,8.5-1.6562,6.7722-2.0382,13.291,0.50305,20.5,0.375,5.4225-0.09632,11.693-2.7002,14.406-0.34375-0.73033-0.6858-1.836-1.2151-3.4062-1.2188-1.0907-0.0025-1.9109-3.9545-1.75-5.7812,0.32764-3.7205-1.3242-9.4033-2.5625-11.25,4.101-9.295,3.894-11.617,3.094-23.625,1.529-5.925-0.356-4.322-1.25-7.656zm5.875,49.531c0.18088,0.1571,0.3521,0.32777,0.5,0.53125-0.13793-0.18977-0.31457-0.35712-0.5-0.53125z\" />\n  <path id=\"leg\" d=\"m10.469,100c0.63023,0-2.55-1.1101-2.5029-0.10313,0.023466,0.50135-0.92161,1.8543,0.23032,2.8822,0.65419,0.58371,3.318,5.1765,3.4298,4.5869,0.50045,5.0298,5.0486,8.1101,1.252,8.26-1.1,0-0.87801,0.824-0.87801,1.374s-2.0384,1.187-2.9027,1.187c-0.86429,0-2.5883,1.3998-3.374,2.1855-0.7857,0.78,0.2767,1.19,0.2767,2.06,0,1.1667,4.1589,1.3463,1.1892,1.3463l20.865,0.21,3.243-5.19-1.513-10.81-1.5919-6.4919,4.1837-2.6176,7.1288-0.28898,3.7559,5.4512-2.7619,6.0587-0.18066,2.0089-0.31929,7.0557,3.9476,4.8239,21.514,0.43243c-2.971,0,0.539-0.83,0.539-1.99,0-2.02-2.416-4.44-4.438-4.44-0.864,0-1.562-0.45-1.562-1s-0.9-1-2-1c-1.7604-2.5763-1.5206-5.0486,5.0732-12.904,1.4814-1.7648,0.5181-4.6568,1.3603-6.8125-3.209-8.537-2.79-7.918-5.683-10.538-1.906-4.333-9.145-0.986-15.293-0.876-7.209,0.128-13.73-2.413-20.502-0.375-4.7663,1.4345-5.2561-0.17926-8.5,1.6672-1.0841,0.6171,0.06067-0.22078-1.0826,2.3695-0.50842,1.1519-0.37413,1.0557-0.22097,3.6241,0.40828,6.8469-0.18275,5.3344-2.6828,7.8405z\" />\n  <path id=\"arm\" d=\"m55.375,37.688c-1.3453-1.0695,1.0967-1.2921-3.1562-1.8438,0.32745,0.98847,1.0923,1.1938,1.25,2,0.37778,1.9314-0.21437,3.3978-0.21875,4.8125,0.79988,12.008,1.0071,14.33-3.0938,23.625,1.2383,1.8467,2.8901,7.5295,2.5625,11.25-0.16086,1.8267,0.65929,5.7787,1.75,5.7812,1.9689,0.0046,3.2251,0.81282,3.9062,1.75,0.168-1.11,1.141-0.089,3.626-3.062,0.40305-0.48234,1.8438-0.71884,2.7188-1.5938,2.0685-3.2859,3.3383-4.8256,4.2306-7.3472,0.8857-2.5031,0.36849-6.2193,0.36452-9.059-0.41417-3.3276-2.4574-7.8692-2.4574-7.8692s-1.1644-5.6106-3.8118-8.2579c-1.9067-1.9067-2.2557-4.3836-2.8784-4.3836-0.38917,0-2.8233-5.9033-4.7912-5.8017zm-36.344-1.032c-0.32485,0.02562-0.89486,0.1426-1.8438,0.21875-0.78522,1.4678-3.7706,3.3882-5.7885,5.3537-2.749,2.678-3.398,5.348-3.398,6.209,0,0.86-1.5936,1.333-2.1436,1.333s0.1436,2.479,0.1436,5.229-1.2505,5.229-1.8005,5.229c-0.5556,0-0.1995,2.438-0.1995,5.771,0,3.3333,0.44444,6,1,6,1.9054,0,0.31356,4.4791-1.9362,6.4807-1.5262,1.358-1.1617,2.933-0.3138,3.238,1.4803,0.531,1.6912,4.128,0.25,4.281-2.151,0.22872-1.8005,2.3884-1.8005,4.3318,0,2.6983,1.6219,3.5521,4.2693,6.1995,1.9067,1.9067,4.1567,3.4688,5,3.4688,2.5-2.506,3.0958-0.99688,2.6875-7.8438-0.21528-3.6101-0.12482-1.9227,1.3125-6,1.9466-5.5222,0.71931-1.7285,1.5938-6.4062-0.16828-8.8289-5.3141-0.5075-2.5938-7.4375,0.60348-1.5374-0.41872-7.0201,1.0938-10.406,1.3562-3.0362,2.9186,0.58337,3.0938-2.6562,0.68052-12.585,1.948-14.141,1.2188-17.344-0.09755-4.6484,1.1308-5.3268,0.15625-5.25z\" />\n  <path id=\"head\" d=\"m90.817,15.749c-1.115,0.006-2.8844,0.91561-4.4375,2.4688-1.35,1.35-2.4375,3.15-2.4375,4,0,0.87879-0.86274,1.5312-2,1.5312-1.1,0-2,0.45-2,1s-1.1625,1-2.5625,1c-2.1922,0-7.4375,3.8647-7.4375,5.4688,0,0.3,1.8,0.53125,4,0.53125,4.4392,0,4.9984,0.83884,2,3-2.738,1.9734-2.738,8.0266,0,10,2.1094,1.5204,2.5337,3.3851,1.193,5.8864,3.7955-0.3046,5.8747-0.08895,6.0048,6.1089,2.3442,2.1793,5.4389,4.2021,13.63,3.9887,9.1203-0.23761,10.603-1.0921,15.173-11.984,0-2.0606,0.48313-3,1.5625-3,4.3903,0,6.2251-8.27,2.4375-11-2.9984-2.1612-2.4392-3,2-3,2.2,0,4-0.23125,4-0.53125,0-1.604-5.2766-5.4688-7.4688-5.4688-1.4,0-2.5312-0.45-2.5312-1s-0.9-1-2-1c-1.1372,0-2-0.65246-2-1.5312,0-0.85-1.1188-2.65-2.4688-4-2.485-2.485-5.5312-3.302-5.5312-1.4688,0,0.55-1.8,1-4,1s-4-0.45-4-1c0-0.68746-0.45599-1.0036-1.125-1z\"  transform=\"translate(-59.941982,-13.748731)\" />\n</svg>\n";

/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = "<svg xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 52 152\" version=\"1.1\" xmlns:cc=\"http://creativecommons.org/ns#\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\">\n  <path id=\"head\" d=\"M20.571,50.571c1.841-1.84,1.808-2.571-0.116-2.571-2.43,0-6.455-4.648-6.455-7.455,0-1.4-0.45-2.545-1-2.545s-1-0.801-1-1.779c0-0.979-0.9-2.428-2-3.221-1.3208-0.952-2-2.589-2-4.82,0-2.463-0.8118-4.136-3-6.18-3.6377-3.398-3.7088-4.382-0.5454-7.545,2.972-2.972,6.5924-3.165,8.5454-0.455,2.1047,2.9201,5,2.6042,5-0.54546,0-2.8261,5.08-8.7146,5.7595-6.6761,0.52856,1.5857,3.9525,1.5857,4.4811,0,0.679-2.0389,5.759,3.8491,5.759,6.6761,0,3.149,2.895,3.465,5,0.545,1.953-2.71,5.573-2.517,8.545,0.455,3.164,3.163,3.093,4.147-0.545,7.545-2.188,2.044-3,3.717-3,6.18,0,2.231-0.679,3.868-2,4.82-1.1,0.793-2,2.242-2,3.221,0,0.978-0.45,1.779-1,1.779s-1,1.145-1,2.545c0,2.807-4.025,7.455-6.455,7.455-1.924,0-1.9572,0.73109-0.11688,2.5714-4.0713-0.24907-6.3529-0.12386-10.857,0z\" />\n  <path id=\"leg\" d=\"M11.638,101.05c0,1.1-1.188,4.95-0.638,4.95s1,0.85208,1,1.9062c0,1.0542,0.5625,2.1792,1.25,2.5,1,0.46666,1,0.72084,0,1.1875-1.561,0.72-1.803,22.4-0.25,22.4,1.5344,0,1.1777,6.9473-0.4375,8.5625-0.785,0.79-2.8334,1.44-4.562,1.44-3.3996,0-6,1.93-6,4.44,0,1.25,1.1941,1.56,5.9062,1.56,3.7556,0,6.1297-0.45657,6.5-1.25,0.46666-1,0.72084-1,1.1875,0,0.77983,1.6711,3.2067,1.5746,4.9688-0.1875,1.68-1.68,2.074-16.56,0.437-16.56-0.57143,0-1-3-1-7s0.42857-7,1-7c0.55,0,1-0.9,1-2s0.45-2,1-2,1-0.9,1-2c0-1.3333,0.66667-2,2-2s2,0.66667,2,2c0,1.1,0.45,2,1,2s1,0.9,1,2,0.45,2,1,2c0.57143,0,1,3,1,7s-0.42857,7-1,7c-1.6371,0-1.243,14.882,0.4375,16.562,1.7621,1.7621,4.1889,1.8586,4.9688,0.1875,0.46666-1,0.72084-1,1.1875,0,0.37027,0.79343,2.7444,1.25,6.5,1.25,4.712,0,5.906-0.31,5.906-1.56,0-2.51-2.6-4.44-6-4.44-1.729,0-3.777-0.65-4.562-1.44-1.616-1.61-1.972-8.56-0.438-8.56,1.5533,0,1.3115-21.678-0.25-22.406-1-0.46666-1-0.72084,0-1.1875,0.6875-0.32084,1.25-1.4458,1.25-2.5,0-1.05,0.45-1.9,1-1.9s1.8736-4.1762,1.8736-5.2762c-11.566-1.5584-18.87-1.1008-31.236,0.32762z\" />\n  <path id=\"arm\" d=\"m16.031,52c-1.976,0-4.0064,0.91269-5.5625,2.4688-2.1053,2.106-2.468,3.384-2.468,9,0,3.697-0.4352,6.531-1,6.531-0.55,0-1,1.8-1,4s-0.45,4-1,4-1,1.35-1,3-0.45,3-1,3c-0.57831,0-1,3.1676-1,7.5312,0,6.8476,0.25887,7.8214,2.6875,10.25,1.7108,1.7108,2.8022,2.2184,3.0625,1.4375,0.653-1.96,2.25-1.41,2.25,0.78,0,1.0294,0.40492,1.8633,0.90625,1.9688,0.20434-2.011-0.07352-5.6918,2.3125-5.3438,1.4773,0.0596,3.4721,0.36282,3.8438-0.59375,1.4492-3.7305-0.93311-9.7926-1-14.094-0.202-13.032,0.173-24.8-0.031-33.946zm19.938,0c-3.8391,13.154,2.62,13.903-0.84375,44.688-0.1053,0.93584,0.84873,2.5783,1.9688,3.1875,1.7622,0.95843,4.2075,0.6384,5.7812,0.84375,0,0.31329-0.11497,0.88646-0.28125,1.5312,0.52323-0.45526,1.2621-0.2138,1.6562,0.96875,0.26032,0.78095,1.3517,0.27331,3.0625-1.4375,2.429-2.427,2.688-3.401,2.688-10.249,0-4.363-0.422-7.531-1-7.531-0.55,0-1-1.35-1-3s-0.45-3-1-3-1-1.8-1-4-0.45-4-1-4c-0.56481,0-1-2.8343-1-6.5312,0-5.6162-0.36269-6.8939-2.4688-9-1.556-1.556-3.586-2.469-5.562-2.469z\"/>\n  <path id=\"belly\" d=\"m26.156,50.438c-1.6423,0.01565-3.3416,0.06307-5.5938,0.125-0.785,0.785-2.816,1.437-4.531,1.437,0.20407,9.1463-0.17129,20.914,0.03125,33.938,0.06689,4.3011,2.4492,10.363,1,14.094,4.1822,0.26266,15.471-0.32912,20.719,0.125-1.315-0.481-2.746-2.157-2.656-3.472,3.464-30.785-2.995-31.534,0.844-44.688-1.715,0-3.746-0.652-4.531-1.438-2.036-0.124-3.639-0.14-5.282-0.124z\"/>\n</svg>\n";

/***/ },
/* 27 */
/***/ function(module, exports) {

	module.exports = "<svg xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 82 146\" version=\"1.1\" xmlns:cc=\"http://creativecommons.org/ns#\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\">\n  <path id=\"head\" d=\"m85.248,68.903c1.0026,0-1.2065-0.46612-1.2065-2.174,0-1.4704,0.99336-3.5165,2.25-4.6346,1.5262-1.3579,1.8479-2.1463,1-2.4506-0.71086-0.25517-1.25-2.138-1.25-4.3654,0-3.25,0.34043-3.9167,2-3.9167,1.1,0,2-0.45,2-1s-0.9-1-2-1-2-0.45-2-1c0-0.55556-2.6667-1-6-1-5.3333,0-6-0.22222-6-2,0-1.1-0.45-2-1-2s-1-2.25-1-5v-5h10,10v-6c0-3.3333,0.44444-6,1-6,0.55,0,1-0.70714,1-1.5714,0-2.9328,2.7021-4.4286,8-4.4286s8,1.4958,8,4.4286c0,0.86429,0.45,1.5714,1,1.5714,0.55555,0,1,2.6667,1,6v6h10,10v5c0,2.75-0.45,5-1,5-0.54999,0-1,0.9-1,2,0,1.7778-0.66666,2-6,2-3.3333,0-6,0.44444-6,1,0,0.55-0.90001,1-2,1s-2,0.45-2,1,0.9,1,2,1c1.6596,0,2,0.66667,2,3.9167,0,2.1959-0.53671,4.0956-1.2216,4.3239-1.3947,0.46491,3.4292,5.7595,5.2476,5.7595-0.30242,0.86192-4.028,3.3024-4.9229,4.1932-1.6953,1.6874-1.1481,1.7713-3.5344,2.8302-3.0854,1.3691-3.8156,6.5027-10.892,6.6629-8.2723,0.1873-6.0862-3.398-9.5372-5.1786-2.1795-1.1246-2.1831-3.2786-4.3626-3.9845-1.5623-0.50604-2.7543,0.09091-3.5702-0.98176z\" transform=\"translate(-62.041145,6.6386404)\" />\n  <path id=\"leg\" d=\"m13,114c1.65,1.5413,3,3.5269,3,4.4062,0,0.87933,0.45,1.5938,1,1.5938s1,1.35,1,3c0,2.0606-0.48313,3-1.5625,3-2.361,0-4.438,2.54-4.438,5.44,0,1.41-0.45,2.56-1,2.56-1.4359,0-1.2355,6.8128,0.25,8.5,0.79824,0.90665,3.3281,1.4444,7,1.4688,5.7307,0.0379,5.75,0.0212,5.75-2.9688,0-2.5556,0.37202-3,2.5625-3,2.7868,0,5.4375-2.0586,5.4375-4.2188,0-0.74287,0.9-1.9884,2-2.7812,1.1-0.79284,2-2.0527,2-2.7812,0-0.72859,1.1179-2.4304,2.5-3.8125,2.224-2.224,2.684-2.3473,4-1.0312,0.81786,0.81786,1.5,1.9795,1.5,2.5938,0,1.66,4.689,6.03,6.469,6.03,1.222,0,1.531,1.25,1.531,6,0,5.9619,0.0081,6,2.9062,6,1.6042,0,3.1792-0.5625,3.5-1.25,0.46667-1,0.72083-1,1.1875,0,0.37026,0.79343,2.7444,1.25,6.5,1.25h5.906v-3.56c0-3.78-1.832-6.44-4.438-6.44-0.864,0-1.562-0.45-1.562-1s0.9-1,2-1c1.5556,0,2-0.66667,2-3,0-1.65-0.45-3-1-3-1.457,0-1.2274-7.7168,0.25-8.4062,1-0.46666,1-0.72084,0-1.1875-0.6875-0.32084-1.25-1.8958-1.25-3.5,0-1.6-0.45-2.9-1-2.9-4.1722-2.6436-28.133,1.3326-34.461,2.1664-6.3835,0.84121-4.1042,1.7466-6.0734,1.3431-2.2977-0.4708-1.453-5.4672-7.0661-4.5365-2.322,0.39-3.337,4.75-6.4,5.03z\"/>\n  <path id=\"arm\" d=\"M60.031,72c-0.302,0.862-4.042,3.297-4.937,4.188-1.696,1.687-1.145,1.784-3.532,2.843,5.725,17.827,4.889,16.559,4.407,30.279,4.948-0.33,9.152-0.29,10.843,0.6-0.454-0.38-0.812-1.99-0.812-3.91,0-2.2-0.45-4-1-4-0.618,0-1-5.182-1-13.562,0-13.622-0.674-16.438-3.969-16.438zm-38.031,1.375c0,1.708-0.529,2.625-1.531,2.625-2.001,0-6.469,4.468-6.469,6.469,0,0.85-0.45,1.531-1,1.531s-1,1.35-1,3-0.45,3-1,3c-0.604,0-1,4.195-1,10.59,0,10.49,0.032,10.64,3,13.41,3.063-0.28,4.085-4.65,6.406-5.03,5.613-0.93,4.765,4.06,7.063,4.53-0.512-1.15,0.077-1.82-0.094-3.41-0.056-0.52-0.213-1.13-0.5-1.9-0.942-2.54-4.346-7.48-4.563-9.471-0.443-4.101,1.991-5.012,2.626-9.157,0.813-5.31,6.014-10.124,2.843-13.031-1.562-0.506-2.746,0.073-3.562-1,1.002,0-1.219-0.448-1.219-2.156z\"/>\n  <path id=\"belly\" d=\"m26.781,76.531c3.1712,2.9069-2.0307,7.7211-2.8438,13.031-0.6346,4.1445-3.0689,5.055-2.625,9.1562,0.21603,1.9959,3.6208,6.9341,4.5625,9.4688,0.28671,0.77172,0.44353,1.3835,0.5,1.9062,0.17093,1.5823-0.41786,2.2567,0.09375,3.4062,1.9691,0.40347-0.32104-0.50254,6.0625-1.3438,3.9653-0.52254,14.833-2.2612,23.438-2.8438,0.483-13.74,1.319-12.472-4.406-30.299-3.085,1.369-3.798,6.496-10.874,6.657-8.273,0.187-6.112-3.407-9.563-5.188-2.18-1.125-2.164-3.263-4.344-3.969z\"/>\n</svg>\n";

/***/ },
/* 28 */
/***/ function(module, exports) {

	module.exports = "<svg xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns=\"http://www.w3.org/2000/svg\" height=\"100%\" width=\"100%\" version=\"1.1\" xmlns:cc=\"http://creativecommons.org/ns#\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" viewBox=\"0 0 76 150\">\n  <path id=\"leg\" d=\"m18.625,104.97c0,7.4113,0.26808,8.7517,2,10,2.2267,1.6049,2.7306,6.5401,0.75,7.3438-0.94656,0.38407-0.89284,0.75899,0.21875,1.5312,1.2388,0.86065,1.0869,1.3422-0.96875,3.125-2.0376,1.7672-2.1967,2.2731-0.96875,3.0625,1.2867,0.82718,1.2836,1.061-0.03125,1.9375-1.2797,0.85313-1.2973,1.1313-0.09375,1.9062,1.1073,0.71297,0.27929,2.0145-3.8125,6-4.4089,4.2944-5.0077,5.2831-3.9062,6.5312,1.6634,1.885,12.366,2.14,13.219,0.3125,0.46666-1,0.72084-1,1.1875,0,1.1783,2.5249,6.4062,0.30639,6.4062-2.7188,0-0.84342,1.5652-2.7682,3.1562-4.2188,1.1176-1.0189-0.18364-31.938,0.40625-31.938,0.21819,0,0.11503-0.64247,3.8125,0.71875,0.1397,26.845,0.63792,30.491,1.2812,31.062,1.6502,1.4653,3.3438,3.4996,3.3438,4.375,0,3.0251,5.228,5.2437,6.4062,2.7188,0.46667-1,0.72083-1,1.1875,0,0.85643,1.8352,11.144,1.6372,13.031-0.25,1.3302-1.3302,0.92631-2.0693-3.7188-6.5938-4.1044-3.9978-4.9197-5.2871-3.8125-6,1.2035-0.77495,1.1859-1.0531-0.09375-1.9062-1.3148-0.87653-1.3179-1.1103-0.03125-1.9375,1.2279-0.78941,1.0688-1.2953-0.96875-3.0625-2.0556-1.7828-2.2076-2.2644-0.96875-3.125,1.1116-0.77226,1.1653-1.1472,0.21875-1.5312-1.6978-0.6889-1.5736-5.1452,0.1875-6.9062,1.7426-1.7426,4.236-1.8544,4.7812-0.21875-6.0663-21.554-16.872-13.015-29.259-14.203-3.0643,1.435-4.2882-0.58249-12.96,3.9846z\" />\n  <path id=\"belly\" d=\"m50.969,53.719c-1.2944,0.69403-3.4512,1.2467-5.552,2.7267-2.0163,1.4205-3.9447,3.7796-6.7016,3.9894-1.5568,0.11847-4.6324-1.2224-6.6992-2.648-2.7247-1.8793-4.3733-4.0184-5.1934-4.2743-2.0924-0.69632-0.97665,5.0482,0.89855,7.9492,1.1157,1.726,3.6718,2.599,3.0288,2.2258-5.0143,15.862-6.5754,20.386,0.84375,37.281,7.7132,0.73978,14.809-2.2847,20.531,0.53125,2.7548-17.009,6.1996-13.431,6.625-18.656,5.9492-7.5476,1.1955-16.985-3-25.156-1.9385-3.7755-3.7123-1.8818-4.7812-3.9688zm8.8125,58.125c0.15745,0.4371,0.28529,0.87431,0.4375,1.3438-0.1493-0.45896-0.28316-0.91581-0.4375-1.3438z\" />\n  <path id=\"arm\" d=\"M54.469,46.844c0.557,0.483,2.567,2.895,1.625,4.281-1.062,1.562-5.125,2.118-5.125,2.594,1.069,2.087,2.842,0.193,4.781,3.969,4.195,8.171,8.949,17.608,3,25.156-0.425,5.225-3.87,1.647-6.625,18.656,3.461,1.71,6.433,5.57,8.719,13.69,0.613,1.84,11.781-9.8,11.781-12.28,0-1.17-1.35-3.4-3-4.941,1.527-1.953,1.358,0.075,1.563-3.438,1.665-1.665,2.053-14.562,0.437-14.562-0.556,0-1-2.667-1-6,0-3.334-0.444-6-1-6-0.55,0-1-1.8-1-4s-0.45-4-1-4-1-0.681-1-1.531c0-2.43-4.662-6.469-7.469-6.469-1.688,0-2.531-0.543-2.531-1.625,0-0.898-0.972-2.473-2.156-3.5zm-33.407,5.125c-2.021,0-4.437,2.416-4.437,4.437,0,0.865-0.45,1.563-1,1.563s-1,2.25-1,5-0.45,5-1,5c-0.583,0-1,3.333-1,8,0,4.666,0.417,8,1,8,0.55,0,1,2.152,1,4.781,0,3.632,0.48,5.123,2,6.219,1.732,1.248,2,2.588,2,10.001,8.672-4.57,9.904-2.57,12.969-4-7.424-16.908-5.866-21.427-0.844-37.314-9.594-5.58,1.953-9.438-9.312-11.625-0.135,0.252-0.243,0.286-0.376-0.062z\" />\n  <path id=\"head\" d=\"m21.052,51.973c0.56208,1.4821,0.99089-3.8802,2.5714-4,1.7679,0,1.0657-3.5112-1-5-1.3552-0.97681-2-2.5887-2-5s-0.64475-4.0232-2-5c-2.8319-2.0411-2.8319-9.9589,0-12,1.1-0.79284,2-2.0376,2-2.7662,0-1.7851,4.5467-6.2338,6.3712-6.2338,0.80417,0,1.664,0.5625,1.9108,1.25,0.30436,0.84789,1.0927,0.52621,2.4506-1,2.0408-2.2936,5.2673-3.0594,5.2673-1.25,0,0.55,0.9,1,2,1s2-0.45,2-1c0-1.8094,3.2266-1.0436,5.2673,1.25,1.3579,1.5262,2.1463,1.8479,2.4506,1,0.24678-0.6875,1.1066-1.25,1.9108-1.25,1.8245,0,6.3712,4.4486,6.3712,6.2338,0,0.72858,0.9,1.9734,2,2.7662,2.8319,2.0411,2.8319,9.9589,0,12-1.3276,0.95685-2,2.5887-2,4.8535,0,2.2479-0.73453,4.049-2.153,5.2792l-2.153,1.8673,2.153,1.8673c0.55676,0.48288,2.5674,2.9007,1.6255,4.2864-1.0614,1.5615-5.1293,2.1013-5.1293,2.5771-7.8609,3.793-6.572,5.1293-12.759,7.295-16.557-6.516-3.1121-6.4659-17.156-9.0259z\"/>\n</svg>\n";

/***/ },
/* 29 */
/***/ function(module, exports) {

	module.exports = "<svg xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 60 164\" height=\"100%\" width=\"100%\" version=\"1.1\" xmlns:cc=\"http://creativecommons.org/ns#\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\">\n <path id=\"head\" d=\"m19.181,35.54c0.51647,1.2537,2.7863,3.7005,2.7863,4.6791,0,0.97858,0.45,1.7812,1,1.7812s1,1.35,1,3c0,2.3333-0.44444,3-2,3,9.5249,3.6853,11.871,2.9765,20,0-1.5556,0-2-0.66667-2-3,0-1.65,0.45-3,1-3s1-0.80267,1-1.7812c0-0.97859,0.89948-1.9574,2-3.2188s1.1226-1.6777,1.9036-4.1032c0.38949-1.2095-0.38593-3.9201-0.77018-6.1684-0.38424-2.2483-3.5934-2.6634,4.8666-2.7285,3.3,0,6-0.24822,6-0.5625,0-1.1733-2.922-3.4375-4.4375-3.4375-0.86429,0-1.5625-0.45-1.5625-1s-1.8-1-4-1h-4v-5.532c0-7.596-2.7343-10.469-10-10.469s-10,2.8728-10,10.469v5.5312h-4c-2.2,0-4,0.45-4,1s-0.69821,1-1.5625,1c-1.5155,0-4.4375,2.2642-4.4375,3.4375,0,0.31428,2.7,0.5625,6,0.5625,3.1498,0.22614,3.4034-0.11414,6.1135-0.56296-1.4354,1.9903-2.8482,7.3729-0.89984,12.103z\"/>\n <path id=\"arm\" d=\"M17.969,46c-1.251,0-2,0.669-2,1.781,0,0.979-2.525,4.27-3.625,5.063-2.6991,2.513-1.893,2.638-3.6878,7.562-3.2996,5.559-4.053,7.113-5.9374,13.906-1.2294,4.74-0.6585,7.261,1.4062,13.032,1.7455,2.159,2.9554,7.169,5.125,9.281,1.705,0.987,4.562,2.591,7.312,1.906,2.272-0.566,2.333-0.955,4.907-2.281,1.384-0.163,3.871-4.088,4.093-4.844,0.859-2.913-0.703-8.945-0.656-10,0.077-1.703-1.049-0.674-3.218,0.282-1.145,0.504-3.421,0.981-4.126,1.031-1.726,0.123,0.093-2.148-1.75-2.125-2.422,0.03-4.402-0.474-4.406-2.688-0.004-2.17,1.296-3.844,1.75-5.812,0.845-3.703,1.376-5.932,3.469-9.344,2.591-4.259,6.321-8.401,6.687-11.406,0.278-2.272,2.875-1.742-1.343-3.344-1.1,0-2-0.45-2-1s-0.9-1-2-1zm28,0c-1.1,0-2,0.45-2,1s-0.9,1-2,1c-12.707,2.265-0.433,4.421,3.062,9.031,2.668,3.519,2.982,5.673,3.157,6.907,0.457,3.232,1.097,3.557,1.781,9.531,0.195,1.705-1.361,6.78-3.657,8.843-3.234,2.908-7.775,2.949-9.687,6.282-1.147,2.001,2.51,3.866,3.219,5.718,0.849,2.22-1.091,4.262-1,4.5,4.375,2.838,9.3-2.752,12.125-2.812-2.225,0-0.903-5.289,2-8,1.65-1.541,3-3.527,3-4.406,0-0.88,0.45-1.594,1-1.594s1-2.25,1-5-0.45-5-1-5-1-1.35-1-3-0.45-3-1-3-1-1.8-1-4-0.45-4-1-4-1-1.253-1-2.781c0-1.632-0.826-3.372-2-4.219-1.1-0.793-2-2.24-2-3.219,0-1.112-0.749-1.781-2-1.781z\"/>\n <path id=\"belly\" d=\"m21.967,48c4.2177,1.6021,1.6207,1.0715,1.3438,3.3438-0.36634,3.0056-4.0943,6.6433-6.6875,10.902-0.53115,0.87229,1.1271,2.2528,1.3044,3.7032,0.23318,1.9075-0.93228,3.9357-1.4076,5.0874-1.3058,3.164-0.21572,7.2697-0.21091,10.063,0.01015,5.8886,9.1185-3.5169,8.7701,0.30944-0.0957,1.051,0.99882,7.2441,0.14032,10.157-7.0853,11.306-4.8299,0.44559-3.3774,4.9965,5.7124-0.67712,15.548-2.5942,17,2.25-0.09147-0.23941,1.8492-2.2799,1-4.5-0.70866-1.8528-4.3663-3.7178-3.2188-5.7188,1.9116-3.3331,6.4532-3.3737,9.6875-6.2812,2.295-2.063,3.851-7.138,3.656-8.843-0.683-5.974-1.324-6.298-1.781-9.531-0.175-1.234-0.457-3.388-3.125-6.907-2.559-3.374-9.829-5.441-8.563-7.187-4.398,1.199-7.523,0.867-14.531-1.844z\"/>\n <path id=\"leg\" d=\"m12.362,98.261c0.07705,0.45155,1.3157,14.901,1.3791,15.312,0.25433,1.647,4.0169-0.97823,4.1053,0.93579,0.153,3.3,0.121,7.45,0.121,17.49,0,11.333-0.37037,18-1,18-0.55,0-1,0.9-1,2,0,1.1372-0.65246,2-1.5312,2-2.001,0-6.469,4.47-6.469,6.47,0,1.24,1.3344,1.53,6.906,1.53,4.5556,0,7.1158-0.42671,7.5-1.25,0.46666-1,0.72084-1,1.1875,0,0.77983,1.6711,3.2067,1.5746,4.9688-0.1875,1.169-1.17,1.437-6.44,1.437-29,0-26.9,0.048-27.56,2-27.56,1.9516,0,2,0.65774,2,27.562,0,22.562,0.26849,27.831,1.4375,29,1.7621,1.7621,4.1889,1.8586,4.9688,0.1875,0.46666-1,0.72084-1,1.1875,0,0.38421,0.82329,2.9444,1.25,7.5,1.25,5.572,0,6.906-0.29,6.906-1.53,0-2-4.468-6.47-6.469-6.47-0.879,0-1.531-0.86-1.531-2,0-1.1-0.45-2-1-2-0.62963,0-1-6.6667-1-18v-18h6v-9c0-5.3333-0.40741-9-1-9-2.8246,0.05982-7.7622,5.6404-12.138,2.7989-1.4521-4.8442-11.262-2.9121-16.974-2.235-3.4812,1.1283-5.0502,2.3706-9.4919,1.6946z\"/>\n</svg>\n";

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map
var canvas = {
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

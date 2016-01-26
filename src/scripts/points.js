var points = {

	myTimeDivElement : document.querySelector('#gameTime'),
	pointsDomElement : document.querySelector('#points'),
	amount: 0,
	isHard: true,

	highScore: localStorage.highScoreEasy,

	Head: 20,
	Belly: 15,
	Arm: 5,
	Leg: 5,

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

	addNulls: function(str){
		var len = str.toString().length;
		return '00000'.substring(0, 5 - len) + str;
	},

	printPoints: function(){
		points.pointsDomElement.innerHTML = 'Points ' + points.addNulls(points.amount);
	}
};

module.exports = points;

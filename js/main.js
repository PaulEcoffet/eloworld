var DEFAULT_SCORE = 1200;
var K = 40;

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

var Elo = function () {
	this.objects = [];
	this.currentRanking = [];
	this.fightswithoutchange = 0;
	this.totalfights = 0;
	this.first = {};
	this.second = {};
	this.previousFights = [];
};

Elo.prototype.addObject = function (obj) {
	this.objects.push({"obj": obj, "score":DEFAULT_SCORE});
	this.fightswithoutchange = 0;
};

Elo.prototype.removeObject = function (obj) {
	//TODO
};

Elo.prototype.getNextFight = function () {
	if(this.objects.length < 2)
	{
		throw {"name": "NoFightPossible",
			   "message": "No fight can be made with only one item"};
	}
	var second = null,
	    first = null;
	while (second == first)
	{
		first = this.pickRandomByScore();
		second = this.pickRandomByScore();
	}
	this.first = first
	this.second = second
	return [first, second]
};

Elo.prototype.hasNextFight = function () {
	return (this.fightswithoutchange < (this.objects.length * 2));
};

/**
 * Winner = 1 if player 1 won, 0.5 if draw and 0 if player 1 lose
 */
Elo.prototype.vote = function (winner) {
	var i1 = this.objects.indexOf(this.first);
	var i2 = this.objects.indexOf(this.second);
	D = this.objects[i1]['score'] - this.objects[i2]['score']
	this.objects[i1]['score'] += Math.round(K * (winner - prob(D)));
	this.objects[i2]['score'] += Math.round(K * ((1 - winner) - (1 - prob(D))));

	var currentRanking = this.currentRanking;
	this.computeRank();
	if (currentRanking == this.currentRanking)
	{
		this.fightswithoutchange++;
	}
	else
	{
		this.fightswithoutchange = 0;
	}
	this.totalfights++;
	return this.hasNextFight();
};

Elo.prototype.getObjects = function() {
	return this.objects;
};

Elo.prototype.getSortedByScore = function () {
	return this.computeRank();
};

Elo.prototype.computeRank = function ()
{
	var tmp = this.objects;
	tmp.sort(function(a, b) {return b['score']- a['score'];});
	this.currentRanking = tmp;
	return tmp;
}

Elo.prototype.pickRandomByScore = function() {
	var tot = 0;
	for (var i = this.objects.length - 1; i >= 0; i--) {
		tot += this.objects[i]["score"];
	};
	var pick = getRandom(0, tot);
	console.log(pick)
	i = -1;
	score = 0
	while (score < pick)
	{
		i++;
		score += this.objects[i]["score"];
	}
	return this.objects[i]
}

function prob (D) {
	D = Math.max(-400, Math.min(400, D));
	return 1/(1 + Math.pow(10, -D / 400));
}

elo = new Elo();

$("#add-item-form").submit(function (event) {
	$add = $("#add-input");
	elo.addObject($add.val());
	$add.val('');
	updateResults();
	try
	{
		var opponents = elo.getNextFight();
		$("#first").html(opponents[0]["obj"]);
		$("#second").html(opponents[1]["obj"]);
	}
	catch (e)
	{
		//Do nothing
	}
	//$add.focus()
	event.preventDefault();
});

function updateResults() {
	if (elo.hasNextFight())
	{
		//$("#results-container").hide();
		$("#vote-container").show();
	}
	else
	{
		$("#results-container").show();
		$("#vote-container").hide();
	}
	var items = elo.getSortedByScore();
	$("#results").empty();
	for (var i = 0; i < items.length; i++) {
		$("#results").append("<li>" + items[i]["obj"] + " (" + items[i]["score"] + ")</li>");
	};
}

function voteclick (score) {
	return function (event) {
		elo.vote(score);
		var opponents = elo.getNextFight();
		$("#first").html(opponents[0]["obj"]);
		$("#second").html(opponents[1]["obj"]);
		updateResults();
		event.preventDefault();
	}
}

$("#first").click(voteclick(1));
$("#second").click(voteclick(0));
$("#draw").click(voteclick(0.5));
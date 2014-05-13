// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

if (Meteor.isClient) {
  Template.leaderboard.players = function () {
    return Players.find();
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

	Template.leaderboard.selected_score = function () {
		var player = Players.findOne(Session.get("selected_player"));
		return player && player.score;
	};

	Template.leaderboard.selected_in_rotation = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.inRotation;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.give-dinner': function () {
			if (!Players.findOne(Session.get("selected_player")).inRotation)
				return;
      Players.update(Session.get("selected_player"), {$inc: {dinnerMarks: 1}});
			if (Players.find({dinnerMarks: {$gt: 0}}).count() === Players.find({inRotation: true}).count()){
				Meteor.call('clearDinner');
			}
    },
		'click input.give-lunch': function () {
			if (!Players.findOne(Session.get("selected_player")).inRotation)
        return;
      Players.update(Session.get("selected_player"), {$inc: {lunchMarks: 1}});
      if (Players.find({lunchMarks: {$gt: 0}}).count() === Players.find({inRotation: true}).count()){
        Meteor.call('clearLunch');
      }
    },
		'change input.update-score': function (event) {
			var value = $(event.target).val();
			Players.update(Session.get("selected_player"), {$set: {score: value}});
		}
  });

	Template.player.repeat =
		function (data, options) {
			var contents = '';
			for (var i=0; i < data; i++) {
				 contents += options.fn(this);
			}
			return contents;
		};

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });
}

Meteor.methods({
	clearDinner: function() {
		Players.update({inRotation: true}, {$inc: {dinnerMarks: -1}}, {multi: true});
	},
	clearLunch: function() {
    Players.update({inRotation: true}, {$inc: {lunchMarks: -1}}, {multi: true});
  }
});

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      Players.remove({});
			var initialScores = [{name: "I", score: 41729, dinnerMarks: 0, lunchMarks: 0, inRotation: false},
									 {name: "R", score: 50241, dinnerMarks: 0, lunchMarks: 0, inRotation: false},
									 {name: "S", score: 65946, dinnerMarks: 1, lunchMarks: 0, inRotation: true},
                   {name: "JMFB", score: 51976, dinnerMarks: 0, lunchMarks: 0, inRotation: true},
                   {name: "G", score: 140586, dinnerMarks: 0, lunchMarks: 0, inRotation: true},
                   {name: "E", score: 17244, dinnerMarks: 0, lunchMarks: 0, inRotation: true},
                   {name: "B", score: 99243, dinnerMarks: 0, lunchMarks: 0, inRotation: true}];
      for (var i = 0; i < initialScores.length; i++)
        Players.insert(initialScores[i]);
    }
  });
}

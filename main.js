var seed = new Date().toJSON().slice(0,10);
if (window.console) {
	console.log('using seed :' + seed);
}
var PAUSED_PREFIX = 'paused-';

var viewModel = {
	newValue: ko.observable(''),
	items: ko.observable([]),
	addItem: function() {
		var current = viewModel.items().slice();
		current.push({
			caption: viewModel.newValue(),
			paused: false
		});
		viewModel.newValue('');
		viewModel.items(current);
	},
	pauseItem: function(item) {
		var current = viewModel.items().slice();
		current = current.map(function(i) {
			if (i !== item) {
				return i;
			} else {
				return {
					paused: !i.paused,
					caption: i.caption
				};
			}
		});
		viewModel.items(current);
	},
	removeItem: function(item) {
		var current = viewModel.items().slice();
		current = current.filter(function(i) {return i !== item;});
		viewModel.items(current);
	},
	shuffledItems: ko.pureComputed(function() {
		var items = viewModel.items().slice().sort(function(a, b) {
			return a.caption.localeCompare(b.caption);
		});
		var result = [];
		Math.seedrandom(seed);
		while (items.length) {
			var index = Math.floor(Math.random() * items.length);
			var removed = items.splice(index, 1)[0];
			result.push(removed);
		}
		return result;
	}),
	unpausedItems: ko.pureComputed(function() {
		return viewModel.shuffledItems().filter(function(i) {
			return !i.paused;
		});
	}),
	pausedItems: ko.pureComputed(function() {
		return viewModel.shuffledItems().filter(function(i) {
			return i.paused;
		}).sort(function(a, b) {
			return a.caption.localeCompare(b.caption);
		});
;
	}),
};

//http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
var getParameterByName = function(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	    results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
var firebaseId = getParameterByName('firebaseId');
if (!firebaseId) {
	alert('firebaseId is needed');
}

function valToItems(val) {
	if (!val) return [];
	return val.map(function(i) {
		if (i.indexOf(PAUSED_PREFIX) === 0) {
			return {paused: true, caption: i.substring(PAUSED_PREFIX.length)};
		} else {
			return {paused: false, caption: i};
		}
	});
}

function itemsToVal(items) {
	return items.map(function(i) {
		return i.paused ? PAUSED_PREFIX + i.caption : i.caption;
	});
}


var firebase = new Firebase('https://' + firebaseId + '.firebaseio.com');
var firstValue = true;
firebase.on('value', function(snapshot) {
	if (firstValue) {
		firstValue = false;
		$('*').show();
		$('.loading').hide();
	}
	viewModel.items(valToItems(snapshot.val()));
});

viewModel.items.subscribe(function(items) {
	firebase.set(itemsToVal(items));
});

//init
$(document).ready(function() {
	ko.applyBindings(viewModel);
	if (firstValue) {
		$('body').children().hide();
		$('.loading').show();
	}

	var title = getParameterByName('title');
	if (title) {
		$('h1').text(title);
	}
});

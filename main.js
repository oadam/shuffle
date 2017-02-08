function getSeed() {
	return new Date().toJSON().slice(0,10);
}

var seed = getSeed();
// check every minute if seed has changed
setInterval(function() {
	if (seed != getSeed()) {
		seed = getSeed();
	}
	// force refresh
	viewModel.items(viewModel.items());
}, 1000 * 60);

var viewModel = {
	newValue: ko.observable(''),
	items: ko.observable([]),
	addItem: function() {
		var current = this.items().slice();
		current.push(this.newValue());
		this.newValue('');
		this.items(current);
	},
	removeItem: function(item) {
		var current = viewModel.items().slice();
		current = current.filter(function(i) {return i != item;});
		viewModel.items(current);
	},
	shuffledItems: ko.pureComputed(function() {
		var items = viewModel.items().map(function(i) {
			return {
				label: i,
				hash: sha1(seed + i)
			};
		});
		items.sort(function(a, b) {
			return a.hash.localeCompare(b.hash);
		});
		return items.map(function(i) {
			return i.label;
		});
	})
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



var firebase = new Firebase('https://' + firebaseId + '.firebaseio.com');
var firstValue = true;
firebase.on('value', function(snapshot) {
	  if (firstValue) {
		      firstValue = false;
		          $('*').show();
			      $('.loading').hide();
			        }
	    viewModel.items(snapshot.val()||[]);
});

viewModel.items.subscribe(function(items) {
	  firebase.set(items);
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

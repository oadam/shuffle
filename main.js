var seed = new Date().toJSON().slice(0,10);
if (window.console) {
	  console.log('using seed :' + seed);
}

function hashString(s) {
	var hash = 0, i, chr, len;
	if (s.length === 0) return hash;
	for (i = 0, len = s.length; i < len; i++) {
		chr   = s.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};
                            
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
				hash: hashString(seed + i)
			};
		});
		items.sort(function(a, b) {
			return a.hash - b.hash;
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

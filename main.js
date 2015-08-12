var seed = new Date().toJSON().slice(0,10);
if (window.console) {
	  console.log('using seed :' + seed);
}
                            
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
			      var items = viewModel.items().slice();
			          items = items.sort();
				      var result = [];
				          Math.seedrandom(seed);
					      while (items.length) {
						            var index = Math.floor(Math.random() * items.length);
							          var removed = items.splice(index, 1);
								        result.push(removed);
									    }
					          return result;
						    })
};

//firebase
var match = /\?firebaseId=([^&]*)/.exec(location.search);
if (!match) {
	  alert('firebaseId is needed');
}
var firebaseId = decodeURIComponent(match[1]);
var firebase = new Firebase(firebaseId);
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
});

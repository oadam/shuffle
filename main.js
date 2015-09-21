var seed = new Date().toJSON().slice(0, 10);
if (window.console) {
    console.log('using seed :' + seed);
}

var viewModel = {
    title: ko.observable(),
    //track whether we are editing the title
    editingTitle: ko.observable(),
    // edit the title
    editTitle: function() {
        this.editingTitle(true);
    },
    // stop editing the title. 
    stopEditingTitle: function() {
        this.editingTitle(false);
    },
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
        current = current.filter(function(i) {
            return i != item;
        });
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
var firebase = new Firebase('https://' + firebaseId + '.firebaseio.com');
var firstValue = true;


firebase.on('value', function(snapshot) {
    if (firstValue) {
        firstValue = false;
        $('.workspace').show();
        $('.loading').hide();
    }
	var val = snapshot.val();
	var title = "Double click to edit.";
	var items = [];
	if (val != null){
		if (val.items != null){
			items = val.items;
		}
		if (val.title != null){
			title = val.title;
		}
	}
	viewModel.items(items);
	viewModel.title(title);
});

viewModel.items.subscribe(function(items) {
	if (items){
		firebase.update({'items':items});	
	}
});
viewModel.title.subscribe(function(title) {
	if (title){
		firebase.update({'title':title});	
	}
});
//init
$(document).ready(function() {
    ko.applyBindings(viewModel);
    if (firstValue) {
        $('.workspace').hide();
        $('.loading').show();
    }
});
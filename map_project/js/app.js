// create variables
var map;
var infowindow;
var markers = [];
//**locations stored in Map application **//
var locations = [{ // school one
        name: 'New Generation International Schools',
        location: {
            lat: 30.169295,
            lng: 31.492914
        },
    },

    { //school two
        name: 'Cairo Manara Boys Language School',
        location: {
            lat: 30.060866,
            lng: 31.341443
        },
    },

    { //school three
        name: 'New Cairo British International School',
        location: {
            lat: 30.005818,
            lng: 31.423286
        },
    },

    { //school four
        name: 'Abbas El-Akkad Experimental Language School',
        location: {
            lat: 30.065930,
            lng:31.330173
        },
    },

    { // school five
        name: 'Roots School',
        location: {
            lat: 30.034998,
            lng: 31.338189
        },
    },
];

// Google Map API is loaded then the initMap function is executed //
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 30.0487437,
            lng: 31.3472009
        },
        zoom: 12,
    });

    // ** show markers by push marker to marker array **//
    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var name = locations[i].name;

        // **create markers **//
        var marker = new google.maps.Marker({
            position: position,
            title: name,
            animation: google.maps.Animation.DROP,
        });
        //push marker on the map by calling//
        markers.push(marker);
        marker.setMap(map);

        // **add listner to show info window content**//
        marker.addListener('click', function () {
            populateInfoWindow(this, infowindow);
        });

        mapViewModel.locations()[i].marker = marker;
    }
    var infowindow = new google.maps.InfoWindow();
};

//Dynamically Populate InfoWindow with Automated HTML//
function populateInfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {
        var schoolTitle = marker.title;
        var wikiURL = 'https://en.wikipedia.org/w/api.php?format=json&action=opensearch&search=' + schoolTitle;
        var str = "";
        $.ajax({
            url: wikiURL,
            dataType: "jsonp",
            success: function (response) {
                var articleList = response[1];
                var locName = response[0];
                if (articleList.length > 0) {
                    for (var article in articleList) {
                        if (articleList.hasOwnProperty(article)) {
                            var element = articleList[article];
                            str = "<a href='https://en.wikipedia.org/wiki/" + element + "'>" + element + "</a>"
                        }
                    }
                }
                //**Create the info window content**//
                infowindow.setContent('<div id="window"><p><i>School Title:</i> ' + marker.title + '</p>'+ ' <p>For more information visit :</p>' + str + ' </div>');
                infowindow.marker = marker;

                //**to close info window**//
                infowindow.addListener('closeclick', function () {
                    infowindow.marker = null;
                });

                //**Google Maps Bounce Animation on Marker for a limited period**//
                function toggleBounce() {
                    if (marker.getAnimation() !== null) {
                        marker.setAnimation(null);
                    } else {
                        marker.setAnimation(google.maps.Animation.BOUNCE);
                        setTimeout(function () {
                            marker.setAnimation()
                        }, 1800);
                    }
                }

                marker.addListener('click', toggleBounce());
                //**to make sure that the infowindow  is opend on it's marker**//
                infowindow.open(map, marker);
                str = "";
               },
            // handle ajax error used from stackoverflow
            error: function (xhr, ajaxOptions, thrownError) {
                   alert(xhr.status);
                   alert(thrownError);
            }
        })
      }
}
//**some functions and methods ideas are done through some github and google searches**//
var MapViewModel = function () {
    var self = this;
    self.markers = ko.observableArray([]);
    self.locations = ko.observableArray(locations);
    self.filteredArray = ko.observableArray([]);
    self.filter = ko.observable("");
    self.map = map;
    self.filteredArray = ko.computed(function () {
 // variables of knockout framwork//
        return ko.utils.arrayFilter(self.locations(), function (item) {

            // Check searched item//
            if (item.name.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1) {
                if (item.marker)
                    item.marker.setVisible(true);
            } else {
                if (item.marker)
                    item.marker.setVisible(false);
            }
            return item.name.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1;
        });
    }, self);

    //**trigger the infowindow**//
    self.triggerHandler = function (locations) {
        google.maps.event.trigger(locations.marker, 'click');
    };
};
var mapViewModel = new MapViewModel();
//**Apply the binding(knockout framework)**//
ko.applyBindings(mapViewModel);
//**error handling**//
function mapError() {
    alert("error occur! please reload");
}

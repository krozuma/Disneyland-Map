var icon;
var temp_f;
var initMap;
var map;
var locations = ko.observableArray();
var visibleLocations = ko.observableArray();
var viewModel;
var ears;
var infoWindowContent;
var animateMarkers;

//Loads weather data using the weatherundergound API
jQuery(document).ready(function ($) {
  $.ajax({
        url : "http://api.openweathermap.org/data/2.5/weather?id=5323810&units=imperial&appid=d4e70d2dd55fe0b0e50b46a61b5a5a46",
        dataType : "jsonp",
        success : function (parsed_json) {
            icon = parsed_json['weather']['0']['icon'];
            temp_f = parsed_json['main']['temp'];
            clouds = parsed_json['clouds']['all'];
            var iconUrl = "http://openweathermap.org/img/w/" + icon + ".png";
            viewModel.weatherData("<p>Current weather in Disneyland is: " +
             "<img src=" + iconUrl + "> &#124; " + "Cloud Coverage: " + clouds + "% &#124; " +
              "Temperature: " + temp_f + "&#8457</p>");
        },
        error: function () {
            alert("Data error");
        }
    });
});

var locationList =  [{name: "Radiator Springs Racers", location: {lat: 33.8052, lng: -117.9186}},
                    {name: "Star Tours – The Adventures Continue", location: {lat: 33.8119, lng: -117.9180}},
                    {name: "Pirates of the Caribbean", location: {lat: 33.8112, lng: -117.9208}},
                    {name: "Monsters, Inc. Mike & Sulley to the Rescue!", location: {lat: 33.8083, lng: -117.9173}},
                    {name: "Peter Pan's Flight", location: {lat: 33.81312, lng: -117.9189}},
                    {name: "Grizzly River Run", location: {lat: 33.80751, lng: -117.9208}},
                    {name: "Toy Story Midway Mania!", location: {lat: 33.804592, lng: -117.921725}}];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 33.810397, lng: -117.91958033},
        zoom: 15
    });

    function animateMarkers(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                marker.setAnimation(null);
            }, 1650);
        }
    }

    for (var i = 0; i < locationList.length; i++) {
    var spot = new poi(locationList[i]);
    locations().push(spot);
    }

var googleMapsInfowindow = new google.maps.InfoWindow();


for (var c = 0; c < locations().length; c++) {
  var largeInfowindow = new google.maps.InfoWindow();
  locations()[c].marker.addListener('click', listenFunction);
}

function listenFunction() {
    populateInfoWindow(this, largeInfowindow);
    animateMarkers(this);

}

viewModel = new ViewModel();

ko.applyBindings(viewModel);

}

//Loads the marker infowindow with info from the Foursquare API
function populateInfoWindow(marker, infowindow) {
  $.ajax({
        url: "https://api.foursquare.com/v2/venues/search",
        dataType: "jsonp",
        data: {
            client_id: "RKHG4BC3FZ1TA1EVSBFR5UTNLPTCX2NFC4S4GJLLVD0TW3W3",
            client_secret: "ZPNPF2Y12L1O13WAFOLKXJHAW0AV1KS0SJOR4LXWXPDZ3BD5",
            query: marker.title,
            near: "Disneyland, CA",
            v: 20180307
        },

        success: function (data) {

            var address = data.response.venues[0].location.formattedAddress[0];
            var businessName = data.response.venues[0].name;

            var content = "<h1>" + businessName + "</h1><br><p>" +
                address;

            infowindow.setContent(content);

            infowindow.open(map, marker);

            return content;
        },
        error: function () {
            alert("Data error");
        }

    });

}
  // constructor and marker maker
function poi(place) {
  var self = this;
    self.name = place.name;
    self.location = place.location;
    ears = "http://www.adiumxtras.com/images/thumbs/mickey_mouse_icon_set_1_31744_7870_thumb.png";
    self.marker = new google.maps.Marker({
        position: place.location,
        map: map,
        title: place.name,
        icon: ears,
        animation: google.maps.Animation.DROP,
        content: ""

    });

}

function googleError() {
  alert("There was a problem loading the map");
}

var ViewModel = function () {
  var self = this;

  self.weatherData = ko.observable()

  self.filter = ko.observable('');

     //Triggers marker annimation and opens infowindow of the marker that
     //corresponds to the list item
     //Thanks goes to Udacity mentors who explain how to implement this
     self.showLocation = function (locations) {
            google.maps.event.trigger(locations.marker, 'click');
        };

     //removes filtered list itme and its map marker
      self.filteredPoi = ko.computed(function () {
            var filter = self.filter().toLowerCase();
            if (!filter) {
                for (var f = 0; f < locations().length; f++) {
                  locations()[f].marker.setVisible(true);
            }

            return locations();
        } else {

              var match = ko.utils.arrayFilter(locations(), function (item) {
                var search = item.name.toLowerCase().indexOf(filter) !== -1;
                item.marker.setVisible(search)
                return search;
            });
            }
      });
  };

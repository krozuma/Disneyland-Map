//Loads weather data using the weatherundergound API
jQuery(document).ready(function ($) {
  $.ajax({
        url : "http://api.wunderground.com/api/f083a3bbb58e8dc8/geolookup/conditions/q/CA/anaheim.json",
        dataType : "jsonp",
        success : function (parsed_json) {
            var icon = parsed_json['current_observation']['icon_url'];
            var temp_f = parsed_json['current_observation']['temp_f'];
            $("#weather").html("<p>Current conditions in Disneyland are: " + "<img src=" + icon + ">" + temp_f + "&#8457 </p>");
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

var initMap;
var map;
var locations = ko.observableArray();
var visibleLocations = ko.observableArray();
var viewModel;
var infoWindowContent;
var animateMarkers;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 33.810397, lng: -117.91958033},
        zoom: 14
    });

    function animateMarkers(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                marker.setAnimation(null);
            }, 1600);
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
            var link = data.response.venues[0].url;

            var content = "<h1>" + businessName + "</h1><br><p>" +
                address + "</p><br><a href=" + link + ">" + link + "</a>";

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
    self.marker = new google.maps.Marker({
        position: place.location,
        map: map,
        title: place.name,
        animation: google.maps.Animation.DROP,
        content: ""

    });

}

function googleError() {
  alert("There was a problem loading the map");
}

var ViewModel = function () {
  var self = this;

  self.filter = ko.observable('');

     self.showLocation = function (locations) {
            google.maps.event.trigger(locations.marker, 'click');
        };

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
                return search;
            });
            for (var a = 0; a < locations().length; a++) {
              locations()[a].marker.setVisible(false);

              }
              for (var b = 0; b < match.length; b++) {
                match[b].marker.setVisible(true);
              }
              return match;
          }
      });
  };
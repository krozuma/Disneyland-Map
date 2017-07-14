jQuery(document).ready(function($) {
  $.ajax({
  url : "http://api.wunderground.com/api/f083a3bbb58e8dc8/geolookup/conditions/q/CA/anaheim.json",
  dataType : "jsonp",
  success : function(parsed_json) {
  var icon = parsed_json['current_observation']['icon_url'];
  var temp_f = parsed_json['current_observation']['temp_f'];
  $("#weather").html("<p>Current conditions in Disneyland are: " + "<img src="+ icon + ">" + temp_f + " </p>");
  }
  });



});
var markers = [];

function initMap() {
  var locations =  [{title: "Radiator Springs Racers", location: {lat: 33.8052, lng: -117.9186}, article: ""},
     {title: "Star Tours–The Adventures Continue", location: {lat: 33.8119, lng: -117.9180}, article: ""},
     {title: "Pirates of the Caribbean", location: {lat: 33.8112, lng: -117.9208}, article: ""},
     {title: "Monsters, Inc. Mike & Sulley to the Rescue!", location: {lat: 33.8083, lng: -117.9173}, article: ""},
     {title: "Toy Story Midway Mania!", location: {lat: 33.804592, lng: -117.921725}, article: ""}];

 var defaultBounds = new google.maps.LatLngBounds(
     new google.maps.LatLng(33.817170, -117.918719),
     new google.maps.LatLng(33.804312, -117.920502));

  var input = document.getElementById('user_input');
  var options = {
    strictBounds: defaultBounds,
    types: ['establishment']
};


  var autocomplete = new google.maps.places.Autocomplete(input, options);
  var largeInfowindow = new google.maps.InfoWindow();
  var map = new google.maps.Map(document.getElementById('map'), {
     center: {lat: 33.810397, lng: -117.91958033},
     zoom: 14
   });


   // The following group uses the location array to create an array of markers on initialize.
   for (var i = 0; i < locations.length; i++) {

       var marker = new google.maps.Marker({
           map: map, // Create a marker per location, and put into markers array.
           title: locations[i].title,
           article: locations[i].article,
           position: locations[i].location, // Get the position from the location array.
           animation: google.maps.Animation.DROP
      })


  var query = locations[i].title;


      // Using jQuery
      $.getJSON("https://en.wikipedia.org/w/api.php?action=parse&page=" + query + "&format=json&prop=text&section=0&callback=?",
    function(data) {
       // do something with data
       var rawData = data.parse.text['*'];
       var blurb = $('<div></div>').html(rawData);;
       // remove any references
              blurb.find('sup').remove();
   
              // remove cite error
              blurb.find('.mw-ext-cite-error').remove();
              blurb.find('a').each(function() { $(this).replaceWith($(this).html()); })
              var article = blurb.find('p');
              $('#article').html(article)
               





});
 


      // This function populates the infowindow when the marker is clicked.
      function populateInfoWindow(marker, infowindow) {
        console.log('displaying infowindow');
          // Check to make sure the infowindow is not already opened on this marker.
            infowindow.setContent('<p>' + marker.title  + '</p>');

            infowindow.marker = marker;
            // Open infowindows at respective markers
            infowindow.open(map, marker);
            infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          })


    };

      function animateMarker(marker) {
        if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}


       locations[i].marker = marker;
       // Push the marker to our array of markers.
       markers.push(marker);
       // Create an onclick event to open an infowindow at each marker.

       marker.addListener('click', function() {
         populateInfoWindow(this, largeInfowindow);


       });
       marker.addListener('click', function() {
        animateMarker(this);

       });


   };


//ViewModel function
var viewModel = function() {
   var self = this;

   var poi = function(data) {
       this.title = ko.observable(data.title);
       this.location = ko.observable(data.location);
       this.marker = null;

    };

   this.poiList = ko.observableArray([]);

   locations.forEach(function(poiItem){
     self.poiList.push(new poi(poiItem));
   });

   this.currentPoi = ko.observable(this.poiList()[0]);

   this.setPoi = function(clickedPoi) {
     self.currentPoi(clickedPoi);

    };

    this.selectedPoi = function() {


    };

     self.userInput = ko.observable('');

    this.filterPoi = function() {
      var userInput = self.userInput().toLowerCase();

      this.poiList.removeAll();

      locations.forEach(function(poiItem){
        poiItem.marker.setMap(null);

        if (poiItem.title.toLowerCase().indexOf(userInput) !== -1) {
           self.poiList.push(poiItem);
           poiItem.marker.setMap(map);
           poiItem.marker.setAnimation(google.maps.Animation.DROP);

        };



  });
  };
};

 ko.applyBindings(new viewModel());
};

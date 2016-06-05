//Official google tutorial
function initMap() {
    
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var initialLocation = new google.maps.LatLng(46.048654, 14.507567);
    var porodnisnica = new google.maps.LatLng(46.0537056, 14.5220808);
    var browserSupportFlag =  new Boolean();
    
    var mapDiv = document.getElementById('map');
    var map = new google.maps.Map(mapDiv, {
      center: {lat: 46.048654, lng: 14.507567},
      zoom: 15
    });
    directionsDisplay.setMap(map);
    
    if(navigator.geolocation) {
        browserSupportFlag = true;
        navigator.geolocation.getCurrentPosition(function(position) {
          initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
          map.setCenter(initialLocation);
          calculateAndDisplayRoute(directionsService, directionsDisplay);
        }, function() {
          handleNoGeolocation(browserSupportFlag);
        });
      }
      // Browser doesn't support Geolocation
      else {
        browserSupportFlag = false;
        handleNoGeolocation(browserSupportFlag);
      }
    
      function handleNoGeolocation(errorFlag) {
        console.log("GeoLocation unavailable, setting to default");
        map.setCenter(initialLocation);
        calculateAndDisplayRoute(directionsService, directionsDisplay);
      }

        
        function calculateAndDisplayRoute(directionsService, directionsDisplay) {
            directionsService.route({
              origin: initialLocation,
              destination: porodnisnica,
              travelMode: google.maps.TravelMode.DRIVING
            }, function(response, status) {
              if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
                var el = document.getElementById("instructions");
                console.log(response);
                var responseData = response.routes[0].legs[0];
                console.log(responseData);
                el.innerHTML = "<strong>Oddaljenost: "+responseData.distance.text +"<br/> Čas vožnje: "+ responseData.duration.text+"</strong>";
              } else {
                  console.log(response);
              }
            });
          }
    
  }

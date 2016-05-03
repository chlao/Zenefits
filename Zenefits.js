var map;
var service;
var infowindow;
var initialLocation; // Starting location for the map
var markers = []; 
var container; 
var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

function initialize(){
	container = document.getElementById('container');

	var browserSupportFlag = new Boolean(); 
	var myOptions = {
		zoom: 12, // Sets the zoom level of the map (0-22)
		mapTypeId: google.maps.MapTypeId.ROADMAP, // Type of map displayed 
		mapTypeControl: true, 
		mapTypeControlOptions: {
			position: google.maps.ControlPosition.TOP_RIGHT
		}
	}; 

	map = new google.maps.Map(document.getElementById("googleMap"), myOptions);

	// Displays content in a popup window above the map, at a given location 
	infowindow = new google.maps.InfoWindow();

	// If the browser supports geolocation 
	if(navigator.geolocation) {
	    browserSupportFlag = true;
	    // Get the user's current location 
	    navigator.geolocation.getCurrentPosition(function(position) {
		    initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
		    map.setCenter(initialLocation);

	      	if (width > 800){
				map.panBy(-200,0);
			}

    }, function(error) {

      	var errorMsg = document.getElementById('errorMsg'); 
      	var messageHead = document.createElement('span'); 
      	messageHead.style.fontWeight = 'bold'; 
      	messageHead.innerHTML = "Oh snap! ";
      	errorMsg.appendChild(messageHead);  

      	var text; 

      	switch (error.code){
      		case error.PERMISSION_DENIED: 
      			text = "You denied permission to find your location.";
      			break; 
      		case error.POSITION_UNAVAILABLE:
	            text = "Your location is unavailable.";
	            break;
	        case error.TIMEOUT:
	            text = "The request to get your location timed out."
	            break;
	        case error.UNKNOWN_ERROR:
	            text = "An unknown error occurred."
	            break;
      	}

      	var msgContents = document.createTextNode(text); 
      	errorMsg.style.left = (width - errorMsg.style.width)/2 + 'px'; 
      	errorMsg.appendChild(msgContents);  	      	

      	handleNoGeolocation(browserSupportFlag);
    });
	}
	// Browser doesn't support Geolocation
	else {
		browserSupportFlag = false;
		handleNoGeolocation(browserSupportFlag);
	}
}

function handleNoGeolocation(errorFlag) {
    if (errorFlag == true) {
		initialLocation = new google.maps.LatLng(37.7833, -122.4167); // San Francisco
    } 
    else {
    	var errorMsg = document.getElementById('errorMsg'); 
      	var messageHead = document.createElement('span'); 
      	messageHead.style.fontWeight = 'bold'; 
      	messageHead.innerHTML = "Aww shucks! ";
      	errorMsg.appendChild(messageHead);  

      	var msgContents = document.createTextNode("Your browser doesn't support geolocation. We've placed you in Siberia."); 
    	errorMsg.style.left = (width - errorMsg.style.width)/2 + 'px'; 
      	errorMsg.appendChild(msgContents); 

		initialLocation = new google.maps.LatLng(60, 105); // Siberia 
    }

    // center: LatLngLiteral object that tells the API where to center the map 
	map.setCenter(initialLocation);

	if (width > 800){
		map.panBy(-200,0);
	}
}

// Call to the PlaceService's textSearch()
function initializeSearch(input){  
	service = new google.maps.places.PlacesService(map);

	service.textSearch({
    	location: initialLocation,
    	radius: '500',  
		query: input
	}, callback);
}

// Handle the results object 
 function callback(results, status) {
 	// Delete previous markers on the map
 	if (markers.length > 0){
 		deleteMarkers(); 
 	}

 	// Delete previous listings 
 	if (document.getElementById('resultsList').firstChild){
 		deleteListings(); 
 	}
 		
  // If the results returned back successfully 
  if (status == google.maps.places.PlacesServiceStatus.OK) {
  	var resultsLen = results.length; 

  	// If there are no results found 
  	if (results.length == 0){

  	}

    for (var i = 0; i < resultsLen; i++) {
    	var currPlace = results[i]; 
    	// Create a market on the map
    	var currMarker = createMarker(currPlace); 
    	createListing(currMarker, currPlace); 
    } 
    var newLocation = results[0].geometry.location;
    map.setCenter(newLocation);
    
    if (width > 800){
 		map.panBy(-200,0);
    }
    else{
    	map.panBy(0,200);
    }

    // Wait until the images have loaded to avoid overlap
    /* Masonry Grid */
    var msnry = new Masonry('#resultsList', {
		itemSelector: '.listItem',
	    columnWidth: '.listItem', 
	    gutter: 10
	});
  }
}

function deleteMarkers(){
	var markersLen = markers.length; 
	for (var i = 0; i < markersLen; i++){
		markers[i].setMap(null); 
	}
}

function createMarker(place) {
	var marker = new google.maps.Marker({
		position: place.geometry.location, 
		map: map
	});

	// Content in the window that pops up when you click on the marker 
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(place.name);
		infowindow.open(map, this);
	});

  	markers.push(marker);

  	return marker;
}

function createListing(marker, place){
	var resultsList = document.getElementById('resultsList'); 

	// List the result
	var newResult = document.createElement('div'); 
	newResult.className += ' listItem'; 

	var placeName = document.createElement('h3');	    	

	var placeAddress = document.createElement('p');

	placeName.innerHTML = place.name; 
	placeAddress.innerHTML = place.formatted_address; 
	
	if (place.photos){
		var placeImage = document.createElement('img'); 
		placeImage.setAttribute('src', place.photos[0].getUrl({'maxWidth': 500, 'maxHeight': 500})); 

		newResult.appendChild(placeImage);
	}

	newResult.appendChild(placeName); 

	if (place.opening_hours){
		var openingHours = document.createElement('p');

		if (place.opening_hours['open_now']){
			openingHours.innerHTML = "Open Now";
		}

		openingHours.setAttribute('id', 'openNow');  

		newResult.appendChild(openingHours); 	
	}

	newResult.appendChild(placeAddress);
	resultsList.appendChild(newResult); 
	
	newResult.addEventListener('click', function(){
		map.panTo(place.geometry.location);

		map.setZoom(14); 

		// Open in the InfoWindow 
		google.maps.event.trigger(marker,'click');

	});

	// Sroll to the listing on the right
	google.maps.event.addListener(marker, 'click', function() {
		
	});
} 

function deleteListings(){
	var resultsList = document.getElementById('resultsList');

	while (resultsList.firstChild){
		resultsList.removeChild(resultsList.firstChild); 
	}
}

function submitQuery(e){
	e.preventDefault(); //Prevent input from redirecting to new page 
    var input = document.getElementsByName('query')[0].value; 
	initializeSearch(input); // Call Google API's textSearch()

	var animationID; 

	var height = window.innerHeight || document.documentElement.clientHeight ||document.body.clientHeight;

	// Animate list 
	animationID = setInterval(function(){
		// Need to place style property inline 
		if (parseInt(container.style.height) < height - 20){

			var style = window.getComputedStyle(container);

			container.style['height'] = (parseInt(container.style.getPropertyValue('height')) + 7.5) + 'px';
 
			var top = style.getPropertyValue('top');

			if (parseInt(style.getPropertyValue('width')) < 1000 && parseInt(top) > 300){
				container.style['top'] = parseInt(top) - 6 + 'px';
			}
		}
		else{
			clearInterval(animationID);
		}
	}, 5);
	
}
// Wait until the document has loaded
google.maps.event.addDomListener(window, 'load', initialize);

// Fix jQuery Masonry issue with layout upon resizing 
window.resize = function () {
	document.getElementById('resultsList').masonry('bindResize');
}
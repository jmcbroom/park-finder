var mapboxgl = require('mapbox-gl');
var _ = require('lodash');
var bbox = require('@turf/bbox');
var centroid = require('@turf/centroid');

mapboxgl.accessToken = 'pk.eyJ1IjoiY2l0eW9mZGV0cm9pdCIsImEiOiJjaXZvOWhnM3QwMTQzMnRtdWhyYnk5dTFyIn0.FZMFi0-hvA60KYnI-KivWg';

// lookup object for the filters.
// these should match columns in the table that are set to 1 or null.
var FILTERS = {
  "aerobics": "Aerobics",
  "archery": "Archery",
  "baseball": "Baseball",
  "basketball": "Basketball",
  "boxing": "Boxing",
  "chess": "Chess",
  "dance": "Dance",
  "dog_run": "Dog Park",
  "golf": "Golf",
  "horseshoes": "Horseshoes",
  "lacrosse": "Lacrosse",
  "nature": "Nature",
  "racquetball": "Racquetball",
  "picnic": "Picnic Tables",
  "playground": "Playground",
  "pool": "Pool",
  "restrooms": "Restrooms",
  "sled_hill": "Sled Hill",
  "soccer": "Soccer",
  "tennis": "Tennis",
  "trails": "Trails",
  "volleyball": "Volleyball",
  "walking": "Walking",
  "weights": "Weights",
  "yoga": "Yoga",
  "zumba": "Zumba"
}

// make a map object
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/cityofdetroit/cix0w7n08000v2qpb2q15raq1',
    zoom: 10.7,
    center: [-83.091, 42.350],
    // :triangular_ruler:
    bearing: -1.25,
    minZoom: 9,
    maxBounds: [
        [-83.611, 42.100],
        [-82.511, 42.600]
    ]
});

// add nav and geolocation controls to the map
var nav = new mapboxgl.NavigationControl();
var geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    }
});
map.addControl(nav, 'top-left');
map.addControl(geolocate, 'top-left');

var popup = new mapboxgl.Popup({
    closeButton: false
});

// do all the things when the map loads
map.on('load', function() {
  // add the GeoJSON from our ArcServer
  map.addSource('parks', {
    type: 'geojson',
    data: 'https://gis.detroitmi.gov/arcgis/rest/services/Parks/ParksAndRec/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=5&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson'
  })

  // add a fill layer
  map.addLayer({
    "id": "parks-fill",
    "type": "fill",
    "source": "parks",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
        "fill-color": "green",
        "fill-opacity": 0.25
    }
  })

  // add an outline layer
  map.addLayer({
    "id": "parks-line",
    "type": "line",
    "source": "parks",
    "layout": {
      "visibility": "visible",
      "line-join": "round"
    },
    "paint": {
        "line-color": "black",
        "line-opacity": 0.8,
        "line-width": {
            stops: [
                [8, 0.1],
                [11, 0.5],
                [13, 1.5],
                [17, 2.5],
                [22, 4]
            ]
        }
    }
  })

  // vars for containers
  var filterPicker = document.getElementById('filter-picker');
  var filterPickerContainer = document.getElementById('filter-picker-container');
  var parkList = document.getElementById('list-container');
  var parkDetails = document.getElementById('detail-container');

  // this button resets everything
  var resetButton = document.getElementById('reset');
  resetButton.addEventListener('click', function() {resetMap();});

  // this button zooms out to Detroit
  var zoomButton = document.getElementById('zoomToCity');
  zoomButton.addEventListener('click', function() {zoomToCity();});

  // start with no filter, and no picked filters
  var filter = null;
  var pickedFilters = [];

  // i found this on stack overflow. extends the DOM to add a .remove() function for a NodeList
  // https://stackoverflow.com/questions/3387427/remove-element-by-id
  Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
  }
  NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
      for(var i = this.length - 1; i >= 0; i--) {
          if(this[i] && this[i].parentElement) {
              this[i].parentElement.removeChild(this[i]);
          }
      }
  }

  // this is from the Mapbox example for "list all rendered features"
  // https://www.mapbox.com/mapbox-gl-js/example/filter-features-within-map-view/
  function getUniqueFeatures(array, comparatorProperty) {
      var existingFeatureKeys = {};
      // Because features come from tiled vector data, feature geometries may be split
      // or duplicated across tile boundaries and, as a result, features may appear
      // multiple times in query results.
      var uniqueFeatures = array.filter(function(el) {
          if (existingFeatureKeys[el.properties[comparatorProperty]]) {
              return false;
          } else {
              existingFeatureKeys[el.properties[comparatorProperty]] = true;
              return true;
          }
      });
      // sort them alphabetically
      return _.sortBy(uniqueFeatures, [function(f) { return f.properties.name; }]);
  }

  // when you click on a park, fly to it and populate the details-container
  function clickOnPark(p) {
    // zoom to the park, but not too close
    var flyBbox = bbox(p.geometry);
      map.fitBounds([
        [flyBbox[0], flyBbox[1]],
        [flyBbox[2], flyBbox[3]]
      ], { padding: 200, maxZoom: 15.5 });

    // get all the amenities for the park
    var parkAmenities = [];
    Object.keys(p.properties).forEach(function(a){
      if (p.properties[a] == 1) {
        parkAmenities.push(FILTERS[a]);
      }
    });

    // html for all parks
    var parkHtml = `
    <span>Park name: <b>${p.properties.name}</b></span>
    <span>Address: <b>${p.properties.address}</b></span>
    <hr>
    <span><b>Available activities:<br/></b> ${parkAmenities.join(', ')}</span>
    `

    // if it has a rec center, toss this in there
    if (p.properties.rec_center_name != 'null') {
      var recCtrHtml = `
        <span><b>Recreation Center:</b><br/> ${p.properties.rec_center_name}</span>
        <span><b>Hours of Operation:</b><br/> ${p.properties.opening_hours}</span>
        <br/>
      `
      parkDetails.innerHTML = recCtrHtml + parkHtml;
    }
    else {
      parkDetails.innerHTML = parkHtml;
    }
  }


  function resetMap() {
    zoomToCity();

    // remove filters
    map.setFilter('parks-fill', null);
    map.setFilter('parks-line', null);

    // remove filter items
    var filtersToRemove = document.getElementsByClassName("filter-item").remove();

    // clear park details
    parkDetails.innerHTML = '';
    // clear park list
    while (parkList.firstChild) {
      parkList.removeChild(parkList.firstChild);
    }
    // empty pickedFilters
    pickedFilters = [];
  }

  function zoomToCity(){
    map.fitBounds([
      [-83.2878, 42.2551],
      [-82.9104, 42.4502]
    ], { padding: 50})
  }

  // this fires when the filters change.
  function filterUpdateHandler() {
    // set no filter
    filter = null;
    // are some filters picked? add the filter
    if (pickedFilters.length > 0){
      filter = ['any'];
      pickedFilters.forEach(function(f){
        filter.push(['==', f, 1])
      });
    }
    // set that filter
    map.setFilter('parks-fill', filter);
    map.setFilter('parks-line', filter);

    // give a slight delay before populating the parks list
    setTimeout(function(){
      var parks = map.queryRenderedFeatures({
          layers: ['parks-fill'],
          filter: filter
        });

      // remove all listed parks
      while (parkList.firstChild) {
        parkList.removeChild(parkList.firstChild);
      }
      // get all the unique rendered parks
      var features = getUniqueFeatures(parks, 'ogc_fid')
      if (features) {
        // push them to the list-container
        features.forEach(function(p){
          var park = document.createElement('span');
          park.innerHTML = `<b>${p.properties.name}</b><br /><i>(${p.properties.address})</i>`
          park.addEventListener('mouseover', function() {
              // on mouseover, highlight the park on the map
              var geomCentroid = centroid(p.geometry)
              popup.setLngLat(centroid(p.geometry).geometry.coordinates)
                  .setText(p.properties.name + ' (' + p.properties.address + ')')
                  .addTo(map);
          });
          park.addEventListener('mouseout', function() {
              popup.remove();
          });
          // if you click on the entry, we want to fly there and add the details
          park.addEventListener('click', function() {
            clickOnPark(p);
          });
          parkList.appendChild(park)
        })
      }
    }, 100);
  }

  // fires when a filter is added
  function addFilterHandler(e){
    var selected = document.createElement('span')
    selected.textContent = e.target.value + " ";
    selected.className = "filter-item";
    selected.id = e.target.selectedOptions[0].id
    // remove it if you click it
    selected.onclick = function(){
      removeFilterHandler(this.id)
      this.parentNode.removeChild(this);
    }
    filterPickerContainer.appendChild(selected);
    // add the filter to pickedFilters
    pickedFilters.push(e.target.selectedOptions[0].id)
    // call the update function
    filterUpdateHandler();
  };

  // fires when a filter is removed
  function removeFilterHandler(id){
    _.remove(pickedFilters, function(d){
      return d == id;
    });
    // if we remove the last filter, reset the whole thing
    if (pickedFilters.length == 0) {
      resetMap();
    };
    // call the update function
    filterUpdateHandler();
  };

  // call addFilterHandler if you pick a new filter from the dropdown
  filterPicker.addEventListener('change', function(e){ addFilterHandler(e)} );

  // if you move the map; update the filtered maps
  map.on('moveend', function() {filterUpdateHandler()});

  // we want to add the park detail if you click on a park
  map.on('click', function(e){
    var features = map.queryRenderedFeatures(e.point, { layers: ['parks-fill'] });
    if (!features.length) {
        return;
    }
    else {
      clickOnPark(features[0]);
    }
  })

  // populate the filter list
  Object.keys(FILTERS).forEach(function(f){
    var option = document.createElement('option');
    option.innerHTML = FILTERS[f];
    option.id = f;
    filterPicker.appendChild(option);
  })
})

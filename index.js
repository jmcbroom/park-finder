var mapboxgl = require('mapbox-gl');

mapboxgl.accessToken = 'pk.eyJ1Ijoiam1jYnJvb20iLCJhIjoianRuR3B1NCJ9.cePohSx5Od4SJhMVjFuCQA';

// here are the filters
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

// make a map objects
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/jmcbroom/cixs0h7mr001m2ro6gbvjgufn',
    doubleClickZoom: false,
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

var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-right');

map.on('load', function() {
  map.addSource('parks', {
    type: 'geojson',
    data: 'http://gis.detroitmi.gov/arcgis/rest/services/Parks/ParksAndRec/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=5&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson'
  })

  map.addLayer({
    "id": "parks-fill",
    "type": "fill",
    "source": "parks",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
        "fill-color": "green",
        "fill-opacity": 0.15
    }
  })
  map.addLayer({
    "id": "parks-line",
    "type": "line",
    "source": "parks",
    "layout": {
      "visibility": "visible",
      "line-join": "round"
    },
    "paint": {
        "line-color": "#189ACA",
        "line-opacity": 0.75,
        "line-width": {
            stops: [
                [8, 0.1],
                [11, 0.25],
                [13, 0.75],
                [22, 2]
            ]
        }
    }
  })

  // attach ze filters
  var filterGroup = document.getElementById('filter-group');
  Object.keys(FILTERS).forEach(function(f){
    console.log(FILTERS[f])
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.id = f;
    input.checked = true;
    filterGroup.appendChild(input);

    var label = document.createElement('label');
    label.setAttribute('for', f);
    label.textContent = FILTERS[f];
    filterGroup.appendChild(label);

    // when you check or uncheck, change the filter.
    input.addEventListener('change', function(e) {
      var inputs = document.getElementsByTagName("input");
      var filter = [
        "any"
      ]
      for(var i = 0; i < inputs.length; i++) {
          if(inputs[i].type == "checkbox" && inputs[i].checked == true) {
              filter.push(["==", inputs[i].id, 1])
          }
      }
      map.setFilter('parks-fill', filter);
      map.setFilter('parks-line', filter);
      console.log(filter);
      var parks = map.queryRenderedFeatures({layers: ['parks-fill'], filter: filter});
      console.log(parks)
    });
  })


})

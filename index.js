var Slideout = require('slideout');
var mapboxgl = require('mapbox-gl');
var _ = require('lodash');
var centroid = require('@turf/centroid');
var bbox = require('@turf/bbox');

var thisSlideout = new Slideout({
  'panel': document.getElementById('map-container'),
  'menu': document.getElementById('menu'),
  'touch': true,
  'padding': 320,
  'tolerance': 70
});

// Toggle button
document.querySelector('.toggle-button').addEventListener('click', function() {
  thisSlideout.toggle();
});

mapboxgl.accessToken = 'pk.eyJ1IjoiY2l0eW9mZGV0cm9pdCIsImEiOiJjaXZvOWhnM3QwMTQzMnRtdWhyYnk5dTFyIn0.FZMFi0-hvA60KYnI-KivWg';

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

// lookup object for the filters.
var FILTERS = {
  // "aerobics": "Aerobics",
  // "archery": "Archery",
  "baseball": "Baseball",
  "basketball": "Basketball",
  // "boxing": "Boxing",
  "chess": "Chess",
  // "dance": "Dance",
  "dog_run": "Dog Park",
  "golf": "Golf",
  "horseshoes": "Horseshoes",
  // "lacrosse": "Lacrosse",
  "natural_area": "Nature Area",
  // "racquetball": "Racquetball",
  "picnic": "Picnic Tables",
  "playground": "Playground",
  // "pool": "Pool",
  "restrooms": "Restrooms",
  "sled_hill": "Sled Hill",
  "soccer": "Soccer",
  "tennis": "Tennis",
  "trails": "Trails",
  // "volleyball": "Volleyball",
  "walking": "Walking"
  // "weights": "Weights",
  // "yoga": "Yoga",
  // "zumba": "Zumba"
}

// add nav and geolocation controls to the map
var nav = new mapboxgl.NavigationControl();
var geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    }
});
map.addControl(nav, 'bottom-right');
map.addControl(geolocate, 'bottom-right');

// do all the things when the map loads
map.on('load', function() {

  function clickOnPark(p) {
    // zoom to the park, but not too close
    var fb = bbox(p.geometry);
    var flybox = [[fb[0], fb[1]], [fb[2], fb[3]]]
    map.fitBounds(flybox, { padding: 100, maxZoom: 16 })
  };

  // add park and rec center sources
  map.addSource('parks', {
    type: 'geojson',
    data: 'https://gis.detroitmi.gov/arcgis/rest/services/DoIT/ParksDEV/FeatureServer/1/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=5&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson'
  })
  map.addSource('rec-centers', {
    type: 'geojson',
    data: 'https://gis.detroitmi.gov/arcgis/rest/services/DoIT/ParksDEV/FeatureServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=5&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson'
  })

  // add parks fill & line layer
  map.addLayer({
    "id": "parks-fill",
    "type": "fill",
    "source": "parks",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
        "fill-color": "green",
        "fill-opacity": {
          stops: [
            [8, 0.05],
            [18, 0.3]
          ]
        }
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

  // add a rec center point layer
  map.addLayer({
    "id": "rec-center-symbol",
    "type": "symbol",
    "source": "rec-centers",
    "layout": {
        "icon-image": "star-15",
        "text-field": "{name}",
        "text-size": {
          stops: [
            [10, 12],
            [20, 24]
          ]
        },
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-offset": [0, 1.5],
        "text-anchor": "bottom"
      },
    "paint": {
        "text-color": "rgba(40,120,160,0.9)",
        "text-halo-color": "rgba(240,240,240,0.1)",
        "text-halo-width": 1.5,
        "icon-color": "red"
    }
  })


  function featClicked(feat){
    console.log(feat)
    var featCentroid = centroid(feat.geometry)
    console.log(feat.layer.id)
    switch (feat.layer.id){
      case 'parks-fill':
        var html = `
          <span class=""><b>Park: ${feat.properties.name}</b></span><br/>
          <span class="b">Address: ${feat.properties.address}</span><br/>
          `;
        break;
      case 'rec-center-symbol':
        var html = `
          <span class=""><b>Rec Center: ${feat.properties.name}</b></span><br/>
          <span class="b">Address: ${feat.properties.address}</span><br/>
          `;
        break;
    }
    console.log(html)
    var popup = new mapboxgl.Popup();
    popup.setLngLat(featCentroid.geometry.coordinates).setHTML(html).addTo(map);
  }

  function flyTo(p){
    var fb = bbox(p.geometry);
    var flybox = [[fb[0], fb[1]], [fb[2], fb[3]]]
    map.fitBounds(flybox, { padding: 50, maxZoom: 17 })
  }

  map.on('click', function (e) {
      var features = map.queryRenderedFeatures(e.point, { layers: ['parks-fill', 'rec-center-symbol'] });
      if (!features.length) {
          return;
      }
      featClicked(features[0])
  });


  map.on('moveend', function() {
    var qu_parks = map.queryRenderedFeatures({
      layers: ['parks-fill'],
    });
    var qu_centers = map.queryRenderedFeatures({
      layers: ['rec-center-symbol'],
    });
    var parks_to_show = getUniqueFeatures(qu_parks, 'ogc_fid');
    var centers_to_show = getUniqueFeatures(qu_centers, 'ogc_fid');

    var parkList = document.getElementById('parks')
    while (parkList.firstChild) {
      parkList.removeChild(parkList.firstChild);
    }
    parks_to_show.forEach(function(p){
      var park = document.createElement('span');
      park.innerHTML = `<b>${p.properties.name}</b><br /><i>(${p.properties.address})</i>`;
      park.addEventListener('mousedown', function() {
        flyTo(p);
      });
      parkList.appendChild(park)
    })

    var recList = document.getElementById('rec_centers')
    while (recList.firstChild) {
      recList.removeChild(recList.firstChild);
    }
    centers_to_show.forEach(function(c){
      var rec = document.createElement('span');
      rec.innerHTML = `<b>${c.properties.name}</b><br /><i>(${c.properties.address})</i><br /><i>(${c.properties.opening_hours})</i>`;
      rec.addEventListener('mousedown', function() {
        flyTo(c);
      });
      recList.appendChild(rec)
    })
  });
})

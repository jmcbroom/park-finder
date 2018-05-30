var Slideout = require('slideout');
var mapboxgl = require('mapbox-gl');
var _ = require('lodash');
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

var geocode_search = document.getElementById('search_geocoder')

// TODO: Listen for suggest
// geocode_search.addEventListener('input', function(){
//   console.log(geocode_search.value)
// })

mapboxgl.accessToken = 'pk.eyJ1IjoiY2l0eW9mZGV0cm9pdCIsImEiOiJjaXZvOWhnM3QwMTQzMnRtdWhyYnk5dTFyIn0.FZMFi0-hvA60KYnI-KivWg';

// make a map object
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/cityofdetroit/cj1gxcmoh001h2rr06vhx3dy8',
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
  "baseball": "Baseball",
  "basketball": "Basketball",
  "chess": "Chess",
  "dog_run": "Dog Park",
  "golf": "Golf",
  "horseshoes": "Horseshoes",
  "natural_area": "Nature Area",
  "picnic": "Picnic Tables",
  "playground": "Playground",
  "restrooms": "Restrooms",
  "sled_hill": "Sled Hill",
  "soccer": "Soccer",
  "tennis": "Tennis",
  "trails": "Trails",
  "walking": "Walking"
}

// add nav and geolocation controls to the map
var nav = new mapboxgl.NavigationControl();
var geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    }
});
map.addControl(nav, 'top-right');
map.addControl(geolocate, 'top-right');

// do all the things when the map loads
map.on('load', function() {

  var info_window = document.getElementById('info')

  // add park and rec center sources
  map.addSource('parks', {
    type: 'geojson',
    data: 'https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/ParksRec/FeatureServer/2/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=5&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&f=geojson'
  })
  map.addSource('rec-centers', {
    type: 'geojson',
<<<<<<< HEAD
    data: 'https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/ParksRec/FeatureServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=5&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson'
=======
    data: 'https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/RecCentersFall2017/FeatureServer/0/query?where=type+not+in+%28%27Summer+Fun+Center%27%29&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnHiddenFields=false&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson'
>>>>>>> parent of 3e2e084... Revert "latch :key:"
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
    "type": "circle",
    "source": "rec-centers",
    'paint': {
        // make circles larger as the user zooms from z12 to z22
        'circle-radius': {
            'base': 1,
            'stops': [[9, 4], [19, 15]]
        },
        'circle-stroke-color': 'rgba(0,0,0, 0.6)',
        'circle-stroke-width': 1.5,
        'circle-color': {
            property: 'type',
            type: 'categorical',
            stops: [
<<<<<<< HEAD
                ['Summer Fun Center', 'rgba(255,172,27,0.9)'],
=======
                ['After School Center', 'rgba(255,172,27,0.9)'],
>>>>>>> parent of 3e2e084... Revert "latch :key:"
                ['City Rec Center', 'rgba(0, 153, 204, 0.9)'],
                ['Partner Rec Center', 'rgba(220,148,255,0.9)']]
        }
    }
  })

  function featClicked(feat){
    if(thisSlideout.isOpen()) {
      thisSlideout.close();
    }
    switch (feat.layer.id){
      case 'parks-fill':
        var amenities = []
        Object.keys(feat.properties).forEach(function(p){
          if(feat.properties[p] == 1){
            amenities.push(FILTERS[p])
          }
        })
        var html = `
          <span class=""><b>Park: ${feat.properties.name}</b></span><br/>
          <span class=""><b>Address:</b> ${feat.properties.address}</span><br/>
          <span class=""><b>Amenities:</b> ${amenities.join(', ')}</span><br/>
          `;
          // add these for mow dates:
          // <span class=""><b>Last Mow Date:</b> ${feat.properties.last_mow_date}</span><br/>
          // <span class=""><b>Next Mow Date:</b> ${feat.properties.next_mow_date}</span><br/>
        break;
      case 'rec-center-symbol':
        var html = `
          <span class=""><b>${feat.properties.type}: ${feat.properties.name}</b></span><br/>
          <span class="b"><b>Address:</b> ${feat.properties.address}</span><br/>
          `;
          // <span class="b"><b>Amenities:</b> ${feat.properties.activities}</span><br/>
          // <span>${feat.properties.details}</span><br/>
        break;
    }
    info_window.innerHTML = html;
  }

  function flyToPolygon(p){
    var fb = bbox(p.geometry);
    var flybox = [[fb[0], fb[1]], [fb[2], fb[3]]]
    map.fitBounds(flybox, { padding: 100, maxZoom: 15.25 })
    featClicked(p)
  }

  geocode_search.addEventListener('keypress', function(e){
    if(e.key == "Enter"){
      var geocode_url = `https://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer/findAddressCandidates?Street=&City=&ZIP=&SingleLine=${geocode_search.value.replace(' ','+')}&outSR=4326&f=json`
      fetch(geocode_url).then(function(response) {
        return response.json();
      }).then(function(data) {
        var coords = data['candidates'][0]['location']
        map.flyTo({
          center: [coords['x'],coords['y']],
          zoom: 14
        });
      }).catch(function() {
        console.log("Booo");
      });
    }
  })

  map.on('click', function (e) {
      var features = map.queryRenderedFeatures(e.point, { layers: ['parks-fill', 'rec-center-symbol'] });
      if (!features.length) {
          return;
      }
      flyToPolygon(features[0])
      featClicked(features[0])
  });

  function updateSidebar() {
    console.log('updateSidebar()')
    var qu_parks = map.queryRenderedFeatures({
      layers: ['parks-fill'],
    });
    var qu_centers = map.queryRenderedFeatures({
      layers: ['rec-center-symbol'],
    });
    var parks_to_show = getUniqueFeatures(qu_parks, 'ogc_fid');
    var centers_to_show = getUniqueFeatures(qu_centers, 'name');
    console.log(centers_to_show)

    var parkList = document.getElementById('parks')
    while (parkList.firstChild) {
      parkList.removeChild(parkList.firstChild);
    }
    centers_to_show.forEach(function(c){
      var rec = document.createElement('p');
      rec.classList.add(`${c.properties.type}`.toLowerCase().replace(/\s/g, '-'))
      rec.innerHTML = `<b><span class="rec-center-name">&#x2605; ${c.properties.name}</b></span> (${c.properties.address})<br /><i>${c.properties.type}</i><br />${c.properties.opening_hours}`;
      rec.addEventListener('mousedown', function() {
        flyToPolygon(c);
      });
      parkList.appendChild(rec)
    })
    parks_to_show.forEach(function(p){
      var park = document.createElement('p');
      park.classList.add('park-listitem')
      park.innerHTML = `<b>${p.properties.name}</b> (${p.properties.address}) <br /><i>${p.properties.class} Park</i><br />`;
      park.addEventListener('mousedown', function() {
        flyToPolygon(p);
      });
      parkList.appendChild(park)
    })
  }

  map.on('moveend', function() {
    updateSidebar();
  });

  window.setTimeout(map.zoomTo(10.69), 1000);
})

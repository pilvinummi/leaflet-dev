
function init() {
  
  //Laitetaan kaikki muuttujat tahan...
  document.getElementById("none").checked = true;
  var information = document.getElementById('information');
  var removeButton = document.getElementById('remove');
  var resetButton = document.getElementById('reset');
  
  var legend = L.control({position: 'bottomleft'});
  
  //Kaytetaan valmiiksi ladattua aineistoa -> on huomattavasti nopeampi kuin aina ladata aineisto uudestaan
  var all = "https://pesonet1.github.io/Leaflet/all.json"
  var paavo_wfs = "https://pesonet1.github.io/Leaflet/paavo.json"
  
  //Geojson-objektit lisataan tasot grouppiin
  var tasot = new L.LayerGroup();
  var kaikki = new L.LayerGroup();
  
  //Muuttujat filterointiin
  var filter;
  var fillcolor;
  var radius;
 
  
  var southWest = L.latLng(60.082097, 24.786873);
  var northEast = L.latLng(60.327415, 25.322456);
  var bounds = L.latLngBounds(southWest, northEast);
  
  
  var map = L.map('map', {
    //center: new L.LatLng(60.192871, 25.049858), //(60.1708, 24.9375),
    maxBounds: bounds,
    zoom: 12,
    maxZoom: 18,
    minZoom: 11
  });
  
  //Fit to bounds
  map.fitBounds(bounds);
  	
  //Scale
  L.control.scale({
  	position: 'bottomleft',
  	updateWhenIdle: true,
  	maxWidth: 200
  }).addTo(map);
  
  
  //MapBox-light taustakartta
  basemap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicGVzb25ldDEiLCJhIjoiY2lqNXJua2k5MDAwaDI3bTNmaGZqc2ZuaSJ9.nmLkOlsQKzwMir9DfmCNPg', {
    maxZoom: 18,
    id: 'mapbox.light'
  }).addTo(map);


  
  //Taman funktion avulla uusi karttataso voidaan kutsua kayttaen haluttua filteria ja tason varia
  function update_layer() {
    var viheralueet = $.ajax({
      url: all,
      type: 'GET',
      success: function(response) {
        viheralueet = L.geoJson(response, {
          style: function (feature) {
            var fillColor, 
            kaytto = feature.properties.kayttotarkoitus;
            
            if ( kaytto.indexOf(filter) > -1 ) fillColor = fillcolor;
          
            return {
      	      color: "black", 
      	      weight: 1, 
      	      fillColor: fillColor, 
      	      fillOpacity: 0.8 
            };
            
          },
          filter: function(feature, layer) {return (feature.properties.kayttotarkoitus == filter);},
          onEachFeature: onEachFeature_viheralueet
            
        }).addTo(tasot);
      }
    });
  }
 
  
  //Oma funktio kaikkien viheralueiden hankkimiselle, myös varit ovat ennalta maaritelty
  function update_all() {
    var viheralueet = $.ajax({ 
      url: all,
      type: 'GET',
      success : function (response) {
        viheralueet = L.geoJson(response, {
          style: function (feature) {
            var fillColor, 
            kaytto = feature.properties.kayttotarkoitus;
      
            if ( kaytto.indexOf("semakaavoitettu") > -1) fillColor = "#336666";
            else if ( kaytto.indexOf("Yleiskaavan viheralue") > -1 ) fillColor = "#336666";
            else if ( kaytto == "Ulkoilumetsä" ) fillColor = "#669966";
            
            
            else if ( kaytto == "Kesämaja-alue" || kaytto == "Siirtolapuutarha") fillColor = "#666699";
            else if ( kaytto == "Viljelypalsta" || kaytto == "Viljelypalsta-alue") fillColor = "#003366";            
            else if ( kaytto == "Koira-aitaus" ) fillColor = "#666633";
            else if ( kaytto == "Leikkipaikka" || kaytto == "Leikkipuisto" ) fillColor = "#663399";
            else if ( kaytto == "Uimaranta-alue" || kaytto == "Venesatama / Venevalkama" ) fillColor = "#66cccc";
            
            else if ( kaytto == "Kartano- ja huvila-alue" ) fillColor = "#996699";
            else if ( kaytto == "Luonnonsuojelualue" ) fillColor = "#336699";
            else if ( kaytto.indexOf("luonnonsuojelualue") > -1 ) fillColor = "#336699";
            else if ( kaytto.indexOf("Haudat") > -1 ) fillColor = "#666666";
            
            else if ( kaytto == "Muut viheralueet" ) fillColor = "#336666";
            else fillColor = "#336666";  // no data
		      
          //Muu toimiluokka
          //Yleiskaavan viheralue / luonnonsuojelualue
          //Yleiskaavan viheralue / kesämaja-alue
          //Yleiskaavan viheralue / kartanoalue
          //Yleiskaavan viheralue / leikkipuisto
          //Yleiskaavan viheralue
          //Yleiskaavan viheralue / erityiskohteet
          //Yleiskaavan viheralue / koira-aitaus
          //Tontti (rakentamattomat / sopimus)
          //Erityiskohteet, asemakaavoitettu viheralue
          //Haudat (hautausmaat)
          //Suojaviheralue
          //Katualue
          //Rata-alue
          //Saari (saaret ilman siltayhteyttä)
      
            return {
      	      color: "black", 
      	      weight: 1, 
      	      fillColor: fillColor, 
      	      fillOpacity: 0.8 
            };
                    	
          },
          onEachFeature: onEachFeature_viheralueet
        
        }).addTo(kaikki);
      }
    });
    
    kaikki.addTo(map);
  }
  
  
  //Taman tarkoituksena on mahdollistaa popupin ja muiden funktioiden toimimisen viheralueet-tasoilla
  function onEachFeature_viheralueet(feature, layer) {
    
    popupOptions = {maxWidth: 200, closeOnClick: true};
    var content = "<b>Viheralueen tunnus: </b> " + feature.properties.viheralue_id +
        "<br><b>Nimi: </b> " + feature.properties.puiston_nimi +
        "<br><b>Käyttötarkoitus: </b> " + feature.properties.kayttotarkoitus +
        "<br><b>Käyttötarkoitus id: </b> " + feature.properties.kayttotarkoitus_id +
        "<br><b>Pinta-ala: </b> " + Math.round(feature.properties.pinta_ala) + " m2";

    //Jostain syysta funktio ei saa radius-arvoa...
    if (this.radius == null) {
      layer.bindPopup(content, popupOptions);
    } else {
      //ei siirryta koskaan else ehtoon...
      alert("toimi ny");
      layer.unbindPopup();
    }
    
    layer.on({
      mousemove: mousemove,
      mouseout: mouseout, 
      click: addBuffer
    });
  }



  //Paavo-aineisto
  var paavo_layer = $.ajax({ 
    url: paavo_wfs,
    datatype:"json",
    jsonCallback: 'getJson',
    success : function (response) {
      paavo = L.geoJson(response, {
        style: function (feature) {
          var fillColor, 
          vaki = feature.properties.he_vakiy,
          ala = feature.properties.pinta_ala / 1000000,
          astiheys = vaki / ala;
                      
          if ( astiheys > 12000) fillColor = "#a63603";
          else if ( astiheys > 10000) fillColor = "#d94801";
          else if ( astiheys > 8000 ) fillColor = "#f16913";
          else if ( astiheys > 6000 ) fillColor = "#fd8d3c";
          else if ( astiheys > 4000 ) fillColor = "#fdae6b";
          else if ( astiheys > 2000 ) fillColor = "#fdd0a2";
          else if ( astiheys > 1000 ) fillColor = "#fee6ce";
          else if ( astiheys > 0 ) fillColor = "#fff5eb";
          else fillColor = "#ffffff";  // no data
      
          return {
      	    color: "#fff",
      	    weight: 2,
      	    fillColor: fillColor,
      	    fillOpacity: 0.5 
          };
		      
          },
          onEachFeature: function (feature, layer) {
            
            layer.on('click', function() {
              information.innerHTML = '';
              information.innerHTML = ("<b>Alueen nimi: </b> " + feature.properties.nimi +
              "<br><b>Pinta-ala: </b> " + Math.round(feature.properties.pinta_ala) + " m2" +
              "<br><b>Asukasmäärä: </b> " + feature.properties.he_vakiy +
              "<br><b>Asukastiheys: </b> " + Math.round(feature.properties.he_vakiy / (feature.properties.pinta_ala / 1000000)) + " as/k-m2" +
              "<br><b>Asuntojen määrä: </b> " + feature.properties.ra_asunn +
              "<br><b>Asumisväljyys: </b> " + Math.round(feature.properties.te_as_valj));
            });
        
          layer.on({
            click: zoomToFeature
          });    
                      
        }
      }).addTo(map);
    }
  }); 
  
  
  //Tyhjentaa containerin, kun klikataan muuta kuin kuin kohdetta
  map.on('click', function(e) {
  	information.innerHTML = '';
  });
  
  
  //Tasojen funktioita: kohteeseen zoomaus ja kohteen korostus
  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
    //map.setZoom(14);
  }


  function mousemove(e) {
    var layer = e.target;
	
    layer.setStyle({
      weight: 3,
      opacity: 0.3,
      fillOpacity: 0.9
    });
	
    if (!L.Browser.ie && !L.Browser.opera) {
      layer.bringToFront();
    }
  }


  function mouseout(e) {
    var layer = e.target;
    
    //"Palauttaa" tyylin takaisin
    layer.setStyle({
      weight: 1,
      //opacity: 1,
      fillOpacity: 0.8
    });
  }


  //Funktio bufferin luonnista, joka luodaan viheralueetta klikatessa
  function addBuffer(e) {
    var layer = e.target;
   
    if (radius != null) {
      var layer_geojson = layer.toGeoJSON();
      var buffered = turf.buffer(layer_geojson, radius, 'miles');
      var buffer_layer = L.geoJson(buffered).addTo(map);
      
      //Asetetaan bufferin tyyli
      buffer_layer.setStyle({
      	color: "red",
        weight: 2,
        fillColor: "orange",
        opacity: 1,
        fillOpacity: 0.5
      });
      
    }
  
    //Bufferin poisto-nappia varten tarvitaan sille eventlistener
    removeButton.addEventListener('click',function(event) {
      buffer_layer.clearLayers();
    });
  }
  
  
  function getColor(d) {
    return d > 12000  ? "#a63603" :
    	   d > 10000  ? "#d94801" :
    	   d > 8000   ? "#f16913" :
	   d > 6000   ? "#fd8d3c" :
           d > 4000   ? "#fdae6b" :
	   d > 2000   ? "#fdd0a2" :
	   d > 1000   ? "#fee6ce" :
	   d > 0      ? "#fff5eb" :
	                "#ffffff";
  }

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1000, 2000, 4000, 6000, 8000, 10000, 12000],
        labels = [];
        
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
  };
  
  legend.addTo(map);
	
  
  
  none.addEventListener('change', function() {
    radius = null;
  });
  	
  //Bufferikoon 150m eventlisteneri
  box_150.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      radius = 150 * 0.000621371192;
    } else {
      radius = null;
    }
  });
 
  //Bufferikoon 300m eventlisteneri
  box_300.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      radius = 300 * 0.000621371192;
    } else {
      radius = null;
    }
  });



  //Kaikkien viheralueiden eventlistener
  karttataso.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      update_all();
    } else {
      map.removeLayer(kaikki);
    }
  });
  
  
  
  resetButton.addEventListener('click',function(event) {
      tasot.clearLayers();
      //Nollataan checkboxit
    });
  
  
  
  //Loput eventlistenerit eri tasoille
  ulkoilumetsa.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      filter = "Ulkoilumetsä"
      fillcolor = "#336666"
      update_layer();
      tasot.addTo(map);
    } else {
      map.removeLayer(ulkoilumetsa);
    }
  });

  kartano.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      filter = "Kartano- ja huvila-alue"
      fillcolor = "#996699"
      update_layer();
      tasot.addTo(map);
    } else {
      map.removeLayer(tasot);
    }
  });
  
  kesamaja.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      fillcolor = "#666699"
      filter = "Kesämaja-alue" 
      update_layer();
      tasot.addTo(map);
    } else {
      map.removeLayer(tasot);
    }
  });
  
  siirtola.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      fillcolor = "#666699"
      filter = "Siirtolapuutarha"
      update_layer();
      tasot.addTo(map);
    } else {
      map.removeLayer(tasot);
    }
  });
  
  viljelypalsta.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      fillcolor = "#666699"
      filter = "Viljelypalsta"
      update_layer();
      tasot.addTo(map);
    } else {
      map.removeLayer(tasot);
    }
  });
  
  viljelypalsta_alue.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      fillcolor = "#666699"
      filter = "Viljelypalsta-alue"
      update_layer();
      tasot.addTo(map);
    } else {
      map.removeLayer(tasot);
    }
  }); 

  koira.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      filter = "Koira-aitaus"
      fillcolor = "#666699"
      update_layer();
      tasot.addTo(map);
    } else {
      map.removeLayer(tasot);
    }
  });
  
  leikkipaikka.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      fillcolor = "#666699"
      filter = "Leikkipaikka"
      update_layer();
      tasot.addTo(map);
    } else {
      map.removeLayer(tasot);
    }
  });
  
  leikkipuisto.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      fillcolor = "#666699"
      filter = "Leikkipuisto"
      update_layer();
      tasot.addTo(map);
    } else {
      map.removeLayer(tasot);
    }
  });
  
  luonto.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      filter = "Luonnonsuojelualue"
      fillcolor = "#336666"
      update_layer();
      tasot.addTo(map);
    } else {
      map.removeLayer(tasot);
    }
  });
  
  uimaranta.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      filter = "Uimaranta-alue"
      fillcolor = "#336699"
      update_layer();
      tasot.addTo(map);
    } else {
      map.removeLayer(tasot);
    }
  });
  
  venesatama.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      filter = "Venesatama / Venevalkama"
      fillcolor = "#336699"
      update_layer();
      tasot.addTo(map);
    } else {
      map.removeLayer(tasot);
    }
  });
 
  hauta.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      filter = "Haudat"
      fillcolor = "#666666"
      update_layer();
      tasot.addTo(map);
    } else {
      map.removeLayer(tasot);
    }
  });
  
  muut_asema.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      filter = "semakaavoitettu"
      fillcolor = "#336666"
      update_layer();
      tasot.addTo(map);
    } else {
      map.removeLayer(tasot);
    }
  });
  
  yleiskaava.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      filter = "Yleiskaavan viheralue"
      fillcolor = "#336666"
      update_layer();
      tasot.addTo(map);
    } else {
      map.removeLayer(tasot);
    }
  });
  
  muut.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      filter = "Muut viheralueet"
      fillcolor = "#ffffff"
      update_layer();
      tasot.addTo(map);
    } else {
      map.removeLayer(tasot);
    }
  });
	
}

//CORS:n aktivointi, mahdollistaa pyyntöjen tekemisen verkkopiirin ulkopuolelta (domain)
/*
(function() {
  var cors_api_host = 'cors-anywhere.herokuapp.com';
  var cors_api_url = 'https://' + cors_api_host + '/';
  var slice = [].slice;
  var origin = window.location.protocol + '//' + window.location.host;
  var open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    var args = slice.call(arguments);
    var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
    if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
      targetOrigin[1] !== cors_api_host) {
      args[1] = cors_api_url + args[1];
    }
    return open.apply(this, args);
  };
})();
*/
  
function init() {
    	
  //BASEMAP
  var map = L.map('map', {
    center: new L.LatLng(60.1708, 24.9375),
    zoom: 12,
    minZoom: 11,
    maxZoom: 18,
  });
  	
  //Scale
  L.control.scale().addTo(map);
  
  
  var basemap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicGVzb25ldDEiLCJhIjoiY2lqNXJua2k5MDAwaDI3bTNmaGZqc2ZuaSJ9.nmLkOlsQKzwMir9DfmCNPg', {
    maxZoom: 18,
    /*attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',*/
    id: 'mapbox.light'
  }).addTo(map);

  
  //WFS-layerit lisataan tasot grouppiin
  var tasot = new L.LayerGroup();
  var kaikki = new L.LayerGroup();
	
  //Kaytetaan valmiiksi ladattua aineistoa -> on huomattavasti nopeampi kuin aina ladata aineisto uudestaan
  var all = "https://pesonet1.github.io/Leaflet/all.json"
  
  var filter = null;
  var fillcolor = null;
  
  
  //Taman funktion avulla uusi karttataso voidaan kutsua kayttaen haluttua filteria ja tason varia
  function update_layer() {
    var viheralueet = $.ajax({
      url: all,
      type: 'GET',
      //datatype:"json",
      //jsonCallback: 'getJson',
      success: function(response) {
        viheralueet = L.geoJson(response, {
          style: function (feature) {
            var fillColor, 
            kaytto = feature.properties.kayttotarkoitus;
            
            if ( kaytto == filter ) fillColor = fillcolor;
            
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
    
    tasot.addTo(map);
  }
 
  //var viheralueet_wfs = "http://geoserver.hel.fi/geoserver/hkr/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hkr:ylre_viheralue&srsName=EPSG:4326&format=json&outputFormat=json&format_options=callback:getJson"
  //Oma funktio kaikkien viheralueiden hankkimiselle, myös varit ovat maaritelty
  function update_all() {
    var viheralueet = $.ajax({ 
      url: all,
      type: 'GET',
      //datatype:"json",
      //jsonCallback: 'getJson',
      success : function (response) {
        viheralueet = L.geoJson(response, {
          style: function (feature) {
            var fillColor, 
            kaytto = feature.properties.kayttotarkoitus;
      
            if ( kaytto.indexOf("semakaavoitettu") > -1) fillColor = "#336666";
            else if ( kaytto == "Yleiskaavan viheralue" ) fillColor = "#336666";
            else if ( kaytto == "Ulkoilumetsä" ) fillColor = "#336666";
            else if ( kaytto == "Kartano- ja huvila-alue" ) fillColor = "#996699";
            else if ( kaytto == "Kesämaja-alue" || kaytto == "Siirtolapuutarha" || kaytto == "Viljelypalsta" || kaytto == "Viljelypalsta-alue") fillColor = "#666699";
            else if ( kaytto == "Koira-aitaus" ) fillColor = "#666699";
            else if ( kaytto == "Leikkipaikka" || kaytto == "Leikkipuisto" ) fillColor = "#666699";
            else if ( kaytto == "Luonnonsuojelualue" ) fillColor = "#336666";
            else if ( kaytto.indexOf("luonnonsuojelualue") > -1 ) fillColor = "#336666";
            else if ( kaytto == "Uimaranta-alue" || kaytto == "Venesatama / Venevalkama" ) fillColor = "#336699";
            else if ( kaytto.indexOf("Haudat") > -1 ) fillColor = "#666666";
            else if ( kaytto == "Muut viheralueet" ) fillColor = "#fff";
      
            //else if ( kaytto == "Yleiskaavan viheralue" ) fillColor = "#ff0000";
            else fillColor = "#999";  // no data
		      
          //Muu toimiluokka
          //Yleiskaavan viheralue / luonnonsuojelualue
          //Yleiskaavan viheralue / kesämaja-alue
          //Yleiskaavan viheralue / kartanoalue
          //Yleiskaavan viheralue / leikkipuisto
          //Yleiskaavan viheralue
          //Yleiskaavan viheralue / erityiskohteet
          //Yleiskaavan viheralue / koira-aitaus
          //Ulkoilumetsä
          //Tontti (rakentamattomat / sopimus)
          //Erityiskohteet, asemakaavoitettu viheralue
          //Viljelypalsta-alue
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
  
  
  //var paavo_wfs = "http://geoserv.stat.fi:8080/geoserver/postialue/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=postialue:pno_tilasto_2015&filter=%3CPropertyIsEqualTo%3E%3CPropertyName%3Ekunta%3C/PropertyName%3E%3CLiteral%3E091%3C/Literal%3E%3C/PropertyIsEqualTo%3E&maxFeatures=1000&srsName=EPSG:4326&format=json&outputFormat=json&format_options=callback:getJson";
  var paavo_wfs = "https://pesonet1.github.io/Leaflet/paavo.json"
  
  //Paavo WFS
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
                      
          //if ( vaki > 22000) fillColor =
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
            //container.innerHTML += feature.get('nimi') + feature.get('pinta_ala');
            popupOptions = {maxWidth: 200};
            layer.bindPopup("<b>Alueen nimi: </b> " + feature.properties.nimi + 
              "<br><b>Pinta-ala: </b> " + feature.properties.pinta_ala + " m2" +
              "<br><b>Asukasmäärä: </b> " + feature.properties.he_vakiy +
              "<br><b>Asukastiheys: </b> " + Math.round(feature.properties.he_vakiy / (feature.properties.pinta_ala / 1000000)) + " as/k-m2" +
              "<br><b>Asuntojen määrä: </b> " + feature.properties.ra_asunn +
              "<br><b>Asumisväljyys: </b> " + feature.properties.te_as_valj
              ,popupOptions);
        
          //Mahdollistaa kohteen korostuksen ja kohdetta klikkaamalla siihen kohdistuksen  
          layer.on({
            //mousemove: mousemove,
            //mouseout: mouseout, 
            click: zoomToFeature
          });    
                        
        }
      }).addTo(map);
    }
  }); 
  
  var container = document.getElementById('information');
  //container.innerHTML = '';
  
  
  function onEachFeature_viheralueet(feature, layer) {
    popupOptions = {maxWidth: 200};
    layer.bindPopup("<b>Viheralueen tunnus: </b> " + feature.properties.viheralue_id +
      "<br><b>Nimi: </b> " + feature.properties.puiston_nimi +
      "<br><b>Käyttötarkoitus: </b> " + feature.properties.kayttotarkoitus +
      "<br><b>Käyttötarkoitus id: </b> " + feature.properties.kayttotarkoitus_id +
      "<br><b>Pinta-ala: </b> " + feature.properties.pinta_ala
      ,popupOptions);
      
    //Mahdollistaa kohteen korostuksen ja kohdetta klikkaamalla siihen kohdistuksen  
    layer.on({
      mousemove: mousemove,
      mouseout: mouseout, 
      click: addBuffer
    });
  }

  //Tasojen funktioita: kohteeseen zoomaus ja kohteen korostus
  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  function mousemove(e) {
    var layer = e.target;
	
    //Korostaa kohteen, jonka paalla hiiri on 
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
    //viheralueet.resetStyle(e.target);
  }

  //Funktio bufferin luonnista, joka luodaan viheralueetta klikatessa
  var radius = null;
  function addBuffer(e) {
		
    if (radius != null) {
      var layer = e.target;
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
  
    //Bufferin poisto-nappia varten tarvitaan sille eventlisteneri
    var removeButton = document.getElementById('remove');
    removeButton.addEventListener('click',function(event) {
      buffer_layer.clearLayers();
    });
  }
	
	
	
  //Bufferikoon eventlistenerit
  box_150.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      radius = 150 * 0.000621371192
    } else {
      radius = null
    }
  });
	
  box_300.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      radius = 300 * 0.000621371192
    } else {
      radius = null
    }
  });



  //Layereiden eventlistenerit
  karttataso.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      update_all();
    } else {
      map.removeLayer(kaikki);
    }
  });
  
  
	
  ulkoilumetsa.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      filter = "Ulkoilumetsä"
      fillcolor = "red"
      update_layer();
    } else {
      map.removeLayer(tasot);
    }
  });

  kartano.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      filter = "Kartano- ja huvila-alue"
      fillcolor = "#996699"
      update_layer();
    } else {
      map.removeLayer(tasot);
    }
  });
  
  siirtola.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      //Ei lisaa kartalle muita kuin Kesamaja-alueet... :/
      fillcolor = "#666699"
      filter = "Kesämaja-alue" 
      update_layer();
      filter = "Siirtolapuutarha"
      update_layer();
      filter = "Viljelypalsta"
      update_layer();
      filter = "Viljelypalsta-alue"
      update_layer();
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
    } else {
      map.removeLayer(tasot);
    }
  });
  
  leikki.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      //Lisaa kartalle vain leikkipaikat...
      filter = "Leikkipaikka" || kaytto == "Leikkipuisto"
      fillcolor = "#666699"
      update_layer();
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
    } else {
      map.removeLayer(tasot);
    }
  });
  
  uima.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      //Lisaa alueella vain Uimaranta-alueet
      filter = "Uimaranta-alue" || kaytto == "Venesatama / Venevalkama"
      fillcolor = "#336699"
      update_layer();
    } else {
      map.removeLayer(tasot);
    }
  });
  
  hauta.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      //Ei lisaa mitaan
      filter = kaytto.indexOf("Haudat") > -1
      fillcolor = "#666666"
      update_layer();
    } else {
      map.removeLayer(tasot);
    }
  });
  
  muut_asema.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      //Ei lisaa mitaan
      filter = kaytto.indexOf("semakaavoitettu") > -1
      fillcolor = "#336666"
      update_layer();
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
    } else {
      map.removeLayer(tasot);
    }
  });
  
  muut.addEventListener('change', function() {
    var checked = this.checked;
    if (checked) {
      filter = "Muut viheralueet"
      fillcolor = "#fff"
      update_layer();
    } else {
      map.removeLayer(tasot);
    }
  });
  

  //Tama scripti hoitaa sen, etta yksi laatikoista voi vain olla kerrallaan valittuna
  $("input:checkbox").on('click', function() {
    var $box = $(this);
    if ($box.is(":checked")) {
      var group = "input:checkbox[name='" + $box.attr("name") + "']";
      $(group).prop("checked", false);
      $box.prop("checked", true);
    } else {
      $box.prop("checked", false);
    }
  });

	
}

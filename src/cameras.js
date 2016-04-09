geoJson2heat = function(geojson, intensity) {
			return geojson.features.map(function(feature) {
			return [parseFloat(feature.geometry.coordinates[1]), parseFloat(feature.geometry.coordinates[0]), intensity];
			});
		};

	L.mapbox.accessToken = 'pk.eyJ1Ijoiemh1Y2tvZmYiLCJhIjoiNlE1elpIZyJ9.YVbO-NCwjWIEkAd-TB42Cw';
	var map = L.mapbox.map('map', null, {maxZoom: 18}).setView([55.753065,37.619191], 12);

	L.control.geocoder('search-vZnXM9p').addTo(map);

	var mapbox_hc = L.mapbox.tileLayer('mapbox.high-contrast'),
		mapbox_st = L.mapbox.tileLayer('mapbox.streets'),
		mapbox_sat = L.mapbox.tileLayer('mapbox.satellite');

	var basemaps = {
		"Mapbox high-contrast": mapbox_hc,
		"Mapbox streets": mapbox_st,
		"Mapbox satellite": mapbox_sat
		};

	var cameras = L.mapbox.featureLayer().loadURL('http://api.data.mos.ru/v1/datasets/1498/features?bbox='+map.getBounds().toBBoxString());

	mapbox_hc.addTo(map);

	cameras.on('ready', function(e) {
		var heat = L.heatLayer(cameras.getGeoJSON(), {maxZoom: 18}).addTo(map);
		
		var clusterGroup = new L.MarkerClusterGroup({
			polygonOptions: {
			fillColor: '#3887be',
			color: '#3887be',
			weight: 2,
			opacity: 1,
			fillOpacity: 0.5
		  }
		});
		e.target.eachLayer(function(layer) {
			clusterGroup.addLayer(layer);
			});
		
		var geoData = geoJson2heat(cameras.getGeoJSON(), 1);
		var heatMap = new L.heatLayer(geoData,{radius: 30,blur: 60, minZoom:10, maxZoom: 17, opacity:0.1});
		
		cameras.eachLayer(function(layer) {
		var content = '<h2>Камера дворового наблюдения<\/h2>' +
			'<p>' + layer.feature.properties.Attributes.AdmArea + '<br \/>' +
			layer.feature.properties.Attributes.District + '<br \/>' +
			layer.feature.properties.Attributes.Address + '<br \/><br \/>' +
			'Адрес ОВД: ' + layer.feature.properties.Attributes.OVDAddress + '<br \/>' +
			'Телефон ОВД: ' + layer.feature.properties.Attributes.OVDPhone[0].PhoneOVD + '<br \/><br \/>' +
			'Изображение:<br \/>' +
			'<img src="http://op.mos.ru/MEDIA/showFile?id='+layer.feature.properties.Attributes.Photo + '" width = 250/><\/p>';
			layer.bindPopup(content);
			});
		
		map.addLayer(clusterGroup);
		var overlays = {"Камеры дворового наблюдения":clusterGroup, "Плотность камер":heatMap}
		L.control.layers(basemaps,overlays).addTo(map);
		
	});

	cameras.on('layeradd', function(e) {
		var marker = e.layer,
		feature = marker.feature;

        marker.setIcon(L.icon({
            "iconUrl": "http://api.data.mos.ru/v1/datasets/1498/marker",
            //"iconSize": [24, 29],
            "iconAnchor": [12, 29],
            "popupAnchor": [0, 0],
            "className": "dot"
        }));
		});

cameras.on('click', function(e) {
        map.panTo(e.layer.getLatLng())
	});

var buffers = L.mapbox.featureLayer().addTo(map);	
cameras.on('mouseover', function(e) {
	var buffer = turf.buffer(e.layer.feature, 0.05, 'kilometers');
	buffers.setGeoJSON(buffer).addTo(map);
});
cameras.on('mouseout', function(e) {
	buffers.setGeoJSON({'name':'name'});
});
var MAP = {
    map: {},
    app: {}
};

var CONFIG = {    
    "styles": {        
        "identifySymbols": {
            "esriGeometryPoint": {
                "type": "esriSMS",
                "style": "esriSMSCircle",
                "color": ["225", "0", "0", "255"],
                "size": "7",
                "angle": "0",
                "xoffset": "0",
                "yoffset": "0",
                "outline": {
                    "color": ["0", "0", "0", "255"],
                    "width": "1",
                    "type": "esriSLS",
                    "style": "esriSMSCircle"
                }
            },
            "esriGeometryPolyline": {
                "groupName": "identifySymbols",
                "type": "esriSLS",
                "style": "esriSLSSolid",
                "color": ["255", "0", "0", "255"],
                "width": "1"
            },
            "esriGeometryPolygon": {
                "type": "esriSFS",
                "style": "esriSFSSolid",
                "color": ["255", "0", "0", "196"],
                "outline": {
                    "type": "esriSLS",
                    "style": "esriSLSSolid",
                    "color": ["0", "0", "0", "255"],
                    "width": "1.5"
                }
            }
        },
        "goToSymbols": {
            "esriGeometryPoint": {
                "type": "esriSMS",
                "style": "esriSMSCircle",
                "color": ["252", "145", "5", "128"],
                "size": "13",
                "angle": "0",
                "xoffset": "0",
                "yoffset": "0",
                "outline": {
                    "color": ["0", "0", "0", "255"],
                    "width": "1",
                    "type": "esriSLS",
                    "style": "esriSMSCircle"
                }
            },
            "esriGeometryPolyline": {
                "groupName": "goToSymbols",
                "type": "esriSLS",
                "style": "esriSLSSolid",
                "color": ["252", "145", "5", "128"],
                "width": "5"
            },
            "esriGeometryPolygon": {
                "type": "esriSFS",
                "style": "esriSFSSolid",
                "color": ["252", "145", "5", "128"],
                "outline": {
                    "type": "esriSLS",
                    "style": "esriSLSSolid",
                    "color": ["0", "0", "0", "255"],
                    "width": "1.5"
                }
            }
        }                
    }
};


var FUNCTIONS = {
	createMap: function() {
		require(["esri/map",
                "dojo/domReady!"
            ],
            function(Map) {
                MAP.map = new Map("mapDiv", {
                    center: [21.12, 52.23],
                    zoom: 6,
                    basemap: "osm", // streets,satellite,hybrid,terrain,topo,gray,dark-gray,oceans,national-geographic,osm
                    showAttribution: false
                });
            });
        console.log("Map created");
	},
	addHomeButton: function() {
        require(["esri/dijit/HomeButton"],
            function(HomeButton) {
                var home = new HomeButton({
                    map: MAP.map
                }, "HomeButton");
                home.startup();
            });
        console.log("HomeButton added");
    },
	addDynamicMapLayer: function() {
        require(["dojo/dom-construct",
                "esri/layers/ArcGISDynamicMapServiceLayer"
            ],
            function(domConstruct, ArcGISDynamicMapServiceLayer) {
                var dynamicLayerURL = 'http://giscbdg.pgi.gov.pl/arcgis/rest/services/jaskinie/MapServer';
                var dynamicLayer = new ArcGISDynamicMapServiceLayer(dynamicLayerURL, {
                    "id": "dynamicLayer",
                    "opacity": 0.75
                });
                MAP.map.addLayer(dynamicLayer);
            });
        console.log("Dynamic layer added");
    },
	addQueryTask1: function() {
		require(["esri/tasks/QueryTask",
                "esri/tasks/query",
				"esri/symbols/SimpleMarkerSymbol",
				"esri/InfoTemplate",
				  "dojo/_base/Color",
				  "dojo/domReady!"
            ],
            function(QueryTask, Query, SimpleMarkerSymbol, InfoTemplate, Color) {
                queryTask = new QueryTask("http://giscbdg.pgi.gov.pl/arcgis/rest/services/jaskinie/MapServer/0");
				query = new Query();
        		query.returnGeometry = true;
				query.outFields = ["NAZWA", "DLUGOSC", "GMINA"];
				query.geometryType = "esriGeometryEnvelope";
                query.spatialRel = "esriSpatialRelIntersects";
				
				query.where = "NAZWA like 'Wielka%'";
				
				queryTask.execute(query, function takeResults(results) {
        			if (results.features.length > 0 && results.features.length < 500 && (results.geometryType == "esriGeometryPoint" || results.geometryType == "esriGeometryPolyline" || results.geometryType == "esriGeometryPolygon" || results.geometryType == "esriGeometryMultipoint")) {                            
						
		        		var data = MAP.getDataFromResult[results.geometryType](results.features);
		               	var geometry = MAP.createGeometry[results.geometryType](data);
		               	
		               	var validExtent = MAP.getValidExtent[results.geometryType](geometry.getExtent());
		               	MAP.map.setLevel(7);
		               	MAP.map.setExtent(validExtent);
						
						//var layerToOpen = "#" + serwisName.toLowerCase()+serwisId;
						//console.log(layerToOpen);
						//$(layerToOpen).trigger('click');
						
		            //    MAP.createGraphics[results.geometryType](MAP.map, geometry, results.geometryType);  
	        		}
	        	//	MAP.map.setExtent(validExtent, true);
					
				});
				
				infoTemplate = new InfoTemplate("${NAZWA}", "Dl : ${DLUGOSC}<br/> gm : ${GMINA}");
				symbol = new SimpleMarkerSymbol();
				symbol.setStyle(SimpleMarkerSymbol.STYLE_SQUARE);
				symbol.setSize(100);
				symbol.setColor(new Color([255,255,0,0.5]));	
            });
        console.log("Query task 1 added");
  	},
	addQueryTask2: function () {

        var self = this;

        var layersRequest = esri.request({ url: "http://giscbdg.pgi.gov.pl/arcgis/rest/services/jaskinie/MapServer/0", content: { f: "json" }, handleAs: "json", callbackParamName: "callback" });
        layersRequest.then(
            function (response) {
				
				$('#searchBtn').click(function() {
					console.log("btn clicked");
				
				//console.log(response);
                var attrType = "";
                //self.linkService.maxScale = response.maxScale;
				
				attributeId = "NAZWA"

                for (i = 0; i < response.fields.length; i++) {
                    if (response.fields[i].name.toLowerCase() == attributeId.toLowerCase()) {
                        attrType = response.fields[i].type;
                        break;
                    }
                }
				

                if (attrType != "") {

                    var quote = "";
                    if (attrType == 'esriFieldTypeString')
                        quote = "'";

                    var queryTask = new esri.tasks.QueryTask("http://giscbdg.pgi.gov.pl/arcgis/rest/services/jaskinie/MapServer/0");
                    var query = new esri.tasks.Query();
                    query.returnGeometry = true;
                    query.geometryType = "esriGeometryEnvelope";
                    query.spatialRel = "esriSpatialRelIntersects";
                    query.where = "NAZWA like '%" + $('#searchInput').val() + "%'";
                    //query.where = "1=1";
                    //query.where = "objectid in (1,2,3,4)";

                    queryTask.execute(query, function showResults(results) {
						//console.log(results);
                        if (
						results.features.length > 0 && results.features.length < 500 && (results.geometryType == "esriGeometryPoint" || results.geometryType == "esriGeometryPolyline" || results.geometryType == "esriGeometryPolygon")
						
						) {

                            var data = self.getDataFromResult[results.geometryType](results.features);
                            var geometry = self.createGeomerty[results.geometryType](data);
                            //self.createGraphics[results.geometryType](self, geometry, results.geometryType);
                            var validExtent = self.getValidExtent[results.geometryType](geometry.getExtent());
							
							console.log(validExtent);
							
							gsvc = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");	

							var polygon = new esri.geometry.Polygon(new esri.SpatialReference({wkid:2180}));
							polygon.addRing([[validExtent.xmax,validExtent.ymax],[validExtent.xmin,validExtent.ymax]]);
							console.log(polygon);
								  
							var outSR = new esri.SpatialReference(4326);
									
							gsvc.project([ polygon ], outSR, function(projectedPoints) {
								pt = projectedPoints[0];
								//console.log(pt);	
								//console.log(pt.getExtent());
								MAP.map.setLevel(10);
								MAP.map.setExtent(pt.getExtent());
								
								
							});
							
                        }
                        else
                            //self.centerFullMapHandler();
							console.log("blabla");
                    });
                }
                else {
                    //self.centerFullMapHandler();
					console.log("blabla");
                }
				
				});
				
            },
            function (error) {
                console.log("Error: ", error.message);
                self.centerFullMapHandler();
            });
    },
	getValidExtent: {
        "esriGeometryPoint": function (extent) {
            if (extent.getHeight() == 0 && extent.getWidth() == 0)
                extent.update(extent.xmin - 10, extent.ymin - 10, extent.xmax + 10, extent.ymax + 10, extent.spatialReference)
            return extent;
        },
        "esriGeometryPolyline": function (extent) {
            return extent;
        },
        "esriGeometryPolygon": function (extent) {
            return extent;
        }
    },
	addGraphics: function (obj) {
        if (this.map.graphics != null) {
            var graphic = new esri.Graphic(obj);
            this.map.graphics.add(graphic);
        }
    },
    clearGraphics: function () {
        if (this.map.graphics != null)
            this.map.graphics.clear();
    },
    getDataFromResult: {
        "esriGeometryPoint": function (features) {
            var points = [];
            for (i = 0; i < features.length; i++) {
                points.push([features[i].geometry.x, features[i].geometry.y]);
            }
            return points;
        },
        "esriGeometryPolyline": function (features) {
            var paths = [];
            for (i = 0; i < features.length; i++) {
                for (j = 0; j < features[i].geometry.paths.length; j++) {
                    paths.push(features[i].geometry.paths[j]);
                }
            }
            return paths;
        },
        "esriGeometryPolygon": function (features) {
            var rings = [];
            for (i = 0; i < features.length; i++) {
                for (j = 0; j < features[i].geometry.rings.length; j++) {
                    rings.push(features[i].geometry.rings[j]);
                }
            }
            return rings;
        }
    },
	createGraphicSymbol: function (geometry, jsonSymbol) {
        var graphic = new esri.Graphic(geometry);
        graphic.setSymbol(jsonSymbol);
        return graphic;
    },
	createGraphics: {
        "esriGeometryPoint": function (map, geometry, symbol) {
            MAP.map.addGraphics(MAP.map.createGraphicSymbol(geometry, CONFIG.styles.goToSymbols[symbol]));
            MAP.map.addGraphics(MAP.map.createGraphicSymbol(geometry, CONFIG.styles.identifySymbols[symbol]));
        },
        "esriGeometryPolyline": function (map, geometry, symbol) {
            MAP.map.addGraphics(MAP.map.createGraphicSymbol(geometry, CONFIG.styles.goToSymbols[symbol]));
            MAP.map.addGraphics(MAP.map.createGraphicSymbol(geometry, CONFIG.styles.identifySymbols[symbol]));
        },
        "esriGeometryPolygon": function (map, geometry, symbol) {
            MAP.map.addGraphics(map.createGraphicSymbol(geometry, CONFIG.styles.goToSymbols[symbol]));
            //map.addGraphics(map.createGraphicSymbol(geometry, CONFIG.styles.identifySymbols[symbol]));
        }
    },
	createGeomerty: {
        "esriGeometryPoint": function (data) {
            return new esri.geometry.Multipoint({
                "points": data,
                "spatialReference": {
                    "wkid": 2180
                }
            });
        },
        "esriGeometryPolyline": function (data) {
            return new esri.geometry.Polyline({
                "paths": data,
                "spatialReference": {
                    "wkid": 2180
                }
            });
        },
        "esriGeometryPolygon": function (data) {
            return new esri.geometry.Polygon({
                "rings": data,
                "spatialReference": {
                    "wkid": 2180
                }
            });
        }
    },
	projectToLatLon : function() {
	  var map, gsvc, pt;

      require([
        "esri/map", "esri/graphic", "esri/symbols/SimpleMarkerSymbol",
        "esri/tasks/GeometryService", "esri/tasks/ProjectParameters",
        "esri/SpatialReference", "esri/InfoTemplate", "dojo/dom", "dojo/on",
        "dojo/domReady!"
      ], function(
        Map, Graphic, SimpleMarkerSymbol,
        GeometryService, ProjectParameters,
        SpatialReference, InfoTemplate, dom, on
      ) {
        map = MAP.map;

        gsvc = new GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
        map.on("click", projectToPL92);

        function projectToWebMercator(evt) {
          map.graphics.clear();
          
          var point = evt.mapPoint;
          var symbol = new SimpleMarkerSymbol().setStyle("diamond");
          var graphic = new Graphic(point, symbol);
          var outSR = new SpatialReference(102100);
          
          map.graphics.add(graphic);

          gsvc.project([ point ], outSR, function(projectedPoints) {
            pt = projectedPoints[0];
            graphic.setInfoTemplate(new InfoTemplate("Współrzędne",
				"<span><strong>Układ Web Mercator:</strong></span>" + "<br>" +
              "<span>X:</span>" + pt.x.toFixed() + "<br>" + 
              "<span>Y:</span>" + pt.y.toFixed() + "<br>" + 
              "<input type='button' value='Convert back to LatLong' id='convert'>" +
              "<div id='latlong'></div>"));
            map.infoWindow.setTitle(graphic.getTitle());
            map.infoWindow.setContent(graphic.getContent());
            map.infoWindow.show(evt.screenPoint, map.getInfoWindowAnchor(evt.screenPoint));
            on.once(dom.byId("convert"), "click", projectToLatLong);
          });
        }
		
		function projectToPL92(evt) {
          map.graphics.clear();
          
          var point = evt.mapPoint;
          var symbol = new SimpleMarkerSymbol().setStyle("diamond");
          var graphic = new Graphic(point, symbol);
          var outSR = new SpatialReference(2180);
          
          map.graphics.add(graphic);

          gsvc.project([ point ], outSR, function(projectedPoints) {
            pt = projectedPoints[0];
            graphic.setInfoTemplate(new InfoTemplate("Współrzędne",
              "<span><strong>Układ PL-1992:</strong></span>" + "<br>" +
			  "<span>X:</span>" + pt.y.toFixed() + "<br>" + 
              "<span>Y:</span>" + pt.x.toFixed() + "<br>" + 
              "<input type='button' value='Przelicz do WGS84' id='convert'>" +
              "<div id='latlong'></div>"));
            map.infoWindow.setTitle(graphic.getTitle());
            map.infoWindow.setContent(graphic.getContent());
            map.infoWindow.show(evt.screenPoint, map.getInfoWindowAnchor(evt.screenPoint));
            on.once(dom.byId("convert"), "click", projectToLatLong);
          });
        }

        function projectToLatLong() {
          var outSR = new SpatialReference(4326);
          var params = new ProjectParameters();
          params.geometries = [pt.normalize()];
          params.outSR = outSR;
          
          gsvc.project(params, function(projectedPoints) {
            pt = projectedPoints[0];
            dom.byId("latlong").innerHTML = "<span><strong>Układ WGS-84:</strong></span>" + "<br>" + 
				"<span>Szerokość: </span> " + pt.y.toFixed(3) + 
				"<br><span>Długość:</span>" + pt.x.toFixed(3);
          });
        }
		
      });
	  
	},
	zoomToWGS : function() {
		console.log("zoomToWGS");
		
		var map, gsvc, pt;

      require([
        "esri/map", "esri/graphic", "esri/symbols/SimpleMarkerSymbol",
        "esri/tasks/GeometryService", "esri/tasks/ProjectParameters",
        "esri/SpatialReference", "esri/InfoTemplate", "dojo/dom", "dojo/on",
        "dojo/domReady!"
      ], function(
        Map, Graphic, SimpleMarkerSymbol,
        GeometryService, ProjectParameters,
        SpatialReference, InfoTemplate, dom, on
      ) {
        map = MAP.map;

        gsvc = new esri.task.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");	
         
		//var point = new esri.geometry.Point(52, 21, new esri.SpatialReference({ wkid: 4326 }));
		//console.log(point);
			  
		var polygon = new esri.geometry.Polygon(new esri.SpatialReference({wkid:2180}));
		polygon.addRing([[428355,237447],[762053,689131]]);
		console.log(polygon);
			  
		var outSR = new esri.SpatialReference(4326);
			  	
		gsvc.project([ polygon ], outSR, function(projectedPoints) {
			pt = projectedPoints[0];
			console.log(pt);	
			console.log(pt.getExtent());
			
			MAP.map.setLevel(7);
		    MAP.map.setExtent(pt.getExtent());
		});
			
	  });
	},
    scaleDepRender : function() {
        require(["dojo/dom-construct",
                "esri/layers/ArcGISDynamicMapServiceLayer",
                 "esri/layers/FeatureLayer",
                 "esri/InfoTemplate", 
                 "esri/renderers/SimpleRenderer",
                 "esri/symbols/SimpleFillSymbol",
                 "esri/symbols/SimpleMarkerSymbol",
                 "esri/renderers/ScaleDependentRenderer",
                 "esri/Color"
            ],
            function(domConstruct, ArcGISDynamicMapServiceLayer, FeatureLayer, InfoTemplate, SimpleRenderer,  SimpleFillSymbol, SimpleMarkerSymbol, ScaleDependentRenderer, Color) {
               /*  
               
                var statesUrl = "http://giscbdg.pgi.gov.pl/arcgis/rest/services/cbdg_prg/MapServer/1";
                
                var refLayer = new FeatureLayer(statesUrl);
                refLayer.on("load", function(){
                  refLayer.renderer.symbol.outline.setWidth(2);
                  refLayer.renderer.symbol.outline.setColor(new Color("#c8c8c8"));
                  refLayer.renderer.symbol.setColor(new Color("#FFFFFF"));
                });
                //MAP.map.addLayer(refLayer);
                
                var layer = new FeatureLayer("http://giscbdg.pgi.gov.pl/arcgis/rest/services/jaskinie/MapServer/0", {
                  outFields: ["NAZWA", "GLEBOKOSC"],
                  infoTemplate: new InfoTemplate("${NAZWA}", "<div style='font: 18px Segoe UI'>.... <b>${GLEBOKOSC}</b>.</div>")
                });
                //layer.setDefinitionExpression("AREA>0.01 and M086_07>0");

                var markerSym = new SimpleMarkerSymbol();
                markerSym.setColor(new Color("#78B378"));
                //markerSym.setOutline(markerSym.outline.setColor(new Color([133,197,133,0.75])));
                var renderer1 = new SimpleRenderer(markerSym);   
                var sizeInfo = {
                  field:"GLEBOKOSC",
                  minSize:1,
                  maxSize:10,
                  minDataValue:0,
                  maxDataValue:50
                };
                renderer1.setSizeInfo(sizeInfo);
                
                var markerSym2 = new SimpleMarkerSymbol();
                markerSym2.setColor(new Color("#b92d38"));
                markerSym2.setOutline(markerSym.outline.setColor(new Color([133,197,133,0.75])));
                var renderer2 = new SimpleRenderer(markerSym2);
                var sizeInfo2 = {
                  field:"GLEBOKOSC",
                  minSize:5,
                  maxSize:15,
                  minDataValue:50,
                  maxDataValue:100
                }; 
                renderer2.setSizeInfo(sizeInfo2);
                var fillSym = new SimpleFillSymbol().setColor(null);
                fillSym.setColor(new Color("#FFFFFF"));
                fillSym.setOutline(fillSym.outline.setColor(new Color([133,197,133,0.25])));
                renderer2.backgroundFillSymbol = fillSym;

                var params = {rendererInfos: [{
                  "renderer": renderer1,
                  "minScale": 50000000,
                  "maxScale": 2500000
                }, {
                  "renderer": renderer2,
                  "minScale": 5000000,
                  "maxScale": 100000
                }]};

                var scaleDependentRenderer = new ScaleDependentRenderer(params);
                layer.setRenderer(scaleDependentRenderer);
                MAP.map.addLayer(layer);
            
            */
                
            
                var layer3 = new FeatureLayer("http://giscbdg.pgi.gov.pl/arcgis/rest/services/geofizyka/cbdg_grawimetria/MapServer/1", {
                  outFields: ["PKT_ID", "NAZWA_PKT", "NAZWA_ANALIZY"],
                  infoTemplate: new InfoTemplate("${NAZWA_PKT}", "<div style='font: 16px Segoe UI'><b>${NAZWA_ANALIZY}</b><p style='font:10px Segoe UI'>warstwa geofizyka/cbdg_grawimetria/MapServer/1</p></div>")
                });
            
                var markerSym21 = new SimpleMarkerSymbol({"size": 5});
                markerSym21.setColor(new Color("#ff3b00"));
                var renderer21 = new SimpleRenderer(markerSym21);   
            
                var markerSym22 = new SimpleMarkerSymbol({"size": 22});
                markerSym22.setColor(new Color("#2834bf"));
                var renderer22 = new SimpleRenderer(markerSym22); 
                
                var params21 = {rendererInfos: [{
                  "renderer": renderer22,
                  "minScale": 50000,
                  "maxScale": 10000
                },
                {"renderer": renderer21,
                  "minScale": 5000000,
                  "maxScale": 50000
                }]};
                var scaleDependentRenderer21 = new ScaleDependentRenderer(params21);
                layer3.setRenderer(scaleDependentRenderer21);
            
                MAP.map.addLayer(layer3);
 
            
            });
        console.log("ScaleDependedRenderer added");
        
    }
};



$(function() {
	FUNCTIONS.createMap();
	FUNCTIONS.addHomeButton();

	setTimeout(function() {
        FUNCTIONS.addDynamicMapLayer();
		FUNCTIONS.addQueryTask2();
		//FUNCTIONS.projectToLatLon();
        FUNCTIONS.scaleDepRender();
    }, 600);
});




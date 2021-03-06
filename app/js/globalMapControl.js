"use strict";
// global variables


var mapControl = {
	existMap: false,
	mapName: null,
	mapPlot: function(name, isChoosingFloor, callback) {
		var	server= "http://local-map/";
		// add svg map to html
		d3.xml( server + "maps/" + name + ".svg",
			function(error, documentFragment) {
				if(error){
					console.log(error);
					return;
				}
				var svgNode,
					map,
					floorName,
					allTables,
					allAvailables;
				// request on json file

				svgNode = documentFragment.getElementsByTagName("svg")[0];
				map = d3.select(".map");
				map.node().appendChild(svgNode);
				floorName = name;

				// if plot map N0, add upper padding, because of N0's svg size
				if(name === "N0"){
					d3.select("#whole-map")
						.style("padding-top", "130px");
				}
				else{
					d3.select("#whole-map")
						.style("padding-top", "0px");
				}

				// mark all tables as available
				allTables = d3.select("#tables").selectAll("g");
				allTables.attr("class", "available");

				// zoom and translate on the maps
				var zoom = d3.behavior.zoom()
					.scaleExtent([1, 8])
					.on("zoom", function() {
						var wholeMap = d3.select("#whole-map")
							.select("svg");
						wholeMap.select("#tables")
							.attr("transform", "translate(" +
							d3.event.translate + ")scale(" +
							d3.event.scale + ")");
						wholeMap.select("#AutoLayers")
							.attr("transform", "translate(" +
							d3.event.translate + ")scale(" +
							d3.event.scale + ")");

						wholeMap.on("dblclick.zoom", null);
					});
				var svg = d3.select("#whole-map")
					.select("svg").call(zoom);


				// for each people, search his table
				d3.json( server+"people", function(error, data) {
					var dataset = data,
						table,
						tooltip = d3.select(".tooltip");


					$.each(dataset, function(i, data){
						// data example: ["CN=Laurence EYRAUD-JOLY,OU=Klee SA,OU=Utilisateurs,DC=KLEE,DC=LAN,DC=NET",
						//					{ "mail": ["Laurence.EYRAUDJOLY@kleegroup.com"], "physicalDeliveryOfficeName": ["La Boursidière : N4-D-01"], "cn": ["Laurence EYRAUD-JOLY"] }]
						// only need data[1]
						var d = data[1];
						// split tableID into two parts.
						// ex "La Boursidiere : N3-A-01" => ["La Boursidiere", "N3-A-01"]

						if (d.physicalDeliveryOfficeName) {
							var splitID = d.physicalDeliveryOfficeName[0].split(/\s+:\s+/);

							// do following if we have the second part
							if(splitID[1]){
								table = d3.select("#"+splitID[1]);
								// if found in map, change table color, add hover actions
								if(table[0][0] !== null){
									// mark as occupied
									table.attr("class", "occupied");
									table.select("rect")
										.attr("id", d.cn[0])
										.attr("fill", "#ff9900")
										.attr("cursor", "pointer");

									// mouse click on the button will give more info
									$("#" + splitID[1]).click( function(event) {
										var xPosition = event.clientX,
											yPosition = event.clientY;
										// get scroll pixels to correct tooltip's yPostion
										yPosition += $(window).scrollTop();

										tooltip.html(d.cn[0] + "<br/>"+ d.mail[0])
											.style("left", (xPosition) + "px")
											.style("top", (yPosition) + "px")
											.style("height", "40px");
										tooltip.transition()
											.duration(200)
											.style("opacity", .9)
											.style("z-index", 20);

										event.stopPropagation();
									});
									// click the tooltip won't let it disappear
									$(".tooltip").click(function(event) {
										event.stopPropagation();
									})
									// click elsewhere will make tooltip disappear
									$("html").click(function () {
										tooltip.transition()
											.duration(500)
											.style("opacity", 0)
											.style("z-index", -1);
									})
								}
							}
						}
					});
					////////////////////////////////
					// show all available tables
					////////////////////////////////
					allAvailables = d3.select("#tables").selectAll(".available");
					allAvailables.selectAll("rect").attr("fill", "#99ff99");

					/**
					 * add event listener on click on table
					 * to choose it as its new office
					 */
					if(isChoosingFloor === true){
						var allTables = d3.select("#tables")
							.selectAll("g")
							.style("cursor", "pointer")
							.on("click", function(){
								console.log(d3.event.target.parentNode.id);
								var officeName = d3.event.target.parentNode.id;
								d3.select("#office-name")
									.attr("value", officeName);
							});
					}

					callback();
				});
			});
	},

// justPlotMap.js
	smallMapPlot: function(name, callback) {
		var	server= "http://local-map/";

		var longTooltip = [];

		d3.xml( server + "maps/" + name + ".svg",
			function(error, documentFragment) {
				if(error){
					console.log(error);
					return;
				}
				d3.select("#navigation-chart")
					.style("visibility", "visible")
					.style("width", "100%")
					.style("height", "100%");

				d3.select("#map-show")
					.style("visibility", "hidden")
					.style("width", "0px")
					.style("height", "0px");
				console.log('set invisible for ' + name);

				var svgNode,
					map,
					allTables,
					allAvailables;

				svgNode = documentFragment.getElementsByTagName("svg")[0];

				map = document.getElementById("svg-"+name);
				map.appendChild(svgNode);

				// mark all tables as available
				allTables = d3.select("#tables").selectAll("g");
				allTables.attr("class", "available");
				/////////////////////////////
				// for each people, search his table
				/////////////////////////////
				d3.json( server+"people", function(error, data) {
					/////////////////////////////
					// add names to each table
					/////////////////////////////
					var dataset = data,
						table;

					$.each(dataset, function(i, data){
						// data example: ["CN=Laurence EYRAUD-JOLY,OU=Klee SA,OU=Utilisateurs,DC=KLEE,DC=LAN,DC=NET",
						//					{ "mail": ["Laurence.EYRAUDJOLY@kleegroup.com"], "physicalDeliveryOfficeName": ["La Boursidière : N4-D-01"], "cn": ["Laurence EYRAUD-JOLY"] }]
						// only need data[1]
						var d = data[1];
						// split tableID into two parts.
						// ex "La Boursidiere : N3-A-01" => ["La Boursidiere", "N3-A-01"]

						if (d.physicalDeliveryOfficeName) {
							var splitID = d.physicalDeliveryOfficeName[0].split(/\s+:\s+/);

							// do following if we have the second part
							if(splitID[1]){
								table = d3.select("#"+splitID[1]);
								// if found in map, change table color, add hover actions
								if(table[0][0] !== null){
									// mark as occupied
									table.attr("class", "occupied");
									table.select("rect")
										.attr("id", d.cn[0])
										.attr("fill", "#ff9900");
								}
							}
						}
					});

					////////////////////////////////
					// show all available tables
					////////////////////////////////
					allAvailables = d3.select("#tables").selectAll(".available");
					allAvailables.selectAll("rect").attr("fill", "#99ff99");
					callback();
				});
			});
	},

// justPlotMap.js
// show small maps' tooltip: departements of small map
	buildTooltips: function(names) {
		$.each(names, function(i, element){
			// get the departments in one map
			d3.xml(server + "maps/" + element + ".svg",
				function(error, documentFragment) {
					if(error){
						console.log("error at " + element + " " + error);
						return;
					}
					d3.json(server + "people/	", function(error, data) {
						var dataset = data;
						var departmentNames = [];
						var tooltip = "";

						// for each mapName, we will produce the tooltip
						// containing the main departments situated in this floor
						$.each(dataset, function(i, data){
							// data example: ["CN=Laurence EYRAUD-JOLY,OU=Klee SA,OU=Utilisateurs,DC=KLEE,DC=LAN,DC=NET",
							//					{ "mail": ["Laurence.EYRAUDJOLY@kleegroup.com"], "physicalDeliveryOfficeName": ["La Boursidière : N4-D-01"], "cn": ["Laurence EYRAUD-JOLY"] }]

							// get main departments in this floor
							var d0 = data[0].split(",");
							var departmentName = d0[1].split("=");

							var d = data[1];
							if (d.physicalDeliveryOfficeName) {
								var splitID = d.physicalDeliveryOfficeName[0].split(/\s+:\s+/);
								if(splitID[1]){
									var floor = splitID[1].split("-")[0];
									if(floor == element){
										if($.inArray(departmentName[1], departmentNames)<0){
											// add department name in the array
											departmentNames.push(departmentName[1]);
										}
									}
								}
							}
						});

						//build the associated tooltip string
						//if array not empty
						if(departmentNames !== undefined && departmentNames.length > 0){
							$.each(departmentNames, function( i, name){
								if(name !== null && name !== undefined && name !== ""){
									tooltip += "&bull; " + name + "<br />"; // "&bull;" is point symbol of html
								}
							});
						}
						else {
							tooltip = "No data for this floor.";
						}

						// create the tooltip object when click on small map
						// Define the div for the tooltip
						var div = d3.select(".tooltip");

						// mouse click on the table will give more info
						$("#"+element).click(function(event) {
							var xPosition = event.clientX,
								yPosition = event.clientY,
								height = 20 * (departmentNames.length !== 0 ? departmentNames.length : 1);
							console.log("height=" + height + "px");
							// get scroll pixels to correct tooltip's yPostion
							yPosition += $(window).scrollTop();

							div.html("<span>" + tooltip + "</span>");
							div.transition()
								.duration(500)
								.style("left", (xPosition) + "px")
								.style("top", (yPosition) + "px")
								.style("height", (height) + "px")
								.style("opacity", .9)
								.style("z-index", 20);

							event.stopPropagation();
						});
						// click the tooltip won't let it disappear
						$(".tooltip").click(function(event) {
							event.stopPropagation();
						})
						// click elsewhere will make tooltip disappear
						$("html").click(function () {
							div.transition()
								.duration(500)
								.style("opacity", 0)
								.style("z-index", -1);
						})

					});
				});
		});
	},
	confmapPlot: function(name, conId, callback) {
		var	server= "http://local-map/";
		//var	server= "http://localhost:3000/";
		// add svg map to html
		d3.xml( server + "maps/" + name + ".svg",
			function(error, documentFragment) {
				if(error){
					console.log(error);
					return;
				}
				var svgNode,
					map,
					floorName,
					allTables,
					allAvailables;

				svgNode = documentFragment.getElementsByTagName("svg")[0];
				map = d3.select(".map");
				map.node().appendChild(svgNode);
				floorName = name;

				// if plot map N0, add upper padding, because of N0's svg size
				if(name === "N0"){
					d3.select("#whole-map")
						.style("padding-top", "130px");
				}
				else{
					d3.select("#whole-map")
						.style("padding-top", "0px");
				}

				// mark all tables as available
				allTables = d3.select("#tables").selectAll("g");
				allTables.attr("class", "available");

				// zoom and translate on the maps
				var zoom = d3.behavior.zoom()
					.scaleExtent([1, 8])
					.on("zoom", function() {
						var wholeMap = d3.select("#whole-map")
							.select("svg");
						wholeMap.select("#tables")
							.attr("transform", "translate(" +
							d3.event.translate + ")scale(" +
							d3.event.scale + ")");
						wholeMap.select("#AutoLayers")
							.attr("transform", "translate(" +
							d3.event.translate + ")scale(" +
							d3.event.scale + ")");

						wholeMap.on("dblclick.zoom", null);
					});
				var svg = d3.select("#whole-map")
					.select("svg").call(zoom);

				// for each people, search his table
				//server = "http://localhost:3000/";

				d3.json( server+"getPeopleMovingsByConId/"+conId, function(error, data) {
					var dataset = data,
						table,
						tooltip = d3.select(".tooltip");

					$.each(dataset, function(i, data){

						if(data.name){
							table = d3.select("#"+data.name);
							// if found in map, change table color, add hover actions
							if(table[0][0] !== null){
								// mark as occupied
								table.attr("class", "occupied");
								table.select("rect")
									.attr("id", data.firstName + data.lastName)
									.attr("fill", "#ff9900")
									.attr("cursor", "pointer");
							}
						}
					});
					////////////////////////////////
					// show all available tables
					////////////////////////////////
					allAvailables = d3.select("#tables").selectAll(".available");
					allAvailables.selectAll("rect").attr("fill", "#99ff99");

					/**
					 * add event listener on click on table
					 * to choose it as its new office
					 */

					var allTables = d3.select("#tables")
						.selectAll("g")
						.style("cursor", "pointer")
						.on("click", function(){
							console.log(d3.event.target.parentNode.id);
							var officeName = d3.event.target.parentNode.id;
							// mouse click on table to select new office
							var perId = $("#person").text();
							var moving;
							var former;
							// new office : data.name
							// former office :
							if (d3.select("#mov-"+perId).empty()){
								d3.json( server+"currentOfficeNamebyId/"+perId, function(error, formeroffice) {
									console.log(formeroffice);
									if(formeroffice.length < 1){
										former = " ";
									} else {
										former = formeroffice[0].name;
									}
									moving = former + " -> " + officeName;
									$('<div class="inline people-mov" id="mov-' + perId + '" >' + moving + '</div>').insertAfter($("#remove-"+perId));
								});
							}
							event.stopPropagation();
						});
					callback();
				});
			});
	},


// Erase all maps from the chart, visualize big map with 100% width and height
	eraseMap: function() {
		console.log("erase map called");

		// erase small maps
		var everyMap = [];
		everyMap = document.getElementsByClassName("small-map");
		// if small maps are already there, remove them


		$.each(Array.from(everyMap), function(i, element){
			if (element.hasChildNodes()) {
				$.each(element.childNodes, function(i, node){
					node.remove();
				});
			}
		});
		d3.select("#navigation-chart")
			.style("visibility", "hidden")
			.style("width", "0px")
			.style("height", "0px");

		var mapNames = ["N0", "N1", "N2", "N3", "N4", "O4", "O3", "O2", ""];


		$.each(mapNames, function(i, name){
			// erase floor title of the legend
			if(document.getElementsByClassName(name).length >0
				&& document.getElementsByClassName(name) !== null
				&& document.getElementsByClassName(name) !== undefined){
				document.getElementsByClassName(name)[0].remove();
			}
		});
		d3.select("#map-show")
			.style("visibility", "visible")
			.style("width", "100%")
			.style("height", "100%");
		console.log('set visible for ' + name);
	}
};
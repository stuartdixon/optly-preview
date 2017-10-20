webApp.controller('CalendarController', ['$scope', '$http', function($scope, $http){
	$scope.foo = 'bar';
	$scope.items = [];
	$scope.groups = [];
	$scope.optly_token = "2:PrJ4b7BbPa8GuTn9gymPUB-zHjL1XIHT_P18OYYufslteqyc0lmk";
	$scope.optly_api_base = "https://api.optimizely.com/v2";
	$http.defaults.headers.common['Authorization'] = "Bearer " + $scope.optly_token;
	$experimentStat = 0;
	$scope.projects = {
	    model : null,
	    availableOptions: []
	  };

	$http.get($scope.optly_api_base+'/projects')
	    .then(function(response) {
	      pd = response.data;
				for(x=0;x<pd.length;x++) {
					$scope.projects.availableOptions.push({
						id : pd[x].id,
						name : pd[x].name
					})
				}	
	  });

	$scope.getExperiments = function() {
		$scope.items = [];
		$scope.experimentStat = 'working';
		$http.get('https://api.optimizely.com/v2/experiments?project_id='+$scope.projects.model+"&per_page=100")
			.then(function(json){
				console.log(json.data)
				for(x=0;x<json.data.length;x++) {
					if(json.data[x].status == "running" ) {
						$scope.items.push({
							'id' : json.data[x].id,
							'content' : '<a target=_blank href="https://app.optimizely.com/v2/projects/'+$scope.projects.model+'/experiments/'+json.data[x].id+'">'+json.data[x].name+', status: '+json.data[x].status+'</a>',
							//https://app.optimizely.com/v2/projects/6529002483/experiments/8455000721
							'start' : 0,
							'end' : 1830297599000,
			//				'group' : json[x].personalizationEVar,
							'type' : 'range',
							'title' : "experiment: "+x,
							'className' : "active"
						});
					}	else if(json.data[x].status != "archived") {
						$scope.items.push({
							'id' : json.data[x].id,
							'content' : '<a target=_blank href="https://app.optimizely.com/v2/projects/'+$scope.projects.model+'/experiments/'+json.data[x].id+'">'+json.data[x].name+', status: '+json.data[x].status+'</a>',
							'start' : 0,
							'end' : 1830297599000,
			//				'group' : json[x].personalizationEVar,
							'type' : 'range',
							'title' : "experiment: "+x,
							'className' : "inactive"
						});
					}	
				}

				var uStart = new Date();
				var uEnd = new Date();

				var container = document.getElementById('visualization');	
				var options = {
						//order: customOrder,
						maxHeight : '80%',
						orientation : 'top',
						stack : true,
						zoomable : true,
						//groupOrder: function (a, b) {
						//  return a.value - b.value;
						///},
						start : uStart.setDate(uStart.getDate()-7),
						end : uEnd.setDate(uEnd.getDate()+7)
					};
				container.innerHTML = "";
				$scope.experimentStat = 0;
				var timeline = new vis.Timeline(container, $scope.items, options);	
		})
	}		
}]);


// desc by last modified
//if no start or end, assign 0 - 1830297599000
/*
		var items = [];
		var itemsUnassigned = [];
		className = "inactive";
		jQuery.ajax({
			url: "events.json",
			type: "GET",
			dataType: "json",
			async: false,
			success: function (json) {
				for(x=0;x<json.length;x++) {
					var markets = [];
					for(y=0;y<json[x].businessUnits.length;y++) {
						marketStr = json[x].businessUnits[y].market;
						if (marketStr == "UK") {marketStr = "gb";};
						markets += "<img src='blank.gif' class='biz_mark_ico flag flag-"+marketStr.toLowerCase()+"' alt='flag' /><span class=biz_mark>"+json[x].businessUnits[y].name+"</span>";
					}
					if (json[x].active == true) { className = "active"; }
					if (json[x].active == false) { className = "inactive"; }
					if (json[x].abTestEVar != null) {
						if (json[x].personalizationEVar) {
							items.push( {
								'id' : json[x].id*999999, //this is an ugly fix to add additional items to the calendar when they use two evars. two identical IDs can't be added.
								'content' : '<a data-cue='+x+' target=_blank href=https://em.gidapps.com/#/abTest/'+json[x].id+'>'+json[x].testName+' (personalization evar)</a>'+markets+'',
								'start' : json[x].startDate,
								'end' : json[x].endDate,
								'group' : json[x].personalizationEVar,
								'type' : 'range',
								'title' : json[x].description,
								'className' : className
							});
						}
						items.push( {
							'id' : json[x].id,
							'content' : '<a data-cue='+x+' target=_blank href=https://em.gidapps.com/#/abTest/'+json[x].id+'>'+json[x].testName+'</a>'+markets+'',
							'start' : json[x].startDate,
							'end' : json[x].endDate,
							'group' : json[x].abTestEVar,
							'type' : 'range',
							'title' : json[x].description,
							'className' : className
						});
					}
					if (json[x].abTestEVar == null) {
						itemsUnassigned.push( {
							'id' : json[x].id,
							'content' : '<a data-cue='+x+' target=_blank href=https://em.gidapps.com/#/abTest/'+json[x].id+'>'+json[x].testName+'</a>'+markets+'',
							'start' : json[x].startDate,
							'end' : json[x].endDate,
							'type' : 'range',
							'title' : json[x].description,
							'className' : className
						});
					}
				}

				
				var containerUnassigned = document.getElementById('visualization_unassigned');

				function customOrder (a, b) {
					// order by id
					return a.id - b.id;
				  }
				var uStart = new Date();
				var uEnd = new Date();


				// Configuration for the Timeline
				

				var optionsUnassigned = {
					order: customOrder,
					maxHeight : '80%',
					orientation : 'top',
					stack : true,
					zoomable : true,
					start : uStart.setDate(uStart.getDate()-7),
					end : uEnd.setDate(uEnd.getDate()+7)
				};

				  // Create a Timeline
				
				var timeline2 = new vis.Timeline(containerUnassigned, itemsUnassigned, optionsUnassigned);
			}
		});

		function timeConverter(UNIX_timestamp){
		  var a = new Date(UNIX_timestamp);
		  var year = a.getFullYear();
		  var month = a.getMonth()+1;
		  var date = a.getDate();
		  var hour = a.getHours();
		  var suffix = (hour >= 12)? 'PM' : 'AM';
		  if (hour > 12) {
			hour -= 12;
			} else if (hour === 0) {
		   hour = 12;
			}

		  var min = (a.getMinutes()<10?'0':'') + a.getMinutes();
		  var sec = (a.getSeconds()<10?'0':'') + a.getSeconds();

		  var time = month + '/' + date + '/' + year + ' ' + hour + ':'+min+':'+sec+' '+suffix;
		  return time;
		}
*/		
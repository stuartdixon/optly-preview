webApp.controller('HomepageController', ['$scope', '$uibModal', '$http', '$filter', function($scope, $modal, $http, $filter){

	$scope.optly_api_base = "https://api.optimizely.com/v2";

	if (readCookie('optlyCred')) {
		$http.defaults.headers.common['Authorization'] = readCookie('optlyCred')
	} else {
		$http.defaults.headers.common['Authorization'] = prompt("enter API token")
		createCookie ('optlyCred', $http.defaults.headers.common['Authorization'], 2)
	}
	
	

function createCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

	$scope.brands = {
		model: null,
		availableOptions : [{
			wip_subdomain : "onol",
			project_id : "8630880250",
			name : "US | Old Navy"
		},
		{
			wip_subdomain : "brol",
			project_id : "8633380079",
			name : "US | Banana Republic"
		},
		{
			wip_subdomain : "gol",
			project_id : "8637140106",
			name : "US | Gap"
		},
		{	
			wip_subdomain : "atol",
			project_id : "8629110211",
			name : "US | Athleta"
		},
		{	
			wip_subdomain : "gol",
			project_id : "6529002483",
			name : "My Project"
		}]
	}



	$scope.getPages = function(date) {
		$scope.data = {}
		//$scope.campaigns.visibility = false;
		//$scope.pages.visibility = false;
		//$scope.audiences.visibility = false;

		$scope.campaigns = {
			model: null,
			availableOptions : []
		}
		$scope.experiments= {
			model: null,
			availableOptions : []
		}
		$scope.pages= {
			model: null,
			availableOptions : []
		}
		$scope.audiences= {
			model: null,
			availableOptions : []
		}

		$http.get($scope.optly_api_base+'/pages?project_id='+$scope.brands.model.project_id)
    .then(function(response) {
			for(x=0;x<response.data.length;x++) {
				$scope.pages.availableOptions.push({
					edit_url : response.data[x].edit_url,
					id : response.data[x].id,
					name : response.data[x].name
				})
			}
			$scope.pages.visibility = true;
		});	
	}

 $scope.getExperiments = function() {
 	$scope.campaigns.visibility = true;
 	$scope.campaigns.loading = true;
	$http.get($scope.optly_api_base+'/campaigns?project_id='+$scope.brands.model.project_id)
    .then(function(response) {
    	$scope.data.campaigns = response.data
    	for(x=0;x<response.data.length;x++) {
				$scope.campaigns.availableOptions.push({
					id : response.data[x].id,
					name : response.data[x].name
				})
			}


	  	$http.get($scope.optly_api_base+'/experiments?project_id='+$scope.brands.model.project_id)
	    .then(function(response) {
	    	console.log(response.data)
	    	final_array = []
				for(x=0;x<response.data.length;x++) {
					
					// deal with experiments that don't have a name
					if(typeof response.data[x].name == "undefined") {
						response.data[x].name = "Untitled Experiment"
					}
					
					// pull in experiments that are available during the target timeframe
					if (typeof response.data[x].schedule != "undefined") {
						var start = new Date(response.data[x].schedule.start_time);
						var end = new Date(response.data[x].schedule.stop_time);
						var target_date = new Date($scope.date.dateDropDownInput);
						if(target_date <= start || target_date >= end) {
							
							console.log(response.data[x].name+" was removed because target "+target_date+" was not in range of "+start+" to "+end)
						} else {
							final_array.push(response.data[x])
						}
					} else if(typeof response.data[x].schedule == "undefined"){
						
					} 
				}

				$scope.data.experiments = final_array
				console.log(final_array)

				//assoc
				
				for(x=0;x<$scope.data.campaigns.length;x++) { //x = campaigns
					$scope.data.campaigns[x].experiments = []	
					for(y=0;y<$scope.data.campaigns[x].experiment_priorities.length;y++){ //y = experiment_priorities
						for(z=0;z<$scope.data.experiments.length;z++) {
							if($scope.data.campaigns[x].experiment_priorities[y][0] == $scope.data.experiments[z].id) { //z = experiments
								$scope.data.campaigns[x].experiments.push($scope.data.experiments[z])
							}
						}	
					}					
				}

				for(x=0;x<$scope.data.campaigns.length;x++){
					if($scope.data.campaigns[x].experiments.length < 1) {
						$scope.data.campaigns.splice(x,1)
					}
				}

				$scope.campaigns.loading = false;

				
				


			

			
				$http.get($scope.optly_api_base+'/audiences?project_id='+$scope.brands.model.project_id)
				.then(function(response) {
					$scope.audiences.availableOptions.push({
						id : 1,
						name : 'everyone'
					})
					for(x=0;x<response.data.length;x++) {
						$scope.audiences.availableOptions.push({
							id : response.data[x].id,
							name : response.data[x].name
						})
					}
					$scope.audiences.visibility = true;
					$scope.campaigns.visibility = true;


	/*
	      for(x=0;x<response.data.length;x++) {
	      	for(y=0;y<$scope.audiences.model.length;y++) {
	      		if (typeof response.data[x].audience_conditions != "undefined") {
	        		var aid = $scope.audiences.model[y];
	        		var str = response.data[x].audience_conditions;
	        		if(str.match(aid)) {
	        			for(z=0;z<response.data[x].variations.length;z++) {
	        				$scope.variation_ids.push(response.data[x].variations[z].variation_id)
	        			}
	        		}
	        	}	
	      	}
	      }

	      // create the appropriate URL
	      if($scope.pages.model.match(/browse/) && !$scope.pages.model.match(/home/)) {
	      	var str = $scope.pages.model;
	      	$scope.path = str.substring(str.indexOf(".com")+4,str.length)+"&";
	      } else if ($scope.pages.model.match(/home/)) {
					var str = $scope.pages.model;
	      	$scope.path = str.substring(str.indexOf(".com")+4,str.length)+"?";
	      } else if ($scope.pages.model.match(/\.gap\.com/)) {
	      	$scope.path = "/?"
	      }

	      $scope.brandUrl = "http://www."+getBrand($scope.projects.model)+".wip.gidapps.com"
	      $scope.targetURL = $scope.brandUrl + $scope.path+"optimizely_token=PUBLIC&optimizely_x_audiences="+$scope.audiences.model.join(',')+"&optimizely_x="+$scope.variation_ids.join(',')
	      $scope.final_url = $scope.brandUrl+"/preview?date="+$filter('date')($scope.date.dateDropDownInput, 'MM/dd/yyyy')+"&targetURL="+encodeURIComponent($scope.targetURL)
	*/
				});
			});
    });
  }



	//$scope.pages = JSON.parse(JSON.stringify($scope.projects));
	//$scope.audiences = JSON.parse(JSON.stringify($scope.projects));
	//$scope.campaigns = JSON.parse(JSON.stringify($scope.projects));



	$scope.ajaxModeler = function(api_endpoint, multi_select) {
		$http.get($scope.optly_api_base+'/'+api_endpoint+'?project_id='+$scope.projects.model)
    	.then(function(response) {
	      multi_select.availableOptions = []; // wipe out old options
				if(api_endpoint == 'pages') {
					for(x=0;x<response.data.length;x++) {
						multi_select.availableOptions.push({
							id : response.data[x].edit_url,
							name : response.data[x].name
						})
					}
				} else if(api_endpoint == 'campaigns') {
					for(x=0;x<response.data.length;x++) {
						multi_select.availableOptions.push({
							id : response.data[x].edit_url,
							name : response.data[x].name
						})
					}
				} else {	
					for(x=0;x<response.data.length;x++) {
						multi_select.availableOptions.push({
							id : response.data[x].id,
							name : response.data[x].name
						})
					}
				}
				if(api_endpoint == 'audiences') {
					multi_select.availableOptions.push({
						id : '1',
						name : 'Everyone (unrecognized)'
					})
				}	
  	});  
	}

 
    
	$scope.variation_ids = [];

}]);
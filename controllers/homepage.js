webApp.controller('HomepageController', ['$scope', '$uibModal', '$http', '$filter', function($scope, $modal, $http, $filter){

	$scope.optly_api_base = "https://api.optimizely.com/v2";
	$scope.error=false;
	$http.defaults.headers.common['Authorization'] = ""

	if (readCookie('optlyCred')) {
		$http.defaults.headers.common['Authorization'] = readCookie('optlyCred')
	} else {
		$http.defaults.headers.common['Authorization'] = prompt("enter API token")
		if ($http.defaults.headers.common['Authorization'] != null && $http.defaults.headers.common['Authorization'].length != 0) {
			createCookie ('optlyCred', $http.defaults.headers.common['Authorization'], 2)
		} else {
			$scope.error=true;
			$scope.error_message = "You need to enter a personal optimizely token. Details: https://developers.optimizely.com/x/authentication/personal-token/"
		}
	}

	$scope.variation_ids = [];
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
		}, function(response){
			console.log(response)
				if(response.data.code="invalid_credentials") {
					$scope.error_message = "Invalid credentials. Refresh the page and enter a better API token. Format is usually \"Bearer XXXXXXXXX\"";
        	$scope.error=true
        	eraseCookie("optlyCred")
				}
        
  	});	
	}

 $scope.getExperiments = function() {
 	$scope.campaigns.visibility = true;
 	$scope.campaigns.loading = true;
 	$scope.audiences.availableOptions = [];

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
							
							
						} else {
							final_array.push(response.data[x])
						}
					} else if(typeof response.data[x].schedule == "undefined"){
						
					} 
				}

				$scope.data.experiments = final_array
				

				//associations:
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

					$scope.$watchCollection( 'variation_ids', function(newVal){
        		for( var i = 0; i < newVal.length; ++i ) {
        		console.log(newVal[i]); 
        		}
    			});

		      // create the appropriate URL
		      $scope.getUrl = function () {	
			      if($scope.pages.model.edit_url.match(/browse/) && !$scope.pages.model.edit_url.match(/home/)) {
			      	var str = $scope.pages.model.edit_url;
			      	$scope.path = str.substring(str.indexOf(".com")+4,str.length)+"&";
			      } else if ($scope.pages.model.edit_url.match(/home/)) {
							var str = $scope.pages.model.edit_url;
			      	$scope.path = str.substring(str.indexOf(".com")+4,str.length)+"?";
			      } else if ($scope.pages.model.edit_url.match(/\.gap\.com/)) {
			      	$scope.path = "/?"
			      }


			      $scope.brandUrl = "http://www."+$scope.brands.model.wip_subdomain+".wip.gidapps.com"
			      $scope.targetURL = $scope.brandUrl + $scope.path+"optimizely_token=PUBLIC&optimizely_x_audiences="+$scope.audiences.model.join(',')+"&optimizely_x="+$scope.variation_ids.join(',')
			      $scope.final_url = $scope.brandUrl+"/preview?date="+$filter('date')($scope.date.dateDropDownInput, 'MM/dd/yyyy')+"&targetURL="+encodeURIComponent($scope.targetURL)
					}

				});
			});
    });
  }

}]);

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

function eraseCookie(name) {
    createCookie(name,"",-1);
}
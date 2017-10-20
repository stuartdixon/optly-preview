webApp.controller('HomepageController', ['$scope', '$uibModal', '$http', '$filter', function($scope, $modal, $http, $filter){

	$scope.optly_token = "2:PrJ4b7BbPa8GuTn9gymPUB-zHjL1XIHT_P18OYYufslteqyc0lmk";
	$scope.optly_api_base = "https://api.optimizely.com/v2";
	$http.defaults.headers.common['Authorization'] = "Bearer " + $scope.optly_token;

	$scope.brands = {
		model: null,
		availableOptions : [{
			id : "onol",
			name : "Old Navy"
		},
		{
			id : "brol",
			name : "Banana Republic"
		},
		{
			id : "gol",
			name : "Gap"
		},
		{	
			id : "atol",
			name : "Athleta"
		}]
	}


	$scope.projects = {
    model : null,
    availableOptions: []
  };
	$scope.pages = JSON.parse(JSON.stringify($scope.projects));
	$scope.audiences = JSON.parse(JSON.stringify($scope.projects));


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


  $scope.getExperiments = function() {
  	$scope.final_url = ""
  	$http.get($scope.optly_api_base+'/experiments?project_id='+$scope.projects.model)
    .then(function(response) {
			for(x=0;x<response.data.length;x++) {
				if (typeof response.data[x].schedule != "undefined") {
					var start = new Date(response.data[x].schedule.start_time);
					var end = new Date(response.data[x].schedule.end_time);
					var target_date = new Date($scope.date.dateDropDownInput);
					if(target_date <= start || target_date >= end) {
						response.data.splice(x,1);
					}
				}
			}

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
      }

      $scope.brandUrl = "http://www."+$scope.brands.model+".wip.gidapps.com"
      $scope.targetURL = $scope.brandUrl + $scope.path+"optimizely_token=PUBLIC&optimizely_x_audiences="+$scope.audiences.model.join(',')+"&optimizely_x="+$scope.variation_ids.join(',')
      $scope.final_url = $scope.brandUrl+"/preview?date="+$filter('date')($scope.date.dateDropDownInput, 'MM/dd/yyyy')+"&targetURL="+encodeURIComponent($scope.targetURL)

    });
  }
}]);
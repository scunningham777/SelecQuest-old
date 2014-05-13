angular.module('crawlerQuestApp', ['ui.router', 'App.Controllers', 'App.Services'])



    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    	$urlRouterProvider.otherwise('/');

        $stateProvider

        	.state("activeTask", {
        		params: ['selectedActiveTaskInstance'],
        		resolve: {
        			selectedActiveTaskInstance: ['$state', '$stateParams', 'taskManager', 
        			function($state, $stateParams, taskManager) {
        				var selectedTask = taskManager.getActiveTaskInstanceById($stateParams.selectedActiveTaskInstance);
        				if (selectedTask == null) {
        					$state.go("taskSelect", {}, {location:false});
        				}
        				return selectedTask;
        			}]
        		},
            	controller : 'TaskProgressCtrl',
            	templateUrl : 'partials/taskProgress.html'
     		})

     		.state("taskSelect", {
     			resolve: {
     				availableTasks: ['$state', 'taskManager',
     				function($state, taskManager) {
//     					var availableTasks = taskManager.availableTasksList;
						//deal with this later
     				}]
     			},
     			controller : 'TaskSelectCtrl',
     			templateUrl : 'partials/taskSelect.html'
     		})
    }])

    .run(['gameStateManager', function(gameStateManager) {

    	var task = {'name':"Free the dullard from the torture chamber.", 'durationMillis':5000, 'id':'123'};
    	gameStateManager.newTaskSelected(task);
    }]);

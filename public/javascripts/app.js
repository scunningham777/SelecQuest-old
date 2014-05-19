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
     				availableTasks: ['taskSelectManager',
     				function(taskSelectManager) {
     					var availableTasks = taskSelectManager.getAvailableTasksList();
						//somehow make sure we're not in the middle of another task and somehow got to this state on accident?

						return availableTasks;
     				}]
     			},
     			controller : 'TaskSelectCtrl',
     			templateUrl : 'partials/taskSelect.html'
     		})
    }])

    .run(['$state', 'gameStateManager', function($state, gameStateManager) {

//    	var task = {'name':"Free the dullard from the torture chamber.", 'durationMillis':5000, 'id':'123'};
//    	gameStateManager.newTaskSelected(task);
		$state.go('taskSelect');

    }]);

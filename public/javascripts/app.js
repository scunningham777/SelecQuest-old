angular.module('crawlerQuestApp', ['ui.router', 'App.Controllers', 'App.Services'])



    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    	$urlRouterProvider.otherwise('/');

        $stateProvider

        	.state("progress", {
        		url: '/progress/:selectedActiveTaskInstance',
        		resolve: {
        			selectedActiveTaskInstance: ['$stateParams', 'taskManager', 
        			function($stateParams, taskManager) {
        				var selectedTask = taskManager.getActiveTaskInstanceById($stateParams.selectedActiveTaskInstance);
        				return selectedTask;
        			}]
        		},
            	controller : 'TaskProgressCtrl',
            	templateUrl : 'partials/taskProgress.html'
     		})
    }])

    .run(['gameStateManager', function(gameStateManager) {

    	var task = {'name':"Test Task", 'durationMillis':10000, 'id':'123'};
//    	gameStateManager.newTaskSelected(task);
    }]);

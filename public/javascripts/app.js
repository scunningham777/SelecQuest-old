angular.module('crawlerQuestApp', ['ui.router', 'App.Controllers', 'App.Services', 'ui.bootstrap'])



    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    	$urlRouterProvider.otherwise('/');

        $stateProvider

        	.state("crawler", {
 //       		abstract:true,
        		templateUrl: 'partials/phoneMain.html',
        		controller: ['$scope', '$state', 'taskManager', 'characterManager', function($scope, $state, taskManager, characterManager){
        			$scope.currentCharacter = characterManager.getCurrentCharacterDetails();
        			$scope.characterDetailsExpanded = false;
        			if (taskManager.hasActiveTask()) {
        				$state.go('crawler.activeTask');
        			}
        			else {
        				$state.go('crawler.taskSelect');
        			}

        		}]
        	})

        	.state("crawler.activeTask", {
        		params: ['selectedActiveTaskInstance'],
        		resolve: {
        			selectedActiveTaskInstance: ['$state', '$stateParams', 'taskManager', 
        			function($state, $stateParams, taskManager) {
        				var selectedTask = taskManager.getActiveTaskInstanceById($stateParams.selectedActiveTaskInstance);
	       				return selectedTask;
        			}]
        		},
            	controller : 'TaskProgressCtrl',
            	templateUrl : 'partials/taskProgress.html'
     		})

     		.state("crawler.taskSelect", {
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

     		.state("history", {
     			resolve: {
     				characterTaskResults: ['characterManager', 
     				function(characterManager) {
     					var characterTaskHistory = characterManager.getCurrentCharacterTaskHistory();
     					return characterTaskHistory;
     				}]
     			},
     			controller : 'taskHistoryCtrl',
     			templateUrl : 'partials/taskHistory.html'
     		})

    }])

    .run(['$state', function($state) {

		$state.go('crawler');
//		$state.go('history');

    }]);

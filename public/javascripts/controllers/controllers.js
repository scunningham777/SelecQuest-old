angular.module('App.Controllers', ['App.Services'])

    .controller('TaskProgressCtrl', ['$scope', 'selectedActiveTaskInstance', function($scope, selectedActiveTaskInstance ) {
        $scope.currentTaskInstance = selectedActiveTaskInstance;
    }])

    .controller('TaskSelectCtrl', ['$scope', 'gameStateManager', 'availableTasks', function($scope, gameStateManager, availableTasks) {
    	$scope.availableTasksList = availableTasks;

    	$scope.taskSelected = function(selectedTaskId) {
    		gameStateManager.newTaskSelected($scope.availableTasksList[selectedTaskId]);
    	}
    }]);
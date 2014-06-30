angular.module('App.Controllers', ['App.Services'])

    .controller('TaskProgressCtrl', ['$scope', '$interval', 'selectedActiveTaskInstance', function($scope, $interval, selectedActiveTaskInstance ) {
        $scope.completed = false;
        $scope.currentTaskInstance = selectedActiveTaskInstance;
        var taskUpdateInterval = $interval(updateTaskCompletionPercentage, 100);	//TODO: need to kill this when the controller is done?

        function updateTaskCompletionPercentage() {
        	var taskStartTime = $scope.currentTaskInstance.startTime;
        	var taskDurationMillis = $scope.currentTaskInstance.durationMillis;
        	var currentTime = new Date().getTime();
        	$scope.currentTaskInstance.currentProgressPercent = getPercentComplete(taskStartTime, taskDurationMillis, currentTime);

        	if ($scope.currentTaskInstance.completed == true){
        		taskCompleted();
        	}
        };

		function getPercentComplete(startTime, durationInMillis, currentTime) {
			var elapsedTimeInMillis = currentTime - startTime;
			var elapsedTimeFraction = elapsedTimeInMillis / durationInMillis;
			var elapsedTimePercentage = elapsedTimeFraction * 100;

			return Math.round(elapsedTimePercentage);
		};

		function taskCompleted(){
			$interval.cancel(taskUpdateInterval);
			$scope.currentTaskInstance.currentProgressPercent = 100;
			$scope.completed = true;
		};

    }])

    .controller('TaskSelectCtrl', ['$scope', 'gameStateManager', 'availableTasks', function($scope, gameStateManager, availableTasks) {
    	$scope.availableTasksList = availableTasks;

    	$scope.taskSelected = function(selectedTaskId) {
    		gameStateManager.newTaskSelected($scope.availableTasksList[selectedTaskId]);
    	};
    }])

    .controller('taskHistoryCtrl', ['$scope', '$state', 'characterTaskResults', function($scope, $state, characterTaskResults){
    	$scope.characterTaskResults = characterTaskResults;

    	$scope.goBack = function() {
    		$state.go('crawler');
    	};
    }]);
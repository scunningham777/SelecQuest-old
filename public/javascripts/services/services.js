/**
 * Created by scunningham on 12/28/13.
 */
angular.module('App.Services', [])

	.factory('gameStateManager', ['taskManager', 'taskInstanceFactory', '$state',  function(taskManager, taskInstanceFactory, $state) {
		var self = {};

		self.newTaskSelected = function(selectedTask) {
			var newTaskInstance = taskInstanceFactory.generateNewTaskInstance(selectedTask, new Date().getTime(), self.taskInstanceCompleted);

			taskManager.startNewTaskInstance(newTaskInstance, startNewTaskSuccess, null);
			
			function startNewTaskSuccess(startedTaskInstance) {
				//taskManager.clearAvailableTasksList();
				//navigate to TaskProgressView
				$state.go('activeTask', {'selectedActiveTaskInstance': startedTaskInstance.id}, {location:false});
			};
		};
		
		self.taskInstanceCompleted = function(completedTaskInstance) {
			//pass completedTaskInstance and generateTaskResultsSuccess to taskResultGenerator service
			saveTaskResultsSuccess(null);
			
			function generateTaskResultsSuccess(taskResults){
				//pass taskResults and saveTaskResultsSuccess to characterManager service
				console.log("task results generated!");
			};
			
			function saveTaskResultsSuccess(taskResults) {
//					taskManager.removeTaskInstanceById(completedTaskInstance.id, null, null);			
			};
			
		};

		return self;
	}])
	
	.factory('taskInstanceFactory', function(){
		var self = {};
		
		self.generateNewTaskInstance = function(newTask, startTime, completionDelegate) {
			var finishTime = new Date(startTime + (newTask.durationMillis));
			var newTaskInstance = {
				'id':newTask.id, 
				'name':newTask.name, 
				'durationMillis':newTask.durationMillis, 
				'startTime':startTime, 
				'finishTime': finishTime.getTime(), 
				'currentProgressPercent':0, 
				'completionDelegate':completionDelegate
			};
			
			return newTaskInstance;
		}
		
		return self;
	})

    .factory('taskManager', ['$interval', '$state', 'taskInstanceFactory', function($interval, $state, taskInstanceFactory) {
        var self = {};
		self.activeTaskInstances = {};
		self.taskUpdateEnabled = false;
		self.taskUpdateInterval = null;
		
		self.getActiveTaskInstanceById = function(requestedId) {
			if (requestedId == null) {return null};

			return self.activeTaskInstances[requestedId];
		};

       self.startNewTaskInstance = function (newTaskInstance, onSuccess, onError) {
			if(newTaskInstance == null) {
				onError("Cannot start null task");
			}
		
			self.activeTaskInstances[newTaskInstance.id] = newTaskInstance;
			
			self.startTaskUpdateInterval();
		
            onSuccess(newTaskInstance);
        };
		
		self.removeTaskInstanceById = function(targetTaskId, onSuccess, onError)  {
			if (self.activeTaskInstances.hasOwnProperty(targetTaskId)) {
				delete self.activeTaskInstances[targetTaskId];
				self.checkToCancelUpdateInterval();
				if (onSuccess != null){
					onSuccess(targetTaskId);
				}
			}
			else {
				self.checkToCancelUpdateInterval();
				if (onError != null) {
					onError(targetTaskId);
				}
			}
		};
		
		self.startTaskUpdateInterval = function() {
			self.taskUpdateEnabled = true;
			if (!self.taskUpdateInterval) {
				self.taskUpdateInterval = $interval(self.checkAllTasksProgress, 100);
			}
		};
		
		self.cancelTaskUpdateInterval = function() {
			self.taskUpdateEnabled = false;
			if (self.taskUpdateInterval) {
				$interval.cancel(self.taskUpdateInterval);
				self.taskUpdateInterval = null;
			}
		};
		
 		self.checkToCancelUpdateInterval = function() {
			for (var key in self.activeTaskInstances) {
				if (self.activeTaskInstances.hasOwnProperty(key)) {
					return;
				}
			}
			self.cancelTaskUpdateInterval();
		};
		
		self.checkAllTasksProgress = function(){
			for (var taskId in self.activeTaskInstances){
				self.checkTaskProgressById(taskId);
			}
		};
		
		self.checkTaskProgressById = function(targetTaskId, onSuccess, onError){
			if (self.activeTaskInstances.hasOwnProperty(targetTaskId)) {
				var checkedTaskInstance = self.activeTaskInstances[targetTaskId];
				var currentTime = new Date().getTime();


				if (checkedTaskInstance.finishTime <= currentTime) {
					completeTask(targetTaskId);
				}
				else {
					//check for partial accomplishments?
					
				}

				checkedTaskInstance.currentProgressPercent = getPercentComplete(checkedTaskInstance.startTime, checkedTaskInstance.durationMillis, currentTime);

				if (onSuccess != null){
					onSuccess(targetTaskId);
				}
			}
			else {
				if (onError != null) {
					onError(targetTaskId);
				}
			}
		};
		
		getPercentComplete = function(startTime, durationInMillis, currentTime) {
			var elapsedTimeInMillis = currentTime - startTime;
			var elapsedTimeFraction = elapsedTimeInMillis / durationInMillis;
			var elapsedTimePercentage = elapsedTimeFraction * 100;
			return Math.round(elapsedTimePercentage);
		};

		completeTask = function(targetTaskId){
			var completedTaskInstance = self.activeTaskInstances[targetTaskId];
			if (completedTaskInstance.completionDelegate != null) {
				completedTaskInstance.completionDelegate();
				self.removeTaskInstanceById(targetTaskId);
			}
			else {
				self.removeTaskInstanceById(targetTaskId);
			}
			console.log("Task completed!");				

		};
		
		return self;
	}]);
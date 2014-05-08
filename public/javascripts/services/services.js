/**
 * Created by scunningham on 12/28/13.
 */
angular.module('App.Services', [])

	.factory('gameStateManager', ['taskManager', '$state', function(taskManager, $state) {
		return {
			newTaskSelected : function(selectedTask) {
				taskManager.startNewTask(startNewTaskSuccess, null, selectedTask);
				
				function startNewTaskSuccess(startedTaskInstance) {
					taskManager.clearAvailableTasksList();
					//navigate to TaskProgressView
					$state.go('progress', {'selectedActiveTaskInstance': startedTaskInstance.id}, {location:false});
				};
			},
			
			taskInstanceCompleted : function(completedTaskInstance) {
				//pass completedTaskInstance and generateTaskResultsSuccess to taskResultGenerator service
				saveTaskResultsSuccess(null);
				
				function generateTaskResultsSuccess(taskResults){
					//pass taskResults and saveTaskResultsSuccess to characterManager service
				};
				
				function saveTaskResultsSuccess(taskResults) {
					taskManager.removeTaskInstanceById(removeTaskInstanceSuccess, null, completedTaskInstance.id);			
				};
				
				function removeTaskInstanceSuccess() {
					//navigate to TaskHistoryview, informing it that a new task has completed
				};
			}
		};
	}])
	
	.factory('taskInstanceFactory', function(){
		self = {};
		
		self.generateNewTaskInstance = function(newTask, startTime) {
			var finishTime = new Date(startTime + (newTask.durationMillis));
			var newTaskInstance = {'id':newTask.id, 'name':newTask.name, 'durationMillis':newTask.durationMillis, 'startTime':startTime, 'finishTime': finishTime.getTime(), 'currentProgressPercent':0};
			
			return newTaskInstance;
		}
		
		return self;
	})

    .factory('taskManager', ['taskInstanceFactory', /*'gameStateManager',*/ '$interval', '$state', function(taskInstanceFactory, /*gameStateManager,*/ $interval, $state) {
        self = {};
		self.availableTasksList = {};
		self.activeTaskInstances = {};
		self.taskUpdateEnabled = false;
		self.taskUpdateInterval = null;
		
		self.getActiveTaskInstanceById = function(requestedId) {
			return self.activeTaskInstances[requestedId];
		}

		self.clearAvailableTasksList = function() {
			self.availableTasksList = {};
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
		
        self.startNewTask = function (onSuccess, onError, newTask) {
			if(newTask == null) {
				onError("Cannot start null task");
			}
		
			var newTaskInstance = taskInstanceFactory.generateNewTaskInstance(newTask, new Date().getTime());
		
			self.activeTaskInstances[newTaskInstance.id] = newTaskInstance;
			
			self.startTaskUpdateInterval();
		
            onSuccess(newTaskInstance);
        };
		
		self.removeTaskInstanceById = function( onSuccess, onError, targetTaskId)  {
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
		
		self.checkToCancelUpdateInterval = function() {
			for (var key in self.activeTaskInstances) {
				if (self.activeTaskInstances.hasOwnProperty(key)) {
					self.cancelTaskUpdateInterval();
				}
			}
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
					self.completeTask(null, null, targetTaskId);
				}
				else {
					//check for partial accomplishments?
					
				}

				checkedTaskInstance.currentProgressPercent = self.getPercentComplete(checkedTaskInstance.startTime, checkedTaskInstance.durationMillis, currentTime);

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
		
		self.completeTask = function(onSuccess, onError, targetTaskId){
			if (self.activeTaskInstances.hasOwnProperty(targetTaskId)){
//				gameStateManager.taskInstanceCompleted(self.activeTaskInstances[targetTaskId]);
				console.log("Task completed!");
			}
		};

		self.getPercentComplete = function(startTime, durationInMillis, currentTime) {
			var elapsedTimeInMillis = currentTime - startTime;
			var elapsedTimeFraction = elapsedTimeInMillis / durationInMillis;
			var elapsedTimePercentage = elapsedTimeFraction * 100;
			return Math.round(elapsedTimePercentage);
		}
		
		
		return self;
	}]);
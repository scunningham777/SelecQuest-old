/**
 * Created by scunningham on 12/28/13.
 */
angular.module('App.Services', [])

	.factory('gameStateManager', ['taskManager', 'taskInstanceFactory', '$state', function(taskManager, taskInstanceFactory, $state) {
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
			generateTaskResultsSuccess(null);
			
			function generateTaskResultsSuccess(taskResults){
				//pass taskResults and saveTaskResultsSuccess to characterManager service
				console.log("task results generated for task " + completedTaskInstance.name + "!");
				saveTaskResultsSuccess(taskResults);
			};
			
			function saveTaskResultsSuccess(taskResults) {
//					taskManager.removeTaskInstanceById(completedTaskInstance.id, null, null);
				$state.go('taskSelect');		
			};
			
		};

		return self;
	}])
	
   .factory('taskManager', ['$interval', function($interval) {
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
		
            if (onSuccess != null) {
            	onSuccess(newTaskInstance);
            }
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

				checkedTaskInstance.currentProgressPercent = getPercentComplete(checkedTaskInstance.startTime, checkedTaskInstance.durationMillis, currentTime);


				if (checkedTaskInstance.finishTime <= currentTime) {
					completeTask(targetTaskId);
				}
				else {
					//check for partial accomplishments?
					
				}

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
		
		function getPercentComplete(startTime, durationInMillis, currentTime) {
			var elapsedTimeInMillis = currentTime - startTime;
			var elapsedTimeFraction = elapsedTimeInMillis / durationInMillis;
			var elapsedTimePercentage = elapsedTimeFraction * 100;
			return Math.round(elapsedTimePercentage);
		};

		function completeTask(targetTaskId){
			var completedTaskInstance = self.activeTaskInstances[targetTaskId];
			if (completedTaskInstance.completionDelegate != null) {
				completedTaskInstance.completionDelegate(completedTaskInstance);
				self.removeTaskInstanceById(targetTaskId);
			}
			else {
				self.removeTaskInstanceById(targetTaskId);
			}
			console.log("Task completed!");				

		};
		
		return self;
	}])

	.factory('taskSelectManager', ['utils', function(utils) {
		var self = {};
		self.availableTasksList = {};

		self.getAvailableTasksList = function() {
			if (utils.isObjectEmpty(self.availableTasksList)) {
				self.availableTasksList = self.generateNewTasksList();
			}

			return self.availableTasksList;
		};

		self.generateNewTasksList = function() {
			var tasksList = {};
			tasksList['111'] = {'name':"Free the dullard from the torture chamber.", 'durationMillis':5000, 'id':'111'};
			tasksList['112'] = {'name':"Keep grandmother company.", 'durationMillis':10000, 'id':'112'};
			tasksList['113'] = {'name':"Clear the rooftop of dire chickens.", 'durationMillis':7000, 'id':'113'};

			return tasksList;
		}

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

 	.factory('taskResultGenerator', ['utils', function(utils) {
		var self = {};

		self.generateTaskResults = function(completedTaskInstance, wasCompletionSuccessful, onSuccess, onError) {
			var taskResults = {
				'id' : completedTaskInstance.id,
				'name' : completedTaskInstance.name,
				'durationMillis' : completedTaskInstance.durationMillis,
				'finishTime' : completedTaskInstance.finishTime,
				'hasCompletionAnimationPlayed' : false,
				'experience' : 10,
				'gold' : 15,
				'gossip' : 25,
				'items' : ['A Golden Toothpick'],
				'skills' : ['Turtle Breath']
			};


			if (onSuccess != null) {
				onSuccess(taskResults);
			}
		};

		return self;
	}])

	.factory('utils', function() {
		var self = {};

		self.isObjectEmpty = function(obj){
		    for(var prop in obj) {
			    if(obj.hasOwnProperty(prop))
				    return false;
				}
   			return true;
		};

		return self;
	})


	.factory('entityValidator', function() {
		var self = {};

		self.isValidTask = function(testee){
			return true;
		}

		self.isValidTaskInstance = function(testee){
			return true;
		}

		return self;
	});
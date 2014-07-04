/**
 * Created by scunningham on 12/28/13.
 */
angular.module('App.Services', [])

	.factory('gameStateManager', ['$state', '$rootScope', '$timeout', 'taskManager', 'taskInstanceFactory', 'taskResultGenerator', 'characterManager', function($state, $rootScope, $timeout, taskManager, taskInstanceFactory, taskResultGenerator, characterManager) {
		var self = {};

		self.newTaskSelected = function(selectedTask) {
			var newTaskInstance = taskInstanceFactory.generateNewTaskInstance(selectedTask, new Date().getTime(), self.taskInstanceCompleted);

			taskManager.startNewTaskInstance(newTaskInstance, startNewTaskSuccess, null);
			
			function startNewTaskSuccess(startedTaskInstance) {
				//navigate to TaskProgressView
				$state.go('crawler.activeTask', {'selectedActiveTaskInstance': startedTaskInstance.id}, {location:false});
			};
		};
		
		self.taskInstanceCompleted = function(completedTaskInstance) {
			//pass completedTaskInstance and generateTaskResultsSuccess to taskResultGenerator service
			taskResultGenerator.generateTaskResults(completedTaskInstance, true, generateTaskResultsSuccess, null);
			
			function generateTaskResultsSuccess(taskResults){
				//pass taskResults and saveTaskResultsSuccess to characterManager service
				console.log("task results generated for task " + completedTaskInstance.name + "!");
				characterManager.addTaskResultToCharacterHistory(taskResults, saveTaskResultsSuccess, null);
			};
			
			function saveTaskResultsSuccess(taskResults) {
//					taskManager.removeTaskInstanceById(completedTaskInstance.id, null, null);
				$timeout(function() {$state.go('history')}, 1000);		
			};
			
		};

		$rootScope.$on('taskCompleted', function(event, args) {
				if (args.completionDelegate != null) {args.completionDelegate(args.completedTaskInstance)};
			});

		return self;
	}])
	
   .factory('taskManager', ['$interval', '$rootScope', 'utils', function($interval, $rootScope, utils) {
        var self = {};
		self.activeTaskInstances = {};
		self.taskUpdateEnabled = false;
		self.taskUpdateInterval = null;

		self.hasActiveTask = function() {
			if (utils.isObjectEmpty(self.activeTaskInstances)) {
				return false;
			}
			return true;
		}
		
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
				self.taskUpdateInterval = $interval(self.checkAllTasksProgress, 500);
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
			if (utils.isObjectEmpty(self.activeTaskInstances)) {
				self.cancelTaskUpdateInterval();
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
				if (checkedTaskInstance.completed == true) {
					completeTask(targetTaskId);
				}

				var currentTime = new Date().getTime();

				if (checkedTaskInstance.finishTime < currentTime) {
					checkedTaskInstance.completed = true;
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
		
		function completeTask(targetTaskId){
			var completedTaskInstance = self.activeTaskInstances[targetTaskId];
			if (completedTaskInstance.completionDelegate != null) {
//				completedTaskInstance.completionDelegate(completedTaskInstance);
				$rootScope.$broadcast("taskCompleted", {'completedTaskInstance':completedTaskInstance, 'completionDelegate':completedTaskInstance.completionDelegate });
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
			tasksList['112'] = {'name':"Keep grandmother company.", 'durationMillis':20000, 'id':'112'};
			tasksList['113'] = {'name':"Clear the rooftop of dire-chickens.", 'durationMillis':7000, 'id':'113'};

			return tasksList;
		}

		return self;
	}])

	.factory('characterManager', ['entityValidator', function(entityValidator) {
		var self = {};

		var currentCharacter; 		//don't lazy load!

		self.getCurrentCharacterTaskHistory = function() {
			return currentCharacter.taskHistory;
		}

		self.getCurrentCharacterDetails = function() {
			return currentCharacter;
		}

		self.addTaskResultToCharacterHistory = function(newTaskResult, onSuccess, onError) {
			if ( ! entityValidator.isValidTaskResult(newTaskResult)) {
				if(onError != null) {
					onError("Invalid Task Result object!");
				}
			}

			currentCharacter.xp += newTaskResult.xp;
			currentCharacter.gold += newTaskResult.gold;
			currentCharacter.gossip += newTaskResult.gossip;

			currentCharacter.taskHistory.push(newTaskResult);

			if (onSuccess != null) {
				onSuccess(newTaskResult);
			}
		}

		//load the character
		function onLoadCharacterSuccess(loadedCharacter) {
			currentCharacter = loadedCharacter;
		}

		function onLoadCharacterError(errorMessage) {
			console.log(errorMessage);
		}

		function loadCharacter() {
			var character = {};

			character.name = "Tomas";
			character.epithets = ["The Turk", "Big Nemesis"];
			character.pedigree = ["Son of Grenph", "Daughter of Milgrock", "Foster-son of Benigon"];
			character.race = "Rockman";
			character.class = "Tarp-folder";
			character.level = 1;
			character.xp = 0;
			character.gold = 0;
			character.gossip = 0;
			character.taskHistory = [];
			character.attributes = {
				"Brawn":10,
				"Flexibility":12,
				"Coordination":16,
				"Resilience":11,
				"Wit":9,
				"Knowledge":14,
				"Test-taking Skills":17,
				"People Skills":14
			};


			onLoadCharacterSuccess(character);
		}

		loadCharacter();

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
				'xp' : 10,
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
		};

		self.isValidTaskInstance = function(testee){
			return true;
		};

		self.isValidTaskResult = function(testee){
			return true;
		};

		return self;
	});
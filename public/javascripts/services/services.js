/**
 * Created by scunningham on 12/28/13.
 */
angular.module('App.Services', [])

	.factory('gameStateManager', ['$state', '$rootScope', '$timeout', 'taskManager', 'taskInstanceGenerator', 'taskResultGenerator', 'characterManager', function($state, $rootScope, $timeout, taskManager, taskInstanceGenerator, taskResultGenerator, characterManager) {
		var self = {};

		self.newTaskSelected = function(selectedTask) {
			var newTaskInstance = taskInstanceGenerator.generateNewTaskInstance(selectedTask, new Date().getTime(), self.taskInstanceCompleted);

			taskManager.startNewTaskInstance(newTaskInstance, startNewTaskSuccess, null);
			
			function startNewTaskSuccess(startedTaskInstance) {
				//navigate to TaskProgressView
				$state.go('crawler.activeTask', {'selectedActiveTaskInstance': startedTaskInstance.id}, {location:false});
			};
		};
		
		self.taskInstanceCompleted = function(completedTaskInstance) {
			//pass completedTaskInstance and generateTaskResultsSuccess to taskResultGenerator service
			completedTaskInstance.wasCompletedSuccessfully = true;
			taskResultGenerator.generateTaskResults(completedTaskInstance, generateTaskResultsSuccess, null);
			
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

	.factory('characterManager', ['entityValidator', 'utils', function(entityValidator, utils) {
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

			for (var property in newTaskResult.propertyAdjustments){
				if (currentCharacter.hasOwnProperty(property)){
					var value = newTaskResult.propertyAdjustments[property];
					if ("number" === utils.typeOf(value)){
						currentCharacter[property] += value;
					}
					else if ("array" === utils.typeOf(value)){
						//currentCharacter[property] = currentCharacter[property].concat(value);
						addCharacterPropertyObject(property, value);
					}
				}
			}
		
			currentCharacter.taskHistory.push(newTaskResult);

			if (50 < currentCharacter.taskHistory.length){
				currentCharacter.taskHistory.splice(0,1);
			}

			if (onSuccess != null) {
				onSuccess(newTaskResult);
			}
		}

		function addCharacterPropertyObject(propertyName, value){
			switch(propertyName){
				case "attributes":
					for (var i = 0; i < value.length; i++){
						var existing = utils.search(currentCharacter.attributes, "friendlyName", value[i].friendlyName);
						if (0 < existing.length){
							existing.value += value.value;
						}
					}
					break;
				case "gear":
					for (var i = 0; i < value.length; i++){
						var existing = utils.search(currentCharacter.gear, "category", value[i].category);
						if ((value[i].category != "ring" && 0 < existing.length) || 1 < existing.length){
							var gearTurnedLootAsArray = [{friendlyName:existing[0].friendlyName, baseValue:existing[0].baseValue?existing[0].baseValue:1, quantity:1}];
							addCharacterPropertyObject("loot", gearTurnedLootAsArray);

							//somehow remove existing[0] from currentCharacter.gear
							currentCharacter.gear.splice(currentCharacter.gear.indexOf(existing[0]), 1);
						}

						currentCharacter.gear.push(value[i]);

					}
					break;
				case "loot":
					for (var i = 0; i < value.length; i++){
						var existing = utils.search(currentCharacter.loot, "friendlyName", value[i].friendlyName);
						if (0 < existing.length){
							existing[0].quantity += value[i].quantity;
						}
						else {
							currentCharacter.loot.push(value[i]);
						}
					}
					break;
				case "spells":
					for (var i = 0; i < value.length; i++){
						var existing = utils.search(currentCharacter.spells, "friendlyName", value[i].friendlyName);
						if (0 < existing.length){
							existing[0].level += value[i].level;
						}
						else {
							currentCharacter.spells.push(value[i]);
						}
					}
					break;
				case "abilities":
					for (var i = 0; i < value.length; i++){
						var existing = utils.search(currentCharacter.abilities, "friendlyName", value[i].friendlyName);
						if (0 < existing.length){
							existing[0].level += value[i].level;
						}
						else {
							currentCharacter.abilities.push(value[i]);
						}
					}
					break;
				case "epithets":
					for (var i = 0; i < value.length; i++){
						if (currentCharacter.epithets.indexOf(value[i]) == -1) {
							currentCharacter.epithets.push(value[i]);
						}
					}
					break;
				case "pedigree":
					for (var i = 0; i < value.length; i++){
						if (currentCharacter.pedigree.indexOf(value[i]) == -1) {
							currentCharacter.pedigree.push(value[i]);
						}
					}
					break;
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
			character.maxEncumbrance = 15;
			character.currentHp = 22;
			character.maxHp = 22;
			character.taskHistory = [];
			character.attributes = [
				{friendlyName:"Brawn", value:10},
				{friendlyName:"Flexibility", value:122},
				{friendlyName:"Coordination", value:1623},
				{friendlyName:"Resilience", value:11},
				{friendlyName:"Wit", value:9},
				{friendlyName:"Knowledge", value:14},
				{friendlyName:"Test-taking Skills", value:17},
				{friendlyName:"People Skills", value:14}
			];
			character.gear = [
				{category:"weapon", friendlyName:"Turkish Tusk"},
				{category:"cuirass", friendlyName:"Mahogany Shingle-mail"},
				{category:"weapon", friendlyName:"Turkish Tusk"},
				{category:"cuirass", friendlyName:"Mahogany Shingle-mail"},
				{category:"weapon", friendlyName:"Turkish Tusk"},
				{category:"cuirass", friendlyName:"Mahogany Shingle-mail"},
				{category:"weapon", friendlyName:"Turkish Tusk"},
				{category:"cuirass", friendlyName:"Mahogany Shingle-mail"},
				{category:"weapon", friendlyName:"Turkish Tusk"},
				{category:"cuirass", friendlyName:"Mahogany Shingle-mail"},
				{category:"ring", friendlyName:"Ring of Big Crush"}
			];
			character.loot = [
				{friendlyName:"Corded Pot", baseValue:3, quantity:1},
				{friendlyName:"Hunk of Shiny Metal", baseValue:1, quantity:2},
				{friendlyName:"Corded Pot", baseValue:3, quantity:1},
				{friendlyName:"Hunk of Shiny Metal", baseValue:1, quantity:2},
				{friendlyName:"Corded Pot", baseValue:3, quantity:1},
				{friendlyName:"Hunk of Shiny Metal", baseValue:1, quantity:2},
				{friendlyName:"Corded Pot", baseValue:3, quantity:1},
				{friendlyName:"Hunk of Shiny Metal", baseValue:1, quantity:2},
				{friendlyName:"Corded Pot", baseValue:3, quantity:1},
				{friendlyName:"Hunk of Shiny Metal", baseValue:1, quantity:2},
				{friendlyName:"Corded Pot", baseValue:3, quantity:1},
				{friendlyName:"Hunk of Shiny Metal", baseValue:1, quantity:2}
			];
			character.spells = [
				{friendlyName:"Tonguehairs", level:3},
				{friendlyName:"Digest", level:5}
			];
			character.abilities = [
				{friendlyName:"Slow Motion Run", level:3},
				{friendlyName:"Somersault", level:1}
			]

			onLoadCharacterSuccess(character);
		}

		loadCharacter();

		return self;
	}])

	.factory('taskInstanceGenerator', function(){
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
				'completionDelegate':completionDelegate,
				'wasCompletedSuccessfully': false,
				'doesResetHealth': false,
				'primaryRewardCategory': "xp",
				'secondaryRewardCategory': "gold",
				'percentChanceOfSpecialReward': 2
			};
			
			return newTaskInstance;
		}
		
		return self;
	})

	.factory('characterEntityGenerator', function() {
		var self = {};

		self.generateCharacterEntity = function(entityType) {
			var newEntity = null;
			var attributes = ['Brawn', 'Flexibility', 'Coordination', 'Resilience', 'Wit', 'Knowledge', 'Test-taking Skills', 'People Skills'];

			switch(entityType) {
				case "epithets":
					newEntity = generateNewEpithet();
					break;
				case "maxHp":
					newEntity = 1;
					break;
				case "maxEncumbrance":
					newEntity = 1;
					break;
				case "attributes":
					newEntity = {friendlyName: attributes[Math.floor(Math.random() * attributes.length)], value:1};
					break;
				case "gear":
					newEntity = generateNewGear();
					break;
				case "loot":
					newEntity = generateNewLoot();
					break;
				case "spells":
					newEntity = generateNewSpell();
					break;
				case "abilities":
					newEntity = generateNewAbility();
					break;
			}

			console.log("new " + entityType + " created!");

			return newEntity;
		}

		function generateNewEpithet() {
			return "Ruby-throated";
		}

		function generateNewGear() {
			return {category:"weapon", friendlyName:"Taserclaw"};
		}

		function generateNewLoot() {
			switch (Math.floor(Math.random() * 2)) {
				case 0:
					return {friendlyName:'A Golden Toothpick', baseValue:2, quantity:1};
					break;
				case 1:
					return {friendlyName:'Pretty Rope', baseValue:1, quantity:1};
					break;
			}
			
		}

		function generatenewSpell() {
			return {friendlyName:"Doubleflush", level:1};
		}

		function generateNewAbility() {
			return {friendlyName:'Turtle Breath', level:1};
		}

		return self;
	})

 	.factory('taskResultGenerator', ['utils', 'characterEntityGenerator', function(utils, characterEntityGenerator) {
		var self = {};

		self.generateTaskResults = function(completedTaskInstance, onSuccess, onError) {
			var propertyAdjustments = generatePropertyAdjustments(completedTaskInstance);

			var taskResults = {
				'id' : completedTaskInstance.id,
				'name' : completedTaskInstance.name,
				'durationMillis' : completedTaskInstance.durationMillis,
				'finishTime' : completedTaskInstance.finishTime,
				'hasCompletionAnimationPlayed' : false,
				'doesResetHealth' : completedTaskInstance.doesResetHealth,
				'propertyAdjustments' : propertyAdjustments
			};


			if (onSuccess != null) {
				onSuccess(taskResults);
			}
		};

		function generatePropertyAdjustments(completedTaskInstance){
			var propertyAdjustments = {};

			var actualDurationMillis,
			primaryRewardAdjustment, 
			secondaryRewardAdjustment,
			hpAdjustment;
			var specialReward = null;
			var lootAcquired = [];


			actualDurationMillis = completedTaskInstance.finishTime - completedTaskInstance.startTime;

			primaryRewardAdjustment = Math.round(actualDurationMillis / 1000);
			secondaryRewardAdjustment = Math.round(primaryRewardAdjustment / 5);

			//TODO: basic loot should be generated with every task that has gold as primary or secondary reward
			//TODO: if special loot is generated as special reward, this should replace basic loot

			var doesGetSpecialReward = isSpecialRewardGranted(completedTaskInstance.percentChanceOfSpecialReward)
			if (completedTaskInstance.wasCompletedSuccessfully == true && doesGetSpecialReward) {
				specialReward = determineSpecialReward(completedTaskInstance);
			}

			if (completedTaskInstance.primaryRewardCategory == "xp") {
				hpAdjustment = Math.ceil(primaryRewardAdjustment) * -1;
			} 
			if (completedTaskInstance.secondaryRewardCategory == "xp") {
				hpAdjustment = Math.ceil(secondaryRewardAdjustment) * -1;
			}

			if ("gold" == completedTaskInstance.primaryRewardCategory) {
				lootAcquired = determineStandardLoot(primaryRewardAdjustment);
			}
			if ("gold" == completedTaskInstance.secondaryRewardCategory) {
				lootAcquired = lootAcquired.concat(determineStandardLoot(secondaryRewardAdjustment));
			}

			propertyAdjustments.currentHp = hpAdjustment;

			if ("gold" != completedTaskInstance.primaryRewardCategory) {
				propertyAdjustments[completedTaskInstance.primaryRewardCategory] = primaryRewardAdjustment;
			}
			if ("gold" != completedTaskInstance.secondaryRewardCategory) {
				propertyAdjustments[completedTaskInstance.secondaryRewardCategory] = secondaryRewardAdjustment;
			}

			if (0 < lootAcquired.length) {
				propertyAdjustments.loot = lootAcquired;
			}

			if (specialReward != null) {
				//this will replace "standard loot" if special reward type is "loot", which is what we want
				propertyAdjustments[specialReward.rewardType] = specialReward.rewardValue;
			}

			return propertyAdjustments;
		};

		function determineStandardLoot(lootValue) {
			return characterEntityGenerator.generateCharacterEntity("loot");
		}

		function isSpecialRewardGranted(percentChanceOfSpecialReward) {
			var randomResult = Math.random() * 100;
			if (randomResult < percentChanceOfSpecialReward) {
				return true;
			}
			else {
				return false;
			}
		};

		function determineSpecialReward(completedTaskInstance) {
			var eligibleRewardTypes = ["epithets", "maxHp", "maxEncumbrance", "attributes", "gear", "loot", "spells", "abilities"];
			var specialReward = {};
			var specialRewardEntity;

			specialReward.rewardType = Math.floor(Math.random() * eligibleRewardTypes.length);

			specialRewardEntity = characterEntityGenerator.generateCharacterEntity(specialReward.rewardType);

			if (specialReward.rewardType == "maxHp" || specialReward.rewardType == "maxEncumbrance") {
				specialReward.rewardValue = specialRewardEntity;
			}
			else {
				specialReward.rewardValue = [];
				specialReward.rewardValue.push(specialRewardEntity);
			}

			return specialReward;
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

		self.typeOf = function(value) {
		    var s = typeof value;
		    if (s === 'object') {
		        if (value) {
		            if (value instanceof Array) {
		                s = 'array';
		            }
		        } else {
		            s = 'null';
		        }
		    }
		    return s;
		};

		self.search = function(source, field, value) {
			var results;

			value = value.toUpperCase();
			results = source.filter(function(entry) {
				return entry[field].toUpperCase().indexOf(value) !== -1;
			});
			return results;
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
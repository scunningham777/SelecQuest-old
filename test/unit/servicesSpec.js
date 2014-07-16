describe('Crawler Quest Services', function() {
	beforeEach(module('crawlerQuestApp'));

	it('should contain a gameStateManager service', inject(function(gameStateManager) {
		expect(gameStateManager).not.to.equal(null);
	}));
	
	it('should contain a taskInstanceFactory service', inject(function(taskInstanceFactory) {
		expect(taskInstanceFactory).not.to.equal(null);
	}));
	
	it('should contain a taskManager service', inject(function(taskManager) {
		expect(taskManager).not.to.equal(null);
	}));
	
	it('should contain a taskSelectManager service', inject(function(taskSelectManager) {
		expect(taskSelectManager).not.to.equal(null);
	}));

	it('should contain a characterManager service', inject(function(characterManager) {
		expect(characterManager).not.to.equal(null);
	}));

	it('should contain a utils service', inject(function(utils) {
		expect(utils).not.to.equal(null);
	}));

	describe('taskInstanceFactory service', function(){
		
		it('should generate a new task instance', inject(function(taskInstanceFactory) {
			var task = {'name':"testTask", 'durationMillis':10000};
			var startTime = new Date();
			var endTime = new Date(startTime.getTime() + 10000);
			var newTaskInstance = taskInstanceFactory.generateNewTaskInstance(task, startTime.getTime());
			
			expect(newTaskInstance.name).to.equal(task.name);
			expect(newTaskInstance.startTime).to.equal(startTime.getTime());
			expect(newTaskInstance.finishTime).to.equal(endTime.getTime());
		}));
	

	});
	
	describe('taskManager service', function(){
		var interval, taskManagerSvc;
		
		beforeEach(inject(function($injector, taskManager) {
			interval = $injector.get('$interval');
			taskManagerSvc = taskManager;
		}));
		
		it('should start, store, and manually stop a task instance', function() {
			var taskStartTime = new Date().getTime();
			var newTaskInstance = {'name':"testTask", 'durationMillis':10000, 'id':'1234', 'startTime':taskStartTime};
			var returnedTaskInstance;
			var startSuccess = function(taskInstance) {returnedTaskInstance = taskInstance};
			taskManagerSvc.startNewTaskInstance(newTaskInstance, startSuccess, null);
			
//			debugger
			expect(taskManagerSvc.activeTaskInstances).to.include.keys('1234');
			expect(returnedTaskInstance.startTime).to.be.lessThan(new Date().getTime());

			taskManagerSvc.removeTaskInstanceById('1234', null, null);
			expect(taskManagerSvc.activeTaskInstances).not.to.include.keys('1234');
		});

		it('should automatically update a task instance', function() {

//			debugger
			expect(taskManagerSvc.taskUpdateInterval).to.be.null;
		
			var taskCompleteDelegate = function(onSuccess) {

			};
			var taskCompleteSpy = chai.spy(taskCompleteDelegate);
			var taskStartTime = new Date().getTime();
			var taskFinishTime = taskStartTime + 500;
			var newTaskInstance = {'name':"testTask", 'durationMillis':500, 'id':'135', 'completionDelegate':taskCompleteSpy, 'startTime':taskStartTime, 'finishTime':taskFinishTime};
			var returnedTaskInstance;
			var startSuccess = function(taskInstance) {returnedTaskInstance = taskInstance};
			taskManagerSvc.startNewTaskInstance(newTaskInstance, startSuccess, null);
			expect(taskManagerSvc.taskUpdateInterval).not.to.be.null;
			
			//actually test that the task has updated 
			var taskUpdateSpy = chai.spy(taskManagerSvc.checkTaskProgressById);
			interval.flush(650);
			taskManagerSvc.checkTaskProgressById = taskUpdateSpy;
			interval.flush(150);

			expect(taskUpdateSpy).to.have.been.called();
//			expect(taskCompleteSpy).to.have.been.called();
		});
	});

	describe('utils service', function() {
		var spells = [
			{friendlyName:"Tonguehairs", level:3},
			{friendlyName:"Digest", level:5}
		];
		it('should be able to find an object array entry based on a specific field', inject(function(utils) {
			var results = utils.search(spells, "friendlyName", "Tonguehairs");

			expect(results.length).to.equal(1);
		}));

		it('should not find an entry that doesn\'t exist', inject(function(utils) {
			var results = utils.search(spells, "friendlyName", "Nonplus");
			expect(results.length).to.equal(0);
		}));

		it('should return a reference to original objects', inject(function(utils) {
			var results = utils.search(spells, "friendlyName", "Tonguehairs");

			results[0].level += 1;

			expect(spells[0].level).to.equal(4);
		}));
	});

	//CURRENTLY ALL OF THESE TESTS ARE TIGHTLY COUPLED WITH CURRENT FAKE "DEFAULT" CHARACTER INFO
	describe('characterManager service', function() {
		it('should add gear with new category', inject(function(characterManager) {
			//need to be careful - this test is checking the results based on the count of the gear property, which could change
			expect(characterManager.getCurrentCharacterDetails().gear.length).to.equal(11);

			var testResultsWithGear = {
				propertyAdjustments: {
					'gear':[{category:"piercing", friendlyName:"Septum of Crackling"}]
				}
			};
			characterManager.addTaskResultToCharacterHistory(testResultsWithGear, null, null);

			expect(characterManager.getCurrentCharacterDetails().gear.length).to.equal(12);
		}));

		it('should add gear with existing category (second ring)', inject(function(characterManager) {
			//need to be careful - this test is checking the results based on the count of the gear property, which could change
			expect(characterManager.getCurrentCharacterDetails().gear.length).to.equal(11);

			var testResultsWithGear = {
				propertyAdjustments: {
					'gear':[{category:"ring", friendlyName:"Ring of Crackling"}]
				}
			};

			characterManager.addTaskResultToCharacterHistory(testResultsWithGear, null, null);

			expect(characterManager.getCurrentCharacterDetails().gear.length).to.equal(12);
		}));

		it('should replace gear with existing category (third ring)', inject(function(characterManager) {
			//need to be careful - this test is checking the results based on the count of the gear property, which could change
			expect(characterManager.getCurrentCharacterDetails().gear.length).to.equal(11);
			expect(characterManager.getCurrentCharacterDetails().loot.length).to.equal(12);

			var testResultsWithGear = {
				propertyAdjustments: {
					'gear':[{category:"ring", friendlyName:"Ring of Crackling"}, {category:"ring", friendlyName:"Dull Wedding Band"}]
				}
			};
//			debugger
			characterManager.addTaskResultToCharacterHistory(testResultsWithGear, null, null);

			expect(characterManager.getCurrentCharacterDetails().gear.length).to.equal(12);
			expect(characterManager.getCurrentCharacterDetails().loot.length).to.equal(13);
		}));
	});
});
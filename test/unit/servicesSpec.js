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
});
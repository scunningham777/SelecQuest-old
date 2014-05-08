describe('Crawler Quest Services', function() {
	beforeEach(module('crawlerQuestApp'));
	
	it('should contain a taskInstanceFactory service', inject(function(taskInstanceFactory) {
		expect(taskInstanceFactory).not.to.equal(null);
	}));
	
	it('should contain a taskManager service', inject(function(taskManager) {
		expect(taskManager).not.to.equal(null);
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
			var task = {'name':"testTask", 'duration':10000, 'id':'123'};
			var newTaskInstance;
			var startSuccess = function(taskInstance) {newTaskInstance = taskInstance};
			taskManagerSvc.startNewTask(startSuccess, null, task);
			
//			debugger
			expect(taskManagerSvc.activeTaskInstances).to.include.keys('123');
			expect(newTaskInstance.startTime).to.be.lessThan(new Date().getTime());
			
			taskManagerSvc.removeTaskInstanceById(null, null, '123');
			expect(taskManagerSvc.activeTaskInstances).not.to.include.keys('123');
		});
		
		it('should start and update a task instance', function() {
			debugger
			expect(taskManagerSvc.taskUpdateInterval).to.be.null;
		
			var task = {'name':"testTask", 'durationMillis':5000, 'id':'123'};
			var newTaskInstance;
			var startSuccess = function(taskInstance) {newTaskInstance = taskInstance};
			taskManagerSvc.startNewTask(startSuccess, null, task);
			expect(taskManagerSvc.taskUpdateInterval).not.to.be.null;
			
			//actually test that the task has updated 
			var checkAllTasksProgressSpy = chai.spy(taskManagerSvc.checkTaskProgressById);
			interval.flush(600);
			expect(checkAllTasksProgressSpy).to.have.been.called();
		});
	});
});
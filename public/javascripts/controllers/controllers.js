angular.module('App.Controllers', ['App.Services'])

    .controller('TaskProgressCtrl', ['$scope', 'selectedActiveTaskInstance', function($scope, selectedActiveTaskInstance ) {
        $scope.currentTaskInstance = selectedActiveTaskInstance;
    }])

    .controller('TaskSelectCtrl', ['$scope', function($scope) {

    }]);
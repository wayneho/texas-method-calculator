/**
 * Created by wayne on 10/20/2015.
 */
var app = angular.module('TMCalc', []);

app.controller('mainController', ['$scope', function($scope){
    $scope.mainLifts = {
        squat: '',
        bench: '',
        deadlift: '',
        ohp: ''
    };
    console.log("hello?");

    $scope.generate = function(){
        //Do something with the numbers;
        console.log($scope.mainLifts);
    }
}]);
/**
 * Created by wayne on 10/20/2015.
 */
var app = angular.module('TMCalc', ['ngAnimate','ngRoute','ui.bootstrap']);

app.config(function($routeProvider){
    $routeProvider
        //Index page
        .when('/',{
            templateUrl: 'main.html',
            controller: 'mainController'
        })
        .when('/week-one',{
            templateUrl: 'program.html',
            controller: 'week-one'
        });
});

app.controller('mainController', ['$scope','$location','liftFactory', function($scope,$location,liftFactory){

    $scope.squat = 200;
    $scope.bench = 200;
    $scope.deadlift = 200;
    $scope.ohp = 200;

    $scope.updateFactory = function(){
        liftFactory.setData($scope.squat,$scope.squat,$scope.deadlift,$scope.ohp);
        $location.path('/week-one');
    };

}]);

app.controller('week-one',['$scope','liftFactory', function($scope,liftFactory){
    $scope.lifts = liftFactory.getData();

    var volumeDay = {
        exercise1: {
            name: "Squat",
            reps: "5x5",
            weight: $scope.lifts.squat * 0.9,
            difficulty: "Difficulty"
        },
        exercise2: {
            name: "Bench Press",
            reps: "5x5",
            weight: $scope.lifts.bench * 0.9,
            difficulty: "Difficulty"
        },
        exercise3: {
            name: "Accessory",
            reps: "-",
            weight: "-"
        }
    };

   var lightDay = {
        exercise1: {
            name: "Squat",
            reps: "2x5",
            weight: $scope.lifts.squat * 0.72
        },
        exercise2: {
            name: "Overhead Press",
            reps: "2x5",
            weight: $scope.lifts.ohp * 0.9
        },
        exercise3: {
            name: "Accessory",
            reps: "-",
            weight: "-"
        }
    };

    var intensityDay = {
        exercise1: {
            name: "Squat",
            reps: "1x5",
            weight: parseInt($scope.lifts.squat)+5,
            difficulty: "Difficulty"
        },
        exercise2: {
            name: "Bench Press",
            reps: "1x5",
            weight: parseInt($scope.lifts.bench)+5,
            difficulty: "Difficulty"
        },
        exercise3: {
            name: "Deadlift",
            reps: "1x5",
            weight: parseInt($scope.lifts.deadlift)+5,
            difficulty: "Difficulty"
        }
    };

    $scope.program = [
        {
            name: "Volume Day",
            workout: volumeDay
        },
        {
            name: "Light Day",
            workout: lightDay
        },
        {
            name: "Intensity Day",
            workout: intensityDay
        }
    ];

    $scope.appliedClass = function(difficulty){
        switch(difficulty){
            case "Easy":
                return "btn-success";
            case "Medium":
                return "btn-info";
            case "Hard":
                return "btn-warning";
            case "Failed":
                return "btn-danger";
            default:
                return "btn-primary";
        }
    };

}]);

app.factory('liftFactory',function(){
    var squat = '';
    var bench = '';
    var deadlift = '';
    var ohp = '';


    function setData(s,b,d,o){
        squat = s;
        bench = b;
        deadlift = d;
        ohp = o;
    }

    function getData(){
        return {
            squat: squat,
            bench: bench,
            deadlift: deadlift,
            ohp: ohp
        };
    }

    return {
        getData: getData,
        setData: setData
    };
});
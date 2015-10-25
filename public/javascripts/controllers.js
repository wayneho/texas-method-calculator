/**
 * Created by wayne on 10/24/2015.
 */

angular.module('myApp')
    .controller('mainController',
    ['$scope','$location','LiftFactory',
    function($scope,$location,LiftFactory){
        $scope.squat = 200;
        $scope.bench = 200;
        $scope.deadlift = 200;
        $scope.ohp = 200;

        $scope.updateFactory = function(){
            LiftFactory.setData($scope.squat,$scope.squat,$scope.deadlift,$scope.ohp);
            $location.path('/week-one');
        };
    }])

    .controller('week-one',
    ['$scope','LiftFactory',
    function($scope,LiftFactory){

        $scope.lifts = LiftFactory.getData();

        $scope.volumeDay = {
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

        $scope.lightDay = {
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

        $scope.intensityDay = {
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
                workout: $scope.volumeDay
            },
            {
                name: "Light Day",
                workout: $scope.lightDay
            },
            {
                name: "Intensity Day",
                workout: $scope.intensityDay
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
    }])

    .controller('loginController',
    ['$scope', '$location', 'AuthFactory',
    function ($scope, $location, AuthFactory) {

        console.log("User Status: "+ AuthFactory.getUserStatus());

        $scope.login = function () {

            // initial values
            $scope.error = false;
            $scope.disabled = true;

            // call login from service
            AuthFactory.login($scope.loginForm.username, $scope.loginForm.password)
                // handle success
                .then(function () {
                    $location.path('/');
                    $scope.disabled = false;
                    $scope.loginForm = {};
                })
                // handle error
                .catch(function () {
                    $scope.error = true;
                    $scope.errorMessage = "Invalid username and/or password";
                    $scope.disabled = false;
                    $scope.loginForm = {};
                });

        };

    }])

    .controller('logoutController',
    ['$scope', '$location', 'AuthFactory',
    function ($scope, $location, AuthFactory) {

        $scope.logout = function () {

            console.log("User Status: "+ AuthFactory.getUserStatus());

            // call logout from service
            AuthFactory.logout()
                .then(function () {
                    $location.path('/login');
                });
        };
    }])

    .controller('registerController',
    ['$scope', '$location', 'AuthFactory',
    function ($scope, $location, AuthFactory) {

        console.log(AuthFactory.getUserStatus());

        $scope.register = function () {

            // initial values
            $scope.error = false;
            $scope.disabled = true;

            // call register from service
            AuthFactory.register($scope.registerForm.username, $scope.registerForm.password)
                // handle success
                .then(function () {
                    $location.path('/login');
                    $scope.disabled = false;
                    $scope.registerForm = {};
                })
                // handle error
                .catch(function () {
                    $scope.error = true;
                    $scope.errorMessage = "Something went wrong!";
                    $scope.disabled = false;
                    $scope.registerForm = {};
                });
        };
    }]);



/**
 * Created by wayne on 10/24/2015.
 */

angular.module('myApp')
    .run(function($rootScope){
        $rootScope.authenticated = false;
        $rootScope.current_user = "";
        $rootScope.current_week = 1;
    })

    .controller('mainController',
    ['$scope','$location','LiftFactory',
    function($scope,$location,LiftFactory){
        $scope.squat = 315;
        $scope.bench = 225;
        $scope.deadlift = 395;
        $scope.ohp = 135;

        $scope.updateData = function(){
            LiftFactory.setData($scope.squat,$scope.squat,$scope.deadlift,$scope.ohp);
            $location.path('/program');
        };
    }])

    .controller('programController',['$scope','LiftFactory','$rootScope','WeekFactory',
    function($scope,LiftFactory, $rootScope, WeekFactory){

        $scope.volumeDay = {
            squat: {
                name: "Squat",
                reps: "5x5",
                weight: "",
                difficulty: "-"
            },
            press: {
                name: "Bench Press",
                reps: "5x5",
                weight: "",
                difficulty: "-"
            },
            acc: {
                name: "Accessory",
                reps: "-",
                weight: "-"
            }
        };

        $scope.lightDay = {
            squat: {
                name: "Squat",
                reps: "2x5",
                weight: ""
            },
            press: {
                name: "Overhead Press",
                reps: "2x5",
                weight: ""
            },
            acc: {
                name: "Accessory",
                reps: "-",
                weight: "-"
            }
        };

        $scope.intensityDay = {
            squat: {
                name: "Squat",
                reps: "1x5",
                weight: "",
                difficulty: "-"
            },
            press: {
                name: "Bench Press",
                reps: "1x5",
                weight: "",
                difficulty: "-"
            },
            deadlift: {
                name: "Deadlift",
                reps: "1x5",
                weight: "",
                difficulty: "-"
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

        // If not logged in or newly created user then generate data based on user input
        function createData(){
            var userData = LiftFactory.getData();
            $scope.volumeDay.squat.weight  = Math.round(userData.squat * 0.9 *10)/10;
            $scope.volumeDay.press.weight  = Math.round(userData.bench * 0.9 *10)/10;
            $scope.lightDay.squat.weight = Math.round(userData.squat * 0.72 *10)/10;
            $scope.lightDay.press.weight = Math.round(userData.ohp * 0.9 *10)/10;
            $scope.intensityDay.squat.weight = Math.round((userData.squat+5) *10)/10;
            $scope.intensityDay.press.weight = Math.round((userData.bench+5) *10)/10;
            $scope.intensityDay.deadlift.weight = Math.round((userData.deadlift+5) *10)/10;
        }

        // If logged in get current week from database
        if($rootScope.authenticated){
            WeekFactory.getCurrentWeekNum()
                .then(function(user_curr_week){
                    $rootScope.current_week = user_curr_week;
                    WeekFactory.getWeekInfo(user_curr_week)
                        .then(function(weekObj){
                            // Bench press on odd weeks and overhead press on even weeks
                            // On light days the other press movement is trained
                            var benchWeek = (weekObj.weekNumber)%2;

                            $scope.volumeDay.squat.weight = weekObj.volumeDay.squat.weight;
                            $scope.volumeDay.press.weight = benchWeek?weekObj.volumeDay.benchPress.weight:weekObj.volumeDay.overheadPress.weight;
                            $scope.volumeDay.press.name = benchWeek?"Bench Press":"Overhead Press";

                            $scope.lightDay.squat.weight = weekObj.lightDay.squat.weight;
                            $scope.lightDay.press.weight = benchWeek?weekObj.lightDay.overheadPress.weight:weekObj.lightDay.benchPress.weight;
                            $scope.lightDay.press.name = benchWeek?"Overhead Press":"Bench Press";

                            $scope.intensityDay.squat.weight = weekObj.intensityDay.squat.weight;
                            $scope.intensityDay.press.weight = benchWeek?weekObj.intensityDay.benchPress.weight:weekObj.intensityDay.overheadPress.weight;
                            $scope.intensityDay.press.name = benchWeek?"Bench Press":"Overhead Press";
                            $scope.intensityDay.deadlift.weight = weekObj.intensityDay.deadlift.weight;
                        })
                        // no user data found, generate the data
                        .catch(function(){
                            console.log("ALERT NEW USER no data saved!!!!");
                            createData();
                        })
                });
        }
        // If not logged in, generate data based on user input
        else{
            createData();
        }

        // Give each drop-down option a different color
        $scope.appliedClass = function(difficulty){
            switch(difficulty){
                case "Incomplete":
                    return "btn-primary";
                case "Easy":
                    return "btn-success";
                case "Medium":
                    return "btn-info";
                case "Hard":
                    return "btn-default";
                case "Very Hard":
                    return "btn-warning";
                case "Failed":
                    return "btn-danger";
                default:
                    return "btn-primary";
            }
        };

        // Array containing alert messages
        $scope.alerts = [];

        // Remove alert messages
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };


        $scope.save = function(){
            if(!$rootScope.authenticated)
                $scope.alerts[0] = {type: 'danger', msg: 'Please sign in to save progress.'};
            else{
                $scope.alerts[0] = {type: 'success', msg: 'Your progress has been saved.'};


                var weekObj = {
                    intensityDay:{
                        overheadPress:{
                            weight: $scope.lifts.ohp+5,
                            difficulty: "-"
                        },
                        deadlift:{
                            weight: $scope.lifts.deadlift+5,
                            difficulty: $scope.program[2].workout.deadlift.difficulty
                        },
                        benchPress:{
                            weight: $scope.lifts.bench+5,
                            difficulty: $scope.program[2].workout.bench.difficulty
                        },
                        squat:{
                            weight: $scope.lifts.squat+5,
                            difficulty: $scope.program[2].workout.squat.difficulty
                        }
                    },
                    lightDay:{
                        overheadPress: {
                            weight: $scope.lifts.ohp *0.72
                        },
                        benchPress: {
                            weight: $scope.lifts.bench *0.72
                        },
                        squat: {
                            weight: $scope.lifts.squat * 0.72
                        }
                    },
                    volumeDay:{
                        overheadPress:{
                            weight: $scope.lifts.ohp*0.9,
                            difficulty: "-"
                        },
                        benchPress:{
                            weight: $scope.lifts.bench*0.9,
                            difficulty: $scope.program[0].workout.bench.difficulty
                        },
                        squat:{
                            weight: $scope.lifts.bench*0.9,
                            difficulty: $scope.program[0].workout.squat.difficulty
                        }
                    }
                };
                WeekFactory.saveWeekOne(weekObj)
                    .then(function(){
                        console.log("Week saved sucessfully");

                    })
            }

        };

    }])

    .controller('usersController', ['$scope','LiftFactory','$rootScope','WeekFactory',
    function($scope,LiftFactory, $rootScope, WeekFactory){

    }])

    .controller('loginController',
    ['$scope', '$location', 'AuthFactory','$rootScope',
    function ($scope, $location, AuthFactory, $rootScope) {

        console.log("User Status: "+ AuthFactory.getUserStatus());
        $scope.authenticated = AuthFactory.isLoggedIn();

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
                    $rootScope.authenticated = AuthFactory.isLoggedIn();
                    $rootScope.current_user = AuthFactory.getUserName();
                })
                // handle error
                .catch(function (err) {
                    $scope.error = true;
                    $scope.errorMessage = err.message;
                    $scope.disabled = false;
                    $scope.loginForm = {};
                });

        };

    }])

    .controller('logoutController',
    ['$scope', '$location', 'AuthFactory','$rootScope',
    function ($scope, $location, AuthFactory,$rootScope) {

        $scope.logout = function () {
            // call logout from service
            AuthFactory.logout()
                .then(function () {
                    $location.path('/login');
                    $rootScope.authenticated = AuthFactory.isLoggedIn();
                    $rootScope.current_user = "";
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
                .catch(function (err) {
                    $scope.error = true;
                    $scope.errorMessage = err.message;
                    $scope.disabled = false;
                    $scope.registerForm = {};
                });
        };
    }]);



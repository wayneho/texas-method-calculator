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

        var newUser = false;
        var benchWeek = true;
        var weekFromDB;
        var userData;

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
            },
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

        // object used to display data in views
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
            userData = LiftFactory.getData();
            $scope.volumeDay.squat.weight  = Math.round(userData.squat * 0.9 *10)/10;
            $scope.volumeDay.press.weight  = Math.round(userData.bench * 0.9 *10)/10;
            $scope.lightDay.squat.weight = Math.round(userData.squat * 0.72 *10)/10;
            $scope.lightDay.press.weight = Math.round(userData.ohp * 0.9 *10)/10;
            $scope.intensityDay.squat.weight = Math.round((parseInt(userData.squat)+5) *10)/10;
            $scope.intensityDay.press.weight = Math.round((parseInt(userData.bench)+5) *10)/10;
            $scope.intensityDay.deadlift.weight = Math.round((parseInt(userData.deadlift)+5) *10)/10;

        }

        // If logged in get current week from database
        if($rootScope.authenticated){
            WeekFactory.getCurrentWeekNum()
                .then(function(user_curr_week){
                    $rootScope.current_week = user_curr_week;
                    WeekFactory.getWeekInfo(user_curr_week)
                        .then(function(week){
                            // Bench press on odd weeks and overhead press on even weeks
                            // On light days the other press movement is trained
                            weekFromDB = week;
                            benchWeek = (week.weekNumber)%2;

                            $scope.volumeDay.squat.weight = week.volumeDay.squat.weight;
                            $scope.volumeDay.squat.difficulty = week.volumeDay.squat.difficulty;
                            $scope.volumeDay.press.weight = benchWeek?week.volumeDay.benchPress.weight:week.volumeDay.overheadPress.weight;
                            $scope.volumeDay.press.difficulty =  benchWeek?week.volumeDay.benchPress.difficulty:week.volumeDay.overheadPress.difficulty;
                            $scope.volumeDay.press.name = benchWeek?"Bench Press":"Overhead Press";

                            $scope.lightDay.squat.weight = week.lightDay.squat.weight;
                            $scope.lightDay.press.weight = benchWeek?week.lightDay.overheadPress.weight:week.lightDay.benchPress.weight;
                            $scope.lightDay.press.name = benchWeek?"Overhead Press":"Bench Press";

                            $scope.intensityDay.squat.weight = week.intensityDay.squat.weight;
                            $scope.intensityDay.squat.difficulty = week.intensityDay.squat.difficulty;
                            $scope.intensityDay.press.weight = benchWeek?week.intensityDay.benchPress.weight:week.intensityDay.overheadPress.weight;
                            $scope.intensityDay.press.difficulty = benchWeek?week.intensityDay.benchPress.difficulty:week.intensityDay.overheadPress.difficulty;
                            $scope.intensityDay.press.name = benchWeek?"Bench Press":"Overhead Press";
                            $scope.intensityDay.deadlift.weight = week.intensityDay.deadlift.weight;
                            $scope.intensityDay.deadlift.difficulty = week.intensityDay.deadlift.difficulty;

                        })
                        // no user data found, generate the data
                        .catch(function(){
                            console.log("ALERT NEW USER no data saved!!!!");
                            newUser = true;
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

                // Week object to save in database
                var weekObj = {
                    intensityDay:{
                        overheadPress:{
                            weight: "",
                            difficulty: benchWeek?"-":$scope.intensityDay.press.difficulty
                        },
                        deadlift:{
                            weight: $scope.intensityDay.deadlift.weight,
                            difficulty: $scope.intensityDay.deadlift.difficulty
                        },
                        benchPress:{
                            weight: "",
                            difficulty: benchWeek?$scope.intensityDay.press.difficulty:"-"
                        },
                        squat:{
                            weight: $scope.intensityDay.squat.weight,
                            difficulty: $scope.intensityDay.squat.difficulty
                        }
                    },
                    lightDay:{
                        overheadPress: {
                            weight: ""
                        },
                        benchPress: {
                            weight: ""
                        },
                        squat: {
                            weight: $scope.lightDay.squat.weight
                        }
                    },
                    volumeDay:{
                        overheadPress:{
                            weight: "",
                            difficulty: benchWeek?"-":$scope.volumeDay.press.difficulty
                        },
                        benchPress:{
                            weight: "",
                            difficulty: benchWeek?$scope.volumeDay.press.difficulty:"-"
                        },
                        squat:{
                            weight: $scope.volumeDay.squat.weight,
                            difficulty: $scope.volumeDay.squat.difficulty
                        }
                    }
                };

                if(newUser){
                    weekObj.volumeDay.benchPress.weight = Math.round(userData.bench * 0.9 *10)/10;
                    weekObj.volumeDay.overheadPress.weight = Math.round(userData.ohp * 0.9 *10)/10;
                    weekObj.lightDay.benchPress.weight = Math.round(userData.bench * 0.9 *10)/10;
                    weekObj.lightDay.overheadPress.weight = Math.round(userData.ohp * 0.9 *10)/10;
                    weekObj.intensityDay.benchPress.weight = Math.round((parseInt(userData.bench)+5) *10)/10;
                    weekObj.intensityDay.overheadPress.weight = Math.round((parseInt(userData.ohp)+5) *10)/10;

                    WeekFactory.saveWeekOne(weekObj)
                        .then(function(){
                            console.log("Week saved sucessfully");
                        })

                }else{
                    weekObj.volumeDay.benchPress.weight = weekFromDB.volumeDay.benchPress.weight;
                    weekObj.volumeDay.overheadPress.weight = weekFromDB.volumeDay.overheadPress.weight;
                    weekObj.lightDay.benchPress.weight = weekFromDB.lightDay.benchPress.weight;
                    weekObj.lightDay.overheadPress.weight = weekFromDB.lightDay.overheadPress.weight;
                    weekObj.intensityDay.benchPress.weight = weekFromDB.intensityDay.benchPress.weight;
                    weekObj.intensityDay.overheadPress.weight = weekFromDB.intensityDay.overheadPress.weight;

                    WeekFactory.updateWeekInfo($rootScope.current_week, weekObj)
                        .then(function(){
                            console.log("Week updated successfully");
                        })
                }
            }
        }
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



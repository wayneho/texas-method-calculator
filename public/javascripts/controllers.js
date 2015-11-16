/**
 * Created by wayne on 10/24/2015.
 */

angular.module('myApp')
    .run(function($rootScope){
        $rootScope.authenticated = false;
        $rootScope.current_user = "";
        $rootScope.display_week = 1;
        $rootScope.current_week = 1;
        $rootScope.new_user = true;
    })

    .controller('mainController',
    ['$scope','$location','LiftFactory','WeekFactory','$rootScope','$q',
    function($scope,$location,LiftFactory,WeekFactory,$rootScope,$q){
        $scope.squat = 315;
        $scope.bench = 225;
        $scope.deadlift = 395;
        $scope.ohp = 135;

        // create first week for users with no data based on user input
        $scope.updateData = function(){
            LiftFactory.setData($scope.squat,$scope.bench,$scope.deadlift,$scope.ohp);
            $location.path('/program');
        };

        WeekFactory.getCurrentWeekNum()
            .then(function(user_curr_week){
                $rootScope.display_week = user_curr_week;
                $rootScope.current_week = user_curr_week;

                var weeks = [],
                    sqData = [],
                    bData = [],
                    dData = [],
                    ohpData = [];

                var promise = $q.all(null);

                // construct an array consisting of each week numbers
                for(var i = 1; i < user_curr_week+1; i++) {
                    weeks.push(i);
                }

                // make synchronous call to api to get weeks in order
                weeks.forEach(function(week){
                    promise = promise.then(function(){
                        return WeekFactory.getWeekInfo(week)
                            .then(function(weekObj){
                                sqData.push(weekObj.intensityDay.squat.weight);
                                bData.push(weekObj.intensityDay.benchPress.weight);
                                dData.push(weekObj.intensityDay.deadlift.weight);
                                ohpData.push(weekObj.intensityDay.overheadPress.weight);
                            });
                    });
                });

                // create chart once all data has been retrieved
                promise.then(function(){
                    $scope.labels = weeks.map(function(num){
                        return "Week "+num;
                    });
                    $scope.series = ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press'];
                    $scope.colours = ['#3366FF', '#ff0027', '#008B2E', '#131214'];
                    $scope.data = [sqData, bData, dData, ohpData];
                });
            })
            .catch(function(){
                console.log("User not logged in.");
            });


        // get current week for the user
        $scope.continueProgram = function(){
            $location.path('/program');
        };
    }])

    .controller('programController',['$scope','LiftFactory','$rootScope','WeekFactory','$q',
    function($scope,LiftFactory, $rootScope, WeekFactory,$q){

        // flag to check if its bench or overhead press week
        var benchWeek = true;
        // week object retrieved from db
        var weekFromDB;
        // user's inputted 5RM data
        var userData;
        // flag to check if user input has changed
        $scope.saved = true;

        $scope.volumeDay = {
            squat: {
                name: "Squat",
                reps: "5x5",
                weight: "",
                symbol: "",
                difficulty: "-"
            },
            press: {
                name: "Bench Press",
                reps: "5x5",
                weight: "",
                symbol: "",
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
                symbol: "",
                difficulty: "-"
            },
            press: {
                name: "Bench Press",
                reps: "1x5",
                weight: "",
                symbol: "",
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

        // If not logged in or is newly created user then generate data based on user input
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

        // Retrieve data from database based on display week
        function reloadData(){
            WeekFactory.getWeekInfo($rootScope.display_week)
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
                .catch(function(){
                    console.log("Unable to retrieve data from database.");
                })
        }

        // If logged in and not a new user get the displayed week from database
        if($rootScope.authenticated && !$rootScope.new_user){
            reloadData();
        }
        // If not logged in or new user(no data saved in db), generate data based on user input
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
                    return "btn-warning";
                case "Very Hard":
                    return "btn-danger";
                default:
                    return "btn-primary";
            }
        };

        $scope.changeSavedFlag = function(){
            $scope.saved = false;
        };

        // Array containing alert messages
        $scope.alerts = [];

        // Remove alert messages
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        // save user data
        $scope.save = function(){
            var deferred = $q.defer();
            if(!$rootScope.authenticated)
                $scope.alerts[0] = {type: 'danger', msg: 'Please sign in to save progress.'};
            else{
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

                // calculate week 1 numbers
                if($rootScope.new_user){
                    weekObj.volumeDay.benchPress.weight = Math.round(userData.bench * 0.9 *10)/10;
                    weekObj.volumeDay.overheadPress.weight = Math.round(userData.ohp * 0.9 *10)/10;
                    weekObj.lightDay.benchPress.weight = Math.round(userData.bench * 0.72 *10)/10;
                    weekObj.lightDay.overheadPress.weight = Math.round(userData.ohp * 0.72 *10)/10;
                    weekObj.intensityDay.benchPress.weight = Math.round((parseInt(userData.bench)+5) *10)/10;
                    weekObj.intensityDay.overheadPress.weight = Math.round((parseInt(userData.ohp)+5) *10)/10;

                    WeekFactory.saveWeekOne(weekObj)
                        .then(function(){
                            $scope.alerts[0] = {type: 'success', msg: 'Your progress has been saved.'};
                            $scope.saved = true;
                            $rootScope.new_user = false;
                            deferred.resolve();
                            reloadData();
                        })
                        .catch(function(){
                            deferred.reject();
                            $scope.alerts[0] = {type: 'danger', msg: 'Error saving week.'};
                        });

                }else{
                    if($scope.saved){
                        $scope.alerts[0] = {type: 'info', msg: 'Data unchanged. Save is not needed.'};
                    }else{
                        weekObj.volumeDay.benchPress.weight = weekFromDB.volumeDay.benchPress.weight;
                        weekObj.volumeDay.overheadPress.weight = weekFromDB.volumeDay.overheadPress.weight;
                        weekObj.lightDay.benchPress.weight = weekFromDB.lightDay.benchPress.weight;
                        weekObj.lightDay.overheadPress.weight = weekFromDB.lightDay.overheadPress.weight;
                        weekObj.intensityDay.benchPress.weight = weekFromDB.intensityDay.benchPress.weight;
                        weekObj.intensityDay.overheadPress.weight = weekFromDB.intensityDay.overheadPress.weight;

                        WeekFactory.updateWeekInfo($rootScope.display_week, weekObj)
                            .then(function(){
                                $scope.alerts[0] = {type: 'success', msg: 'Your progress has been saved.'};
                                $scope.saved = true;
                                deferred.resolve();
                            })
                            .catch(function(){
                                $scope.alerts[0] = {type: 'danger', msg: 'Error saving week.'};
                                deferred.reject();
                            });
                    }
                }
            }
            return deferred.promise;
        };


        // Create and display the next week
        // If its an old week then just display it
        function displayNextWeek(){
            // week already exists, display it in views
            if ($rootScope.display_week < $rootScope.current_week) {
                $rootScope.display_week += 1;
                reloadData();
            } else {
                // create a new week in the database and display it
                WeekFactory.createWeek($rootScope.current_week)
                    .then(function (diagnosis) {
                        // update the user's current week
                        WeekFactory.updateCurrentWeekNum($rootScope.current_week).then(function () {
                            console.log("Created and updated user to week: " + ($rootScope.current_week + 1));
                            $rootScope.display_week += 1;
                            $rootScope.current_week += 1;
                            $scope.saved = true;
                            reloadData();
                        });
                        // Display message for each lift
                        $scope.alerts[0] = {type: 'info', msg: 'Squats: '+ diagnosis.msg};
                        // Display proper symbol for squats depending on increase from last week
                        if(diagnosis.volFactor > 0){
                            $scope.volumeDay.squat.symbol = "glyphicon glyphicon-arrow-up";
                        }else if(diagnosis.volFactor < 0){
                            $scope.volumeDay.squat.symbol = "glyphicon glyphicon-arrow-down";
                        }else{
                            $scope.volumeDay.squat.symbol = "glyphicon glyphicon-minus";
                        }
                        if(diagnosis.intFactor > 0){
                            $scope.intensityDay.squat.symbol = "glyphicon glyphicon-arrow-up";
                        }else if(diagnosis.volFactor < 0){
                            $scope.intensityDay.squat.symbol = "glyphicon glyphicon-arrow-down";
                        }else{
                            $scope.intensityDay.squat.symbol = "glyphicon glyphicon-minus";
                        }

                    });
                WeekFactory.getDiagnosis($rootScope.current_week-1)
                    .then(function(diagnosis){
                        $scope.alerts[1] = {type: 'info', msg: (benchWeek?"Overhead Press: ":"Bench Press: ")+ diagnosis.msg};
                        // Display proper symbol for the press movement depending on increase from last week
                        if(diagnosis.volFactor > 0){
                            $scope.volumeDay.press.symbol = "glyphicon glyphicon-arrow-up";
                        }else if(diagnosis.volFactor < 0){
                            $scope.volumeDay.press.symbol = "glyphicon glyphicon-arrow-down";
                        }else{
                            $scope.volumeDay.press.symbol = "glyphicon glyphicon-minus";
                        }
                        if(diagnosis.intFactor > 0){
                            $scope.intensityDay.press.symbol = "glyphicon glyphicon-arrow-up";
                        }else if(diagnosis.volFactor < 0){
                            $scope.intensityDay.press.symbol = "glyphicon glyphicon-arrow-down";
                        }else{
                            $scope.intensityDay.press.symbol = "glyphicon glyphicon-minus";
                        }

                    });
            }
        }


        $scope.nextWeek = function(){
            // Check if drop down boxes are filled in
            if($scope.volumeDay.squat.difficulty !== "-" &&
                $scope.volumeDay.press.difficulty !== "-" &&
                $scope.intensityDay.squat.difficulty !== "-" &&
                $scope.intensityDay.press.difficulty !== "-" &&
                $scope.intensityDay.deadlift.difficulty !== "-") {

                // display next week if nothing changed
                if($scope.saved){
                    displayNextWeek();
                }else{
                    $scope.save()
                        .then(function(){
                            displayNextWeek();
                        })
                        .catch(function(){
                            $scope.alerts[0] = {type: 'danger', msg: 'Error saving week.'};
                        });
                }
            }else{
                $scope.alerts[0] = {type: 'danger', msg: 'Week not yet completed.'};
            }
        };
        // display previous week
        $scope.previousWeek = function(){
            if($rootScope.display_week > 1){
                if($scope.saved){
                    $rootScope.display_week-=1;
                    reloadData();
                    $scope.volumeDay.squat.symbol = "";
                    $scope.intensityDay.squat.symbol = "";
                    $scope.volumeDay.press.symbol = "";
                    $scope.intensityDay.press.symbol = "";
                }else{
                    $scope.save()
                        .then(function(){
                            $rootScope.display_week-=1;
                            reloadData();
                            $scope.volumeDay.squat.symbol = "";
                            $scope.intensityDay.squat.symbol = "";
                            $scope.volumeDay.press.symbol = "";
                            $scope.intensityDay.press.symbol = "";
                            $scope.closeAlert();
                        })
                        .catch(function(){
                            $scope.alerts[0] = {type: 'danger', msg: 'Error saving week.'};
                        });
                }
            }else{
                console.log("Week 0 does not exist.")
            }
        };

    }])

    .controller('usersController', ['$scope','LiftFactory','$rootScope','WeekFactory',
    function($scope,LiftFactory, $rootScope, WeekFactory){

    }])

    .controller('loginController',
    ['$scope', '$location', 'AuthFactory','$rootScope','WeekFactory',
    function ($scope, $location, AuthFactory, $rootScope, WeekFactory) {

        console.log("User Status: "+ AuthFactory.getUserStatus());
        $scope.authenticated = AuthFactory.isLoggedIn();

        $scope.login = function () {

            // initial values
            $scope.error = false;
            $scope.disabled = true;


            // call login from service
            AuthFactory.login($scope.loginForm.username, $scope.loginForm.password)
                // handle success
                .then(function (){
                    $location.path('/');
                    $scope.disabled = false;
                    $scope.loginForm = {};
                    $rootScope.authenticated = AuthFactory.isLoggedIn();
                    $rootScope.current_user = AuthFactory.getUserName();
                    WeekFactory.getWeekInfo(1)
                        .then(function(){
                            $rootScope.new_user = false;
                        })
                        .catch(function(){
                            $rootScope.new_user = true;
                            console.log("We got a new user here.")
                        });
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
                    $rootScope.display_week = 1;
                    $rootScope.current_week = 1;
                    $rootScope.new_user = true;
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



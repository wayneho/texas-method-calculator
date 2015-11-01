/**
 * Created by wayne on 10/24/2015.
 */

angular.module('myApp')
    .factory('LiftFactory',function(){
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
    })
    .factory('AuthFactory',['$q','$http', function($q, $http){
        //create user variable
        var user = null;
        var user_name = "";

        function isLoggedIn() {
            if(user) {
                return true;
            } else {
                return false;
            }
        }

        function getUserStatus() {
            return user;
        }
        function getUserName(){
            return user_name;
        }

        function login(username, password) {
            // create a new instance of deferred
            var deferred = $q.defer();

            // send a post request to the server
            $http.post('/login', {username: username, password: password})
                // handle success
                .success(function (data, status) {
                    if(status === 200 && data.status){
                        user = true;
                        user_name = username;
                        deferred.resolve();
                    } else {
                        user = false;
                        deferred.reject();
                    }
                })
                // handle error
                .error(function() {
                    user = false;
                    deferred.reject();
                });

            // return promise object
            return deferred.promise;
        }

        function logout() {
            // create a new instance of deferred
            var deferred = $q.defer();

            // send a get request to the server
            $http.get('/logout')
                // handle success
                .success(function () {
                    user = false;
                    deferred.resolve();
                })
                // handle error
                .error(function () {
                    user = false;
                    deferred.reject();
                });

            // return promise object
            return deferred.promise;
        }

        function register(username, password) {
            // create a new instance of deferred
            var deferred = $q.defer();

            // send a post request to the server
            $http.post('/register', {username: username, password: password})
                // handle success
                .success(function (data, status) {
                    if(status === 200 && data.status){
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                })
                // handle error
                .error(function() {
                    deferred.reject();
                });

            // return promise object
            return deferred.promise;
        }

        // return available functions for use in controllers
        return ({
            getUserName: getUserName,
            isLoggedIn: isLoggedIn,
            getUserStatus: getUserStatus,
            login: login,
            logout: logout,
            register: register
        });
    }])

    .factory('WeekFactory',['$q','$http','$rootScope','CalculateNextWeeksLiftsFactory', function($q, $http, $rootScope,CalculateNextWeeksLiftsFactory){

        function getCurrentWeekNum(){
            var deferred = $q.defer();

            $http.get('/users/'+$rootScope.current_user)
                // return the current week
                .success(function(curr_week){
                    deferred.resolve(curr_week);
                })
                .error(function(){
                    deferred.reject();
                });
            return deferred.promise;
        }

        function updateCurrentWeekNum(week){
            var deferred = $q.defer();

            $http.put('/users/'+$rootScope.current_user,{currentWeek: week + 1})
                .success(function() {
                    deferred.resolve();
                })
                .error(function(){
                    deferred.reject();
                });
            return deferred.promise;
        }

        function getWeekInfo(weekNum){
            var deferred = $q.defer();
            $http.get('/users/'+$rootScope.current_user+'/'+weekNum)
                .success(function(weekObj){
                    deferred.resolve(weekObj);
                })
                .error(function(){
                    deferred.reject();
                });
            return deferred.promise;
        }
        //properties is an obj containing the properties of the week to update
        //ex: properties = {complete: false}
        function updateWeekInfo(weekNum, properties){
            var deferred = $q.defer();
            $http.put('/users/'+$rootScope.current_user+'/'+weekNum, properties)
                .success(function(){
                    deferred.resolve();
                })
                .error(function(){
                    deferred.reject();
                });
            return deferred.promise;
        }

        function createWeek(weekNum, weekObj){
            // Alternate between bench and ohp each week
            var bench_week = weekNum % 2 !== 0;

            // Factor to increase or decrease next weeks lift
            var sq_factor = CalculateNextWeeksLiftsFactory(weekObj.volumeDay.squat.difficulty, weekObj.intensityDay.squat.difficulty);
            var b_factor = CalculateNextWeeksLiftsFactory(weekObj.volumeDay.bench.difficulty, weekObj.intensityDay.bench.difficulty);
            var ohp_factor = CalculateNextWeeksLiftsFactory(weekObj.volumeDay.overheadPress.difficulty, weekObj.intensityDay.overheadPress.difficulty);

            var volumeDay = {
                squat: {
                    weight: weekObj.volumeDay.squat.weight + sq_factor.volumeFactor,
                    difficulty: "-"
                },
                benchPress: {
                    weight: bench_week?weekObj.volumeDay.benchPress.weight + b_factor.volumeFactor : weekObj.volumeDay.benchPress.weight,
                    difficulty: "-"
                },
                overheadPress: {
                    weight: bench_week?weekObj.volumeDay.overheadPress.weight: weekObj.volumeDay.overheadPress.weight + ohp_factor.volumeDay,
                    difficulty: "-"
                }
            };
            var lightDay = {
                squat: {
                    weight: weekObj.lightDay.squat.weight * 0.72
                },
                benchPress: {
                    weight: weekObj.lightDay.benchPress.weight * 0.72
                },
                overheadPress: {
                    weight: weekObj.lightDay.overheadPress.weight * 0.72
                }
            };
            var intensityDay= {
                squat: {
                    weight: weekObj.intensityDay.squat.weight + sq_factor.intensityFactor,
                    difficulty: "-"
                },
                benchPress: {
                    weight: bench_week?weekObj.intensityDay.benchPress.weight + b_factor.intensityFactor : weekObj.intensityDay.benchPress.weight,
                    difficulty: "-"
                },
                deadlift: {
                    weight: weekObj.intensityDay.deadlift.weight + 5,
                    difficulty: "-"
                },
                overheadPress: {
                    weight: bench_week?weekObj.intensityDay.overheadPress.weight : weekObj.intensityDay.overheadPress.weight + ohp_factor.intensityDay,
                    difficulty: "-"
                }
            };

            var deferred = $q.defer();

            $http.post('/users/'+$rootScope.current_user+'/'+weekNum,
                {weekNum: weekNum, volumeDay: volumeDay, lightDay: lightDay, intensityDay: intensityDay})
                .success(function(){
                    deferred.resolve();
                })
                .error(function(){
                    deferred.reject();
                });
            return deferred.promise;
        }

        return {
            getCurrentWeekNum: getCurrentWeekNum,
            updateCurrentWeekNum: updateCurrentWeekNum,
            getWeekInfo: getWeekInfo,
            updateWeekInfo: updateWeekInfo,
            createWeek: createWeek
        };
    }])
    .factory('CalculateNextWeeksLiftsFactory',function(){

        //figures out next weeks numbers based on workout difficulty
        function getWeight(VD, ID){
            if(VD === "Easy"){
                if(ID === "Easy")
                    return {
                        diagnosis: "Low-balling - Progress both days quickly.",
                        volumeFactor: 10,
                        intensityFactor: 10
                    };
                if(ID === "Medium")
                    return {
                        diagnosis: "Low volume - Volume will eventually need to increase for intensity to increase.",
                        volumeFactor: 5,
                        intensityFactor: 5
                    };
                if(ID === "Hard" || ID === "Very Hard")
                    return {
                        diagnosis: "Volume wrong - Not enough volume dose to push intensity.",
                        volumeFactor: 10,
                        intensityFactor: 5
                    };
            }
            if(VD === "Medium"){
                if(ID === "Easy")
                    return {
                        diagnosis: "Low intensity - Intensity is low-balled.",
                        volumeFactor: 5,
                        intensityFactor: 10
                    };
                if(ID === "Medium")
                    return {
                        diagnosis: "Decent - Continue intensity progress as normal.",
                        volumeFactor: 0,
                        intensityFactor: 5
                    };
                if(ID === "Hard")
                    return {
                        diagnosis: "Standard - Normal progression",
                        volumeFactor: 0,
                        intensityFactor: 5
                    };
                if(ID === "Very Hard")
                    return {
                        diagnosis: "Standard - Normal progression, volume will increase to drive intensity",
                        volumeFactor: 5,
                        intensityFactor: 5
                    };
            }
            if(VD === "Hard"){
                if(ID === "Easy")
                    return {
                        diagnosis: "High Volume, low intensity - decrease volume and progress intensity",
                        volumeFactor: -5,
                        intensityFactor: 10
                    };
                if(ID === "Medium")
                    return {
                        diagnosis: "High Volume, low intensity - hold volume constant, progress intensity",
                        volumeFactor: 0,
                        intensityFactor: 5
                    };
                if(ID === "Hard")
                    return {
                        diagnosis: "Standard - Normal progression, increase volume/intensity discrepancy",
                        volumeFactor: 0,
                        intensityFactor: 5
                    };
                if(ID === "Very Hard")
                    return {
                        diagnosis: "Veteran - nearing end of current progression",
                        volumeFactor: 0,
                        intensityFactor: 5
                    };
            }
            if(VD === "Very Hard"){
                if(ID === "Easy")
                    return {
                        diagnosis: "High volume, low intensity - reduce volume significantly and progress intensity",
                        volumeFactor: -10,
                        intensityFactor: 10
                    };
                if(ID === "Medium")
                    return {
                        diagnosis: "High volume, low intensity - reduce volume, progress intensity",
                        volumeFactor:-5,
                        intensityFactor: 5
                    };
                if(ID === "Hard")
                    return {
                        diagnosis: "Volume wrong - reduce volume, progress intensity",
                        volumeFactor: -5,
                        intensityFactor: 5
                    };
                if(ID === "Very Hard")
                    return {
                        diagnosis: "Veteran - Close to end of progression, good luck. Try less volume",
                        volumeFactor: -5,
                        intensityFactor: 5
                    };
            }
        }


        return {
            getWeight: getWeight
        };

    });

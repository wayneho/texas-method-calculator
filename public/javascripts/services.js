/**
 * Created by wayne on 10/24/2015.
 */

angular.module('myApp')
    .factory('LiftFactory',function(){
        var squat = 0;
        var bench = 0;
        var deadlift = 0;
        var ohp = 0;

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

            $http.post('/login', {username: username, password: password}).then(
                function success(res){
                    if(res.status === 200){
                        user = true;
                        user_name = username;
                        deferred.resolve();
                    }else
                        deferred.reject();
                },
                function error(res){
                    user = false;
                    deferred.reject(res.data.err);
                }
            );
            // return promise object
            return deferred.promise;
        }

        function logout() {
            // create a new instance of deferred
            var deferred = $q.defer();

            $http.get('/logout').then(
                function success(){
                    user = false;
                    deferred.resolve();
                },
                function error(){
                    user = false;
                    deferred.reject();
                }
            );
            // return promise object
            return deferred.promise;
        }

        function register(username, password) {
            // create a new instance of deferred
            var deferred = $q.defer();

            $http.post('/register', {username: username, password: password}).then(
                function success(res){
                    if (res.status === 200)
                        deferred.resolve();
                    else
                        deferred.reject();
                },
                function error(res){
                    deferred.reject(res.data.err);
                }
            );
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
    .factory('WeekFactory',['$q','$http','$rootScope', function($q, $http, $rootScope){

        // Find the current week that the user is on
        function getCurrentWeekNum(){
            var deferred = $q.defer();

            $http.get('/users/'+$rootScope.current_user).then(
                function success(curr_week){
                    deferred.resolve(curr_week.data);
                },
                function error(){
                    deferred.reject();
                }
            );

            return deferred.promise;
        }

        function updateCurrentWeekNum(week){
            var deferred = $q.defer();

            $http.put('/users/'+$rootScope.current_user,{currentWeek: week + 1}).then(
                function success(){
                    deferred.resolve();
                },
                function error(){
                    deferred.reject();
                }
            );
            return deferred.promise;
        }

        // returns the user data for the week number
        function getWeekInfo(weekNum){
            var deferred = $q.defer();
            console.log("weeknum passed in: " + weekNum);
            $http.get('/users/'+$rootScope.current_user+'/'+weekNum).then(
                function success(weekObj){
                    deferred.resolve(weekObj.data);
                },
                function error(){
                    deferred.reject();
                }
            );
            return deferred.promise;
        }
        //properties is an obj containing the properties of the week to update
        //ex: properties = {complete: false}
        function updateWeekInfo(weekNum, properties){
            var deferred = $q.defer();

            $http.put('/users/'+$rootScope.current_user+'/'+weekNum, properties).then(
                function success(){
                    deferred.resolve();
                },
                function error(){
                    deferred.reject();
                }
            );
            return deferred.promise;
        }

        //figures out next weeks numbers based on workout difficulty
        function getWeight(VD, ID) {
            if (VD === "Easy") {
                if (ID === "Easy")
                    return {
                        diagnosis: "Low-balling - Progress both days quickly.",
                        volumeFactor: 10,
                        intensityFactor: 10
                    };
                if (ID === "Medium")
                    return {
                        diagnosis: "Low volume - Volume will eventually need to increase for intensity to increase.",
                        volumeFactor: 5,
                        intensityFactor: 5
                    };
                if (ID === "Hard" || ID === "Very Hard")
                    return {
                        diagnosis: "Volume wrong - Not enough volume dose to push intensity.",
                        volumeFactor: 10,
                        intensityFactor: 5
                    };
            }
            if (VD === "Medium") {
                if (ID === "Easy")
                    return {
                        diagnosis: "Low intensity - Intensity is low-balled.",
                        volumeFactor: 5,
                        intensityFactor: 10
                    };
                if (ID === "Medium")
                    return {
                        diagnosis: "Decent - Continue intensity progress as normal.",
                        volumeFactor: 0,
                        intensityFactor: 5
                    };
                if (ID === "Hard")
                    return {
                        diagnosis: "Standard - Normal progression",
                        volumeFactor: 0,
                        intensityFactor: 5
                    };
                if (ID === "Very Hard")
                    return {
                        diagnosis: "Standard - Normal progression, volume will increase to drive intensity",
                        volumeFactor: 5,
                        intensityFactor: 5
                    };
            }
            if (VD === "Hard") {
                if (ID === "Easy")
                    return {
                        diagnosis: "High Volume, low intensity - decrease volume and progress intensity",
                        volumeFactor: -5,
                        intensityFactor: 10
                    };
                if (ID === "Medium")
                    return {
                        diagnosis: "High Volume, low intensity - hold volume constant, progress intensity",
                        volumeFactor: 0,
                        intensityFactor: 5
                    };
                if (ID === "Hard")
                    return {
                        diagnosis: "Standard - Normal progression, increase volume/intensity discrepancy",
                        volumeFactor: 0,
                        intensityFactor: 5
                    };
                if (ID === "Very Hard")
                    return {
                        diagnosis: "Veteran - nearing end of current progression",
                        volumeFactor: 0,
                        intensityFactor: 5
                    };
            }
            if (VD === "Very Hard") {
                if (ID === "Easy")
                    return {
                        diagnosis: "High volume, low intensity - reduce volume significantly and progress intensity",
                        volumeFactor: -10,
                        intensityFactor: 10
                    };
                if (ID === "Medium")
                    return {
                        diagnosis: "High volume, low intensity - reduce volume, progress intensity",
                        volumeFactor: -5,
                        intensityFactor: 5
                    };
                if (ID === "Hard")
                    return {
                        diagnosis: "Volume wrong - reduce volume, progress intensity",
                        volumeFactor: -5,
                        intensityFactor: 5
                    };
                if (ID === "Very Hard")
                    return {
                        diagnosis: "Veteran - Close to end of progression, good luck. Try less volume",
                        volumeFactor: -5,
                        intensityFactor: 5
                    };
            }
        }



        // function to retrieve bench or ohp diagnosis
        // necessary because bench and ohp alternate each week
        function getDiagnosis(weekNum){
            var bench_week = weekNum%2;
            return getWeekInfo(weekNum)
                .then(function(weekObj){
                    var b_factor = getWeight(weekObj.volumeDay.benchPress.difficulty, weekObj.intensityDay.benchPress.difficulty);
                    var ohp_factor = getWeight(weekObj.volumeDay.overheadPress.difficulty, weekObj.intensityDay.overheadPress.difficulty);
                    var volFactor = bench_week?b_factor.volumeFactor:ohp_factor.volumeFactor;

                    var diagnosis = {
                        msg: bench_week?b_factor.diagnosis:ohp_factor.diagnosis,
                        volFactor: bench_week?b_factor.volumeFactor:ohp_factor.volumeFactor,
                        intFactor: bench_week?b_factor.intensityFactor:ohp_factor.intensityFactor
                    };
                    return diagnosis;
                })
                .catch(function(){
                    console.log("Failed to retrieve week " + weekNum);
                });
        }

        // create next week's numbers depending on last week's difficulty
        function createWeek(weekNum){
            // Alternate between bench and ohp each week
            var bench_week = weekNum%2;

            return getWeekInfo(weekNum)
                .then(function(weekObj){
                    // Factor to increase or decrease next weeks lift
                    var sq_factor = getWeight(weekObj.volumeDay.squat.difficulty, weekObj.intensityDay.squat.difficulty);
                    var b_factor = getWeight(weekObj.volumeDay.benchPress.difficulty, weekObj.intensityDay.benchPress.difficulty);
                    var ohp_factor = getWeight(weekObj.volumeDay.overheadPress.difficulty, weekObj.intensityDay.overheadPress.difficulty);

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
                            weight: bench_week?weekObj.volumeDay.overheadPress.weight: weekObj.volumeDay.overheadPress.weight + ohp_factor.volumeFactor,
                            difficulty: "-"
                        }
                    };
                    var lightDay = {
                        squat: {
                            weight: Math.round(weekObj.volumeDay.squat.weight * 0.9 *10)/10
                        },
                        benchPress: {
                            weight: Math.round(weekObj.volumeDay.benchPress.weight * 0.9 *10)/10
                        },
                        overheadPress: {
                            weight: Math.round(weekObj.volumeDay.overheadPress.weight * 0.9 *10)/10
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
                            weight: bench_week?weekObj.intensityDay.overheadPress.weight : weekObj.intensityDay.overheadPress.weight + ohp_factor.intensityFactor,
                            difficulty: "-"
                        }
                    };
                    var diagnosis = {
                        msg: sq_factor.diagnosis,
                        volFactor: sq_factor.volumeFactor,
                        intFactor: sq_factor.intensityFactor
                    };
                    var deferred = $q.defer();

                    //save user data;
                    $http.post('/users/'+$rootScope.current_user,
                        {weekNumber: weekNum+1, volumeDay: volumeDay, lightDay: lightDay, intensityDay: intensityDay}).then(
                        function success(){
                            deferred.resolve(diagnosis);
                        },
                        function error(){
                            deferred.reject();
                        }
                    );
                    return deferred.promise;
                })
                .catch(function(){
                    console.log("Failed to retrieve week " + weekNum);
                });
        }

        function saveWeekOne(weekObj){
            var deferred = $q.defer();
            $http.post('/users/'+$rootScope.current_user,
                {weekNumber: 1,volumeDay: weekObj.volumeDay, lightDay: weekObj.lightDay, intensityDay: weekObj.intensityDay}).then(
                function success(){
                    deferred.resolve();
                },
                function error(){
                    deferred.reject();
                }
            );
            return deferred.promise;
        }

        return {
            getCurrentWeekNum: getCurrentWeekNum,
            updateCurrentWeekNum: updateCurrentWeekNum,
            getWeekInfo: getWeekInfo,
            updateWeekInfo: updateWeekInfo,
            getDiagnosis: getDiagnosis,
            createWeek: createWeek,
            saveWeekOne: saveWeekOne
        }
    }]);

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
    .factory('AuthFactory',['$q', '$timeout','$http', function($q, $timeout, $http){
        //create user variable
        var user = null;

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

        function login(username, password) {
            // create a new instance of deferred
            var deferred = $q.defer();

            // send a post request to the server
            $http.post('/login', {username: username, password: password})
                // handle success
                .success(function (data, status) {
                    if(status === 200 && data.status){
                        user = true;
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
            isLoggedIn: isLoggedIn,
            getUserStatus: getUserStatus,
            login: login,
            logout: logout,
            register: register
        });
    }]);
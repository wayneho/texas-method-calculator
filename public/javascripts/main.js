/**
 * Created by wayne on 10/24/2015.
 */
var myApp = angular.module('myApp', ['ngRoute','ui.bootstrap','chart.js']);


myApp.config(function($routeProvider){
    $routeProvider
        .when('/',{
            templateUrl: '../partials/main.html',
            controller: 'mainController',
            access: {restricted: false}
        })
        .when('/login',{
            templateUrl: '../partials/login.html',
            controller: 'loginController',
            access: {restricted: false}
        })
        .when('/logout',{
            controller: 'logoutController',
            access: {restricted: true}
        })
        .when('/register',{
            templateUrl: '../partials/register.html',
            controller: 'registerController',
            access: {restricted: false}
        })
        .when('/program',{
            templateUrl: '../partials/program.html',
            controller: 'programController',
            access: {restricted: false}
        })
        .when('users',{
            templateUrl: '../partials/program.html',
            controller: 'usersController',
            access: {restricted: true}
        })
        .otherwise({redirectTo: '/'});
    })
    //check if a user is logged in on each and every change of route
    .run(function ($rootScope, $location, $route, AuthFactory) {
        $rootScope.$on('$routeChangeStart', function (event, next) {
            if (next.access.restricted && AuthFactory.isLoggedIn() === false) {
                $location.path('/login');
            }
        });
    });


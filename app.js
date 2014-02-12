angular.module('CrossStone', ['ngRoute', 'LocalStorageModule']);

angular.module('CrossStone').config(['$routeProvider', 'localStorageServiceProvider', function ($routeProvider, localStorageServiceProvider) {

  localStorageServiceProvider.setPrefix('CrossStone');

  $routeProvider
    .when('/dashboard', {
      controller: 'DashboardController',
      templateUrl: 'templates/dashboard.html',
      resolve: {
        api: function ($q, localStorageService, $location) {
          var deferred = $q.defer();

          var response = OAuth.create('github', {
            access_token: localStorageService.get('_accessToken')
          });
          if (response && response.access_token !== null) {
            deferred.resolve(response);
          } else {
            localStorageService.remove('_accessToken');
            $location.path('/login');
          }
          return deferred.promise;
        }
      }
    })
    .when('/login', {
      controller: 'LoginController',
      templateUrl: 'templates/login.html',
    })
    .otherwise({
      redirectTo: '/dashboard'
    });
}]);

angular.module('CrossStone').run(function ($rootScope, $location) {
  OAuth.initialize('qX_3NS1--aUs8WgkyN2XLEXd7jI');
});

angular.module('CrossStone').controller('AppController', ['$rootScope', 'localStorageService', function ($rootScope, localStorageService, $scope) {

  $scope.dismiss = function () {
    $rootScope.errorMessage = '';
  };
}]);

angular.module('CrossStone').controller('DashboardController', function ($scope, api, $rootScope, $location, localStorageService) {

  api.get('user/repos').done(function (repos) {
    $scope.$apply(function () {
      $scope.repos = repos;
    });
  }).fail(function () {
    $scope.$apply(function () {
      localStorageService.remove('_accessToken');
      $rootScope.errorMessage = 'OAuth.js failed to create API instance.. Sorry :(';
      $location.path('/login')
    });
  });

  api.get('user/orgs').done(function (orgs) {
    $scope.$apply(function () {
      $scope.orgs = orgs;
    });
  }).fail(function () {
    $scope.$apply(function () {
      localStorageService.remove('_accessToken');
      $rootScope.errorMessage = 'OAuth.js failed to create API instance.. Sorry :(';
      $location.path('/login')
    });
  });
});

angular.module('CrossStone').controller('LoginController', ['$scope', '$rootScope', '$location', 'localStorageService', function ($scope, $rootScope, $location, localStorageService) {

  $scope.login = function () {
    OAuth.popup('github', function (error, result) {
      if (error) {
        $scope.$apply(function () {
          $location.path('/login');
        });
      }
      localStorageService.set('_accessToken', result.access_token);
      $rootScope.errorMessage = false;
      $scope.$apply(function () {
        $location.path('/dashboard');
      });
    });
  };
}]);

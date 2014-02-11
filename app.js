angular.module('CrossStone', ['ngRoute', 'LocalStorageModule']);

angular.module('CrossStone').config(['$routeProvider', 'localStorageServiceProvider', function ($routeProvider, localStorageServiceProvider) {

  localStorageServiceProvider.setPrefix('CrossStone');

  $routeProvider
    .when('/dashboard', {
      controller: 'DashboardController',
      templateUrl: 'templates/dashboard.html',
      resolve: {
        api: function ($q, localStorageService) {
          var deferred = $q.defer();

          var response = OAuth.create('github', {
            access_token: localStorageService.get('_accessToken')
          });
          if (response) {
            deferred.resolve(response);
          } else {
            deferred.reject();
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

  $rootScope.$on('$routeChangeError', function (event) {
    $rootScope.errorMessage = 'You have to login with your GitHub Account';
    $location.path('/login');
  });

  $rootScope.$on('$routeChangeSuccess', function (event) {
  });
});

angular.module('CrossStone').controller('AppController', ['$rootScope', 'localStorageService', function ($rootScope, localStorageService) {

}]);

angular.module('CrossStone').controller('DashboardController', function ($scope, api, $rootScope, $location) {
  api.get('user/orgs').done(function (orgs) {
    $scope.$apply(function () {
      $scope.orgs = orgs;
    });
  }).fail(function () {
    $scope.$apply(function () {
      $rootScope.errorMessage = 'OAuth.js failed to create API instance.. Sorry :(';
      $location.path('/login')
    });
  });
});

angular.module('CrossStone').controller('LoginController', ['$scope', '$rootScope', '$location', 'localStorageService', function ($scope, $rootScope, $location, localStorageService) {

  $scope.login = function () {
    OAuth.popup('github', function (error, result) {
      if (error) {
        $location.path('/login');
      }
      localStorageService.set('_accessToken', result.access_token);
      $rootScope.errorMessage = false;
      $location.path('/dashboard');
      $scope.$apply();
    });
  };
}]);

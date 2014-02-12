angular.module('CrossStone', ['ngRoute', 'LocalStorageModule']);

angular.module('CrossStone').provider('OAuthService', function () {

  this.initialize = function (key) {
    OAuth.initialize(key);
  };

  this.$get = function ($timeout, $q) {

    var asyncAngularify = function (oauth, callback) {
      return callback ? function () {
        var args = arguments;
        $timeout(function () {
          callback.apply(oauth, args);
        }, 0);
      } : angular.noop;
    };

    return {
      popup: function (provider, cb) {
        OAuth.popup(provider, asyncAngularify(OAuth, cb));
      },
      create: function (provider, options) {
        var resource = OAuth.create(provider, options),
            instance = {};

        instance.access_token = resource.access_token;

        instance.get = function (opts, opts2) {
          var deferred = $q.defer();
          resource.get(opts, opts2).done(function (response) {
            deferred.resolve(response);
          }).fail(function (err) {
            deferred.reject(fail);
          });
          return deferred.promise;
        };

        return instance;
      }
    };
  };
});

angular.module('CrossStone').config(function ($routeProvider, localStorageServiceProvider, OAuthServiceProvider) {

  localStorageServiceProvider.setPrefix('CrossStone');
  OAuthServiceProvider.initialize('qX_3NS1--aUs8WgkyN2XLEXd7jI');

  $routeProvider
    .when('/dashboard', {
      controller: 'DashboardController',
      templateUrl: 'templates/dashboard.html',
      resolve: {
        github: function ($q, localStorageService, $location, OAuthService) {

          var deferred = $q.defer();

          var github = OAuthService.create('github', {
            access_token: localStorageService.get('_accessToken')
          });

          if (github && github.access_token !== null) {
            deferred.resolve(github);
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
});


angular.module('CrossStone').controller('LoginController', function ($scope, $rootScope, $location, localStorageService, OAuthService) {

  $scope.login = function () {
    OAuthService.popup('github', function (error, result) {
      if (error) {
        $location.path('/login');
      }
      localStorageService.set('_accessToken', result.access_token);
      $location.path('/dashboard');
    });
  };
});

angular.module('CrossStone').run(function ($rootScope, $location, OAuthService) {

});

angular.module('CrossStone').controller('AppController', function ($rootScope, localStorageService, $scope) {

  $scope.dismiss = function () {
    $rootScope.errorMessage = '';
  };
});

angular.module('CrossStone').controller('DashboardController', function ($scope, github, $rootScope, $location, localStorageService) {

  github.get('user').then(function (user) {
    $scope.user = user;
    console.log(user);
  });
  // github.get('user/repos').then(function (repos) {
  //   $scope.repos = repos;
  // });

  // github.get('user/orgs').then(function (orgs) {
  //   $scope.orgs = orgs;
  // });
});

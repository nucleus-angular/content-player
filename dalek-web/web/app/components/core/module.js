angular.module('demo.core.routing', [
  'demo.core'
])
.config([
  '$stateProvider',
  function($stateProvider) {
    $stateProvider
    .state('demo', {
      name: 'demo',
      url: '',
      views: {
        '': {
          template: '<div ui-view></div>'//'/app/components/core/assets/templates/module-wrapper.html'
        },
        'header': {
          templateUrl: '/app/components/core/assets/templates/header.html'
        },
        'footer': {
          templateUrl: '/app/components/core/assets/templates/footer.html'
        }
      }
    });
  }
]);

angular.module('demo.core', [
  'ui.router',
  'demo.core.routing',
  'demo.core.constants'
]);
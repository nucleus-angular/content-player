angular.module('demo.home.home', [
  'httpMocker',
  'demo.core',
  'nag.contentPlayer'
])
.config([
  '$stateProvider',
  function($stateProvider) {
    $stateProvider
    .state('demo.home.home', {
      url: '',
      views: {
        '': {
          templateUrl: '/app/components/home/assets/templates/home.html',
          controller: 'HomeCtrl'
        }
      }
    });
  }
])
.controller('HomeCtrl', [
  '$scope',
  '$rootScope',
  '$http',
  'httpMocker',
  '$timeout',
  function($scope, $rootScope, $http, httpMocker, $timeout) {
    httpMocker.register('POST', '/video-finished', {
      status: 'success',
      contentStatus: 'pending'
    }, {
      payload: {
        type: "video",
        name: "Test 1",
        meta: {
          id: 1,
          path: "/app/assets/videos/test2.mov",
          type: "video/mp4",
          completePostBack:"/video-finished"
        }
      },
      delay: 1000
    });
    httpMocker.register('POST', '/video-finished', {
      status: 'success',
      contentStatus: 'pending'
    }, {
      payload: {
        type: 'video',
        name: 'Test 2',
        meta: {
          id: 2,
          path: '/app/assets/videos/test1.mov',
          type: 'video/mp4',
          completePostBack: '/video-finished'
        }
      },
      delay: 2000
    });
    httpMocker.register('POST', '/video-finished', {
      status: 'success',
      contentStatus: 'passed'
    }, {
      payload: {
        type: 'video',
        name: 'Test 3',
        meta: {
          id: 6,
          path: '/app/assets/videos/test3.mov',
          type: 'video/mp4',
          completePostBack: '/video-finished'
        }
      },
      delay: 3000
    });
    httpMocker.register('POST', '/video-finished', {
      status: 'success',
      contentStatus: 'previously-completed'
    }, {
      payload: {
        type: 'video',
        name: 'Test 4',
        meta: {
          id: 7,
          path: '/app/assets/videos/test3.mov',
          type: 'video/mp4',
          completePostBack: '/video-finished'
        }
      },
      delay: 3000
    });
    httpMocker.register('POST', '/assessment', {
      status: 'success',
      contentStatus: 'pending'
    }, {
      payload: {
        item: {
          type: 'assessment',
          name: 'Assessment',
          meta: {
            id: 3,
            path: '/app/components/home/assets/templates/assessment.html',
            completePostBack: '/assessment'
          }
        },
        answers: {
          one: '2',
          two: '4',
          three: '9'
        }
      },
      delay: 1500
    });
    httpMocker.register('POST', '/assessment', {
      status: 'success',
      percentage: '66',
      contentStatus: 'failed'
    }, {
      payload: {
        item: {
          type: 'assessment',
          name: 'Assessment 2',
          meta: {
            id: 4,
            path: '/app/components/home/assets/templates/assessment2.html',
            completePostBack: '/assessment'
          }
        },
        answers: {
          four: '2',
          five: '2',
          six: '15'
        }
      },
      delay: 1500
    });
    httpMocker.register('POST', '/assessment', {
      status: 'success',
      completionPercentage: '100',
      contentStatus: 'passed'
    }, {
      payload: {
        item: {
          type: 'assessment',
          name: 'Assessment 2',
          meta: {
            id: 4,
            path: '/app/components/home/assets/templates/assessment2.html',
            completePostBack: '/assessment'
          }
        },
        answers: {
          four: '2',
          five: '4',
          six: '9'
        }
      },
      delay: 1500
    });

    $scope.contentPlayerOptions = {
      items: [{
        type: 'video',
        name: 'Test 1',
        meta: {
          id: 1,
          path: '/app/assets/videos/test2.mov',
          type: 'video/mp4',
          completePostBack: '/video-finished'
        }
      }, {
        type: 'video',
        name: 'Test 2',
        meta: {
          id: 2,
          path: '/app/assets/videos/test1.mov',
          type: 'video/mp4',
          completePostBack: '/video-finished'
        }
      }, {
        type: 'video',
        name: 'Test 1',
        meta: {
          id: 1,
          path: '/app/assets/videos/test2.mov',
          type: 'video/mp4',
          completePostBack: '/video-finished'
        }
      }, {
        type: 'video',
        name: 'Test 2',
        meta: {
          id: 2,
          path: '/app/assets/videos/test1.mov',
          type: 'video/mp4',
          completePostBack: '/video-finished'
        }
      }, {
        type: 'video',
        name: 'Test 1',
        meta: {
          id: 1,
          path: '/app/assets/videos/test2.mov',
          type: 'video/mp4',
          completePostBack: '/video-finished'
        }
      }, {
        type: 'video',
        name: 'Test 2',
        meta: {
          id: 2,
          path: '/app/assets/videos/test1.mov',
          type: 'video/mp4',
          completePostBack: '/video-finished'
        }
      }, {
        type: 'video',
        name: 'Test 1',
        meta: {
          id: 1,
          path: '/app/assets/videos/test2.mov',
          type: 'video/mp4',
          completePostBack: '/video-finished'
        }
      }, {
        type: 'video',
        name: 'Test 2',
        meta: {
          id: 2,
          path: '/app/assets/videos/test1.mov',
          type: 'video/mp4',
          completePostBack: '/video-finished'
        }
      }/*, {
        type: 'video',
        name: 'Test 3',
        meta: {
          id: 6,
          path: '/app/assets/videos/test3.mov',
          type: 'video/mp4',
          completePostBack: '/video-finished'
        }
      }*/, {
        type: 'video',
        name: 'Test 4',
        meta: {
          id: 7,
          path: '/app/assets/videos/test3.mov',
          type: 'video/mp4',
          completePostBack: '/video-finished'
        }
      }/*, {
        type: 'assessment',
        name: 'Assessment',
        meta: {
          id: 3,
          path: '/app/components/home/assets/templates/assessment.html',
          completePostBack: '/assessment'
        }
      }, {
        type: 'assessment',
        name: 'Assessment 2',
        meta: {
          id: 4,
          path: '/app/components/home/assets/templates/assessment2.html',
          completePostBack: '/assessment'
        }
      }*/],
      contentStatusProperty: 'contentStatus'
    };
    $scope.test = 'test';

    $rootScope.$on('NagContentPlayer[test]/videoEnded', function(self, item) {
      $('#id2').text('Item Ended Request');
    });

    $rootScope.$on('NagContentPlayer[test]/videoCompleted', function(self, item) {
      $('#id2').text('Item Ended Request Processed');
      $timeout(function(){$('#id2').text('Background Idle');}, 2000);
    });

    //track assessment complete
    $rootScope.$on('NagContentPlayer[test]/completed', function(self, status) {
      completeModule(status);
    });

    var completeModule = function(status) {
      alert('you have ' + status + ' this module');
    }
  }
]);

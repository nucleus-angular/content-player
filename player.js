//html5 video reference
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
// http://www.w3schools.com/tags/ref_av_dom.asp - has event list
/**
 * # Nucleus Angular Content Player Player
 *
 * This is the player directive for the content player.
 *
 * @todo: should we have configuration option for allowing seeking on previously seen videos
 * @todo: should we allow the using to click on the currently playing video in the playlist and have it reload the video (should it be a configuration options)
 *
 * @module nag.contentPlayer.player
 * @ngdirective nagContentPlayer
 */
angular.module('nag.contentPlayer.player', [
  'nag.core'
]).config([
  'nagDefaultsProvider',
  function(nagDefaultsProvider) {
    //setup defaults
    nagDefaultsProvider.setOptions('contentPlayer', {
      items: [],
      allowSelection: true,
      allowSeeking: true,
      latestItemCompleted: -1,
      contentStatusProperty: false
    });
  }
])
.directive('nagContentPlayer', [
  '$rootScope',
  '$http',
  'nagDefaults',
  function($rootScope, $http, nagDefaults){
    return {
      restrict: 'A',
      scope: {
        options: '=nagContentPlayer'
      },
      templateUrl: '/components/nucleus-angular-content-player/assets/templates/player.html',
      compile: function(element, attributes, transclude) {
        element.addClass('content-player');
        element.find('.playlist').css('left', parseInt(element.find('.content').width()));

        return function($scope, element, attributes) {
          $scope.options = nagDefaults.getOptions('contentPlayer', $scope.options);

          $scope.assessmentModel = {};

          $scope.activeItemIndex = null;
          var lastCurrentTime = null;
          $scope.showControls = false;
          var $video = element.find('video');
          var currentContentStatus = null;
          var setContentStatus = function(response) {
            //see if we are going to store the content status, useful when using this as a learning system
            if($scope.options.contentStatusProperty && response[$scope.options.contentStatusProperty]) {
              currentContentStatus = response[$scope.options.contentStatusProperty];
            }
          };

          $scope.activeItem = $scope.options.items[$scope.options.latestItemCompleted + 1];

          $scope.playlistItemClick = function($event, key) {
            if($scope.options.allowSelection !== false) {
              if(
              $scope.options.allowSelection === 'previous' && key <= $scope.options.latestItemCompleted + 1
              || $scope.options.allowSelection === true
              ) {
                $scope.selectItem(key);
              }
            }
          };

          $scope.selectItem = function(index) {
            $scope.activeItemIndex = index;
            $scope.activeItem = $scope.options.items[$scope.activeItemIndex];
            var itemMetaData = $scope.options.items[$scope.activeItemIndex];
            var $source = $video.find('source');

            $source.attr('src', itemMetaData.meta.path);
            $source.attr('type', itemMetaData.meta.type);

            $video[0].load();
            $video[0].play();
          };

          $scope.loadNextItem = function() {
            if($scope.activeItem.meta.final === true && currentContentStatus === 'passed') {
              $rootScope.$broadcast('NagContentPlayer[' + attributes.nag +']/completed', $scope.options.items[$scope.activeItemIndex], $scope);
            } else if ($scope.activeItem.meta.final !== true) {
              $scope.selectItem($scope.activeItemIndex + 1);
            }
          };

          $scope.assessmentComplete = function() {
            //lets see if we want to
            if($scope.activeItem.meta.completePostBack) {
              $http({
                method: 'POST',
                url: $scope.activeItem.meta.completePostBack,
                data: {
                  item: $scope.activeItem,
                  answers: $scope.assessmentModel
                }
              })
              .success(function(data, status, headers, config) {
                console.log(data);

                //lets clear the assessment model since we have submitted the data
                $scope.assessmentModel = {};

                setContentStatus(data);
                $scope.loadNextItem();
              })
              .error(function(data, status, headers, config) {
                console.log('error');
              });
            }
          };

          //we automatically want to load the next video when the current video is done
          $video.bind('ended', function() {
            //allow the user to hook into the system when a video has ended
            $rootScope.$broadcast('NagContentPlayer[' + attributes.nag +']/videoEnded', $scope.options.items[$scope.activeItemIndex]);

            $http({
              method: 'POST',
              url: $scope.activeItem.meta.completePostBack,
              data: $scope.activeItem
            })
            .success(function(data, status, headers, config) {
              $rootScope.$broadcast('NagContentPlayer[' + attributes.nag +']/videoCompleted', $scope.options.items[$scope.activeItemIndex]);
              console.log(data);
              //completeModule(item);
            })
            .error(function(data, status, headers, config) {
              console.log('error');
            });

            //keep local track of the latest video played
            if($scope.activeItemIndex > $scope.options.latestItemCompleted) {
              $scope.options.latestItemCompleted = $scope.activeItemIndex;
            }

            //we are modified $scope data with the video player event so we need to wrap it in a $scope.$apply()
            $scope.$apply(function() {
              $scope.loadNextItem();
            });
          });

          $video.bind('timeupdate', function() {
            //let us keep track of the current time of the video
            var newCurrentTime = Math.floor($video[0].currentTime);

            //lets keep the updating on a per second basis for performance, we can review later if we need more precision
            if(newCurrentTime !== lastCurrentTime) {
              lastCurrentTime = newCurrentTime;

              //allow the user to hook into the video progresses
              $rootScope.$broadcast('NagContentPlayer[' + attributes.nag +']/videoProgress', $scope.options.items[$scope.activeItemIndex], lastCurrentTime);
            }
          });

          $video.bind('seeking', function() {
            //prevent the video from being fast-forwarded
            if(!$scope.options.allowSeeking && lastCurrentTime < Math.floor($video[0].currentTime)) {
              $video[0].currentTime = lastCurrentTime;
              console.log($video[0].currentTime);
            }
          });

          //load the initial item
          $scope.selectItem($scope.options.latestItemCompleted + 1);
        }
      }
    };
  }
]);
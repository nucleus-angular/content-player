//html5 video reference
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
// http://www.w3schools.com/tags/ref_av_dom.asp - has event list
//todo: move to utilities
function convertSecondsToTime(seconds, convertTo) {
  convertTo = convertTo || 'minutes';
  var time, minutes, seconds;
  time = '';

  switch(convertTo) {
    case 'minutes':
      minutes = Math.floor(seconds / 60);
      seconds = seconds % 60;

      if(seconds.toString().length == 1) {
        seconds = '0' + seconds;
      }
      time = minutes + ':' + seconds;
      break;

    default:
      //not sure what to do here
      break;
  }

  return time;
};

/**
 * # Nucleus Angular Content Player Player
 *
 * This is the player directive for the content player.
 *
 * @todo: should we have configuration option for allowing seeking on previously seen videos
 * @todo: should we allow the using to click on the currently playing video in the playlist and have it reload the video (should it be a configuration options)
 * @todo: figure how how to provide a mulitple quality levels of the same video
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
      contentStatusProperty: false,
      completedStatuses: [
        'passed',
        'failed'
      ],
      autoStart: true
    });
  }
])
.directive('nagContentPlayer', [
  '$rootScope',
  '$http',
  'nagDefaults',
  '$timeout',
  function($rootScope, $http, nagDefaults, $timeout){
    return {
      restrict: 'A',
      scope: {
        options: '=nagContentPlayer'
      },
      controller: [
        '$scope',
        function($scope) {
          $scope.unregisterContentStatusUpdatedEvent = null;

          $scope.$on('$destroy', function() {
            if($scope.unregisterContentStatusUpdatedEvent) {
              $scope.unregisterContentStatusUpdatedEvent();
            }
          });
        }
      ],
      templateUrl: '/components/nucleus-angular-content-player/assets/templates/player.html',
      compile: function(element, attributes, transclude) {
        element.addClass('content-player');
        //element.find('.playlist').css('left', parseInt(element.find('.content').width()));

        return function($scope, element, attributes) {
          var isCompletedStatus = function() {
            if($scope.options.completedStatuses === false) {
              return false;
            } else if(_.isArray($scope.options.completedStatuses)) {
              return _.indexOf($scope.options.completedStatuses, currentContentStatus) !== -1;
            }

            return false;
          };
          $scope.options = nagDefaults.getOptions('contentPlayer', $scope.options);

          $scope.assessmentModel = {};

          $scope.activeItemIndex = null;
          var lastCurrentTime = null;
          var started = false;
          $scope.showControls = false;
          var $video = element.find('video');
          var currentContentStatus = null;
          var setContentStatus = function(response) {
            //see if we are going to store the content status, useful when using this as a learning system
            if($scope.options.contentStatusProperty && !_.isEmpty(response[$scope.options.contentStatusProperty])) {
              currentContentStatus = response[$scope.options.contentStatusProperty];
              $rootScope.$broadcast('NagContentPlayer[' + attributes.nag +']/contentStatusUpdated', currentContentStatus);
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

            //make sure the active item is always visible in the playlist by scrolling it to the top
            var $newActiveItem = element.find('.playlist li:nth-child(' + ($scope.activeItemIndex + 1) + ')');
            $('.playlist').scrollTop($newActiveItem.offset().top + $('.playlist').scrollTop() - $newActiveItem.outerHeight(true));

            if($scope.activeItem.type === 'video') {
              var itemMetaData = $scope.options.items[$scope.activeItemIndex];
              var $source = $video.find('source');

              $source.attr('src', itemMetaData.meta.path);
              $source.attr('type', itemMetaData.meta.type);

              $video[0].load();

              if($scope.options.autoStart === true || started === true) {
                $video[0].play();
              }
            }
          };

          $scope.loadNextItem = function() {
            //this handles send the complete event if we are not using completed statuses
            if($scope.options.completedStatuses === false && $scope.activeItemIndex >= $scope.options.items.length - 1) {
              $rootScope.$broadcast('NagContentPlayer[' + attributes.nag +']/completed', currentContentStatus);
            } else if($scope.activeItemIndex < $scope.options.items.length - 1) {
              $scope.selectItem($scope.activeItemIndex + 1);
            }
          };

          $scope.loadPreviousItem = function() {
            $scope.selectItem($scope.activeItemIndex - 1);
          };

          $scope.reloadItem = function() {
            $scope.selectItem($scope.activeItemIndex);
          };

          $scope.assessmentComplete = function() {
            //lets see if we want to post the data to a post back url
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

          $scope.progressBarMouseUp = function($event) {
            $video[0].currentTime = (($event.offsetX / $($event.currentTarget).outerWidth(true)) * $video[0].duration);
          };

          $scope.volumeBarMouseUp = function($event) {
            $video[0].volume = ($event.offsetX / $($event.currentTarget).outerWidth(true)).toFixed(2);
          };

          $scope.togglePlay = function() {
            if($video[0].paused === true) {
              $video[0].play();

              //make sure if there is a playlist of video that they start automatically after the first one has played
              started = true;
            } else {
              $video[0].pause();
            }
          };

          $scope.isPlaying = function() {
            return !$video[0].paused;
          };

          $scope.getVolumeLevel = function() {
            if($video[0].volume === 0) {
              return 'mute';
            } else if($video[0].volume < .34) {
              return 'low';
            } else if($video[0].volume < .67) {
              return 'medium';
            } else {
              return 'high';
            }
          };

          $scope.fullscreenAvailable = function() {
            if(screenfull && screenfull.enabled) {
              return true;
            }

            return false;
          };

          $scope.fullscreen = function() {
            if(screenfull.isFullscreen) {
              screenfull.exit(element.find('.content')[0]);
            } else {
              screenfull.request(element.find('.content')[0]);
            }
          };

          $scope.isFullscreen = function() {
            return screenfull.isFullscreen;
          };

          //we automatically want to load the next video when the current video is done
          $video.bind('ended', function() {
            //allow the user to hook into the system when a video has ended
            $rootScope.$broadcast('NagContentPlayer[' + attributes.nag +']/videoEnded', $scope.options.items[$scope.activeItemIndex]);

            //lets see if we want to post the data to a post back url
            if($scope.activeItem.meta.completePostBack) {
              $http({
                method: 'POST',
                url: $scope.activeItem.meta.completePostBack,
                data: $scope.activeItem
              })
              .success(function(data, status, headers, config) {
                $rootScope.$broadcast('NagContentPlayer[' + attributes.nag +']/videoCompleted', $scope.options.items[$scope.activeItemIndex]);
                setContentStatus(data);
                console.log(data);
                //completeModule(item);
              })
              .error(function(data, status, headers, config) {
                console.log('error');
              });
            }

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
            if($video[0].currentTime > 0) {
              element.find('.controls .current-progress').css('width', ($video[0].currentTime / $video[0].duration * 100) + '%');
              element.find('.controls .time').text(convertSecondsToTime(Math.floor($video[0].currentTime)) + '/' + convertSecondsToTime(Math.floor($video[0].duration)));
            } else {
              if(!isNaN($video[0].duration)) {
                element.find('.controls .time').text('-:--/' + convertSecondsToTime(Math.floor($video[0].duration)));
              } else {
                element.find('.controls .time').text('-:--/-:--');
              }
            }

            //let us keep track of the current time of the video
            var newCurrentTime = Math.floor($video[0].currentTime);

            //lets keep the updating on a per second basis for performance, we can review later if we need more precision
            if(newCurrentTime !== lastCurrentTime) {
              lastCurrentTime = newCurrentTime;

              //allow the user to hook into the video progresses
              $rootScope.$broadcast('NagContentPlayer[' + attributes.nag +']/videoProgress', $scope.options.items[$scope.activeItemIndex], lastCurrentTime);
            }
          });

          $video.bind('volumechange', function() {
            element.find('.controls .volume .indicator').css('width', ($video[0].volume * 100) + '%');
          });

          $video.bind('seeking', function() {
            //prevent the video from being fast-forwarded
            if(!$scope.options.allowSeeking && lastCurrentTime < Math.floor($video[0].currentTime)) {
              $video[0].currentTime = lastCurrentTime;
              console.log($video[0].currentTime);
            }
          });

          $video.bind('progress', function() {
            if(!isNaN($video[0].duration)) {
              element.find('.controls .current-loaded').css('width', ($video[0].buffered.end(0) / $video[0].duration * 100) + '%');
            }
          });

          //if the video is small enough, the progress event does not work so we use this to set the loaded progress bar
          $video.bind('canplaythrough', function() {
            element.find('.controls .current-loaded').css('width', '100%');
            element.find('.controls .volume .indicator').css('width', ($video[0].volume * 100) + '%');
          });

          //load the initial item
          //$timeout is used to make sure the content is render before attempting to load the first item
          $timeout(function(){$scope.selectItem($scope.options.latestItemCompleted + 1)}, 0);


          $scope.unregisterContentStatusUpdatedEvent = $rootScope.$on('NagContentPlayer[' + attributes.nag +']/contentStatusUpdated', function(self, contentStatus) {
            if(isCompletedStatus()) {
              $rootScope.$broadcast('NagContentPlayer[' + attributes.nag +']/completed', contentStatus);
            }
          });
        }
      }
    };
  }
]);
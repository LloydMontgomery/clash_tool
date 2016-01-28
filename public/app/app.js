// name our angular app
angular.module('ClashTool', [
	'ngAnimate',
	'app.routes',
	'authService',
	'userService',
	'mainCtrl',
	'userCtrl',
	'warCtrl',
	'clanCtrl',
	'timer',
	'chart.js', 
	'ui.bootstrap',
	'door3.css'
])

// application configuration to integrate token into requests
.config(function($httpProvider) {
	// attach our auth interceptor to the http requests
	$httpProvider.interceptors.push('AuthInterceptor');
})

.directive('slideable', function () {
	return {
		restrict:'C',
		compile: function (element, attr) {
			// wrap tag
			var contents = element.html();
			element.html('<div class="slideable_content" style="margin:0 !important; padding:0 !important" >' + contents + '</div>');

			return function postLink(scope, element, attrs) {
				// default properties
				attrs.duration = (!attrs.duration) ? '1s' : attrs.duration;
				attrs.easing = (!attrs.easing) ? 'ease-in-out' : attrs.easing;
				element.css({
					'overflow': 'hidden',
					'height': '0px',
					'transitionProperty': 'height',
					'transitionDuration': attrs.duration,
					'transitionTimingFunction': attrs.easing
				});
			};
		}
	};
})
.directive('slideToggle', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var target = document.querySelector(attrs.slideToggle);
			attrs.expanded = false;
			element.bind('click', function() {
				var content = target.querySelector('.slideable_content');
				if(!attrs.expanded) {
					content.style.border = '1px solid rgba(0,0,0,0)';
					var y = content.clientHeight;
					content.style.border = 0;
					target.style.height = y + 'px';
				} else {
					target.style.height = '0px';
				}
				attrs.expanded = !attrs.expanded;
			});
		}
	}
})

.directive("fileread", [function () {
	return {
		scope: {
			fileread: "="
		},
		link: function (scope, element, attributes) {
			element.bind("change", function (changeEvent) {
				scope.$apply(function () {
					scope.fileread = changeEvent.target.files[0];
				});
			});
		}
	}
}])

// Optional configuration
.config(['ChartJsProvider', function (ChartJsProvider) {
	// Configure all charts
		ChartJsProvider.setOptions({
		colours: ['#0680AF']
	});
}]);





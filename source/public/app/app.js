// name our angular app
angular.module('ClashTool', [
	'ngAnimate',
	'app.routes',
	'authService',
	'userService',
	'mainCtrl',
	'userCtrl'
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
});


// create the controllers
// this will be the controller for the ENTIRE site 
// .controller('mainController', function() {
// 	var vm = this;
// 	// create a bigMessage variable to display in our view
// 	vm.bigMessage = 'A smooth sea never made a skilled sailor.';
// })
// // home page specific controller
// .controller('homeController', function() {
// 	var vm = this;
// 	vm.message = 'This is the home page!';
// })
// // about page controller
// .controller('aboutController', function() {
// 	var vm = this;
// 	vm.message = 'Look! I am an about page.';
// })
// // contact page controller
// .controller('contactController', function() {
// 	var vm = this;
// 	vm.message = 'Contact us! JK. This is just a demo.';
// });





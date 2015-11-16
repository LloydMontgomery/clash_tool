// inject the stuff service into our main Angular module
angular.module('userCtrl', ['userService'])

.controller('userController', function(User) {
	var vm = this;
	// more stuff to come soon
});
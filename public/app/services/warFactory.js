angular.module('warFactory', []) 
.factory('War', function($http, $q) {
	

	// create a new object
	var warFactory = {};

	function War(start, size) {

    	// Public properties, assigned to the instance ('this')
    	this.start = start;
		this.opponent = "";
		this.size = size;
		this.inProgress = true;
		this.warriors = [
			// {
			// 	name : String,
			// 	thLvl : Number,
			// 	viewed : Boolean,
			// 	attack1 : String, - "Pick"
			// 	attack2 : String, - "Pick"
			// 	lock1 : Boolean,
			// 	lock2 : Boolean,
			// 	stars1 : Number, - 0, 1, 2, 3
			// 	stars1 : Number - 0, 1, 2, 3
			// }
		];
		this.results = {
			outcome : null, // "war-win", "war-loss",
			exp : null,
			ourScore : null,
			theirScore : null,
			ourDest : null,
			theirDest : null
		}
  }

	// get a single war
	War.prototype.get = function(id) { 
		$http.get('/api/wars/' + id).then(function(data) {

			// console.log(data);

			// Strip layers of abstractions
			data = data.data.data;

			// Populate public attributes
			this.start = data.size;
			this.opponent
			this.size
			this.inProgress  // This needs to be implemented...
			// if (!this.inProgress) {
			// 	this.results = {
			// 		outcome : data.
			// 		exp : null,
			// 		ourScore : null,
			// 		theirScore : null,
			// 		ourDest : null,
			// 		theirDest : null
			// 	}
			// }

			console.log(data);

			// console.log(data.data.data);
		});

		// console.log(response.then());

		// return response;
	};

	// Generate Warrior List
	War.prototype.populateWarriors = function() {
		var defer = $q.defer();
		var warObj = this;  // Have to save this, as it is overwritten in the promise

		$http.get('/api/lastWar/' + this.size).then(function(res) {

			if (res.data.success) {
				// Use this information in some way useful

			} else {  // A similar war could not be found
				
				for (var i = 0; i < warObj.size; i++) {
					warObj.warriors.push(newWarrior());
				}
			}

			defer.resolve(res.data);
		}, function(res) {
			// Reserved for server-sided failures, not a normal occurrence
			
			defer.reject(res);
		});

		return defer.promise;
	}

	function newWarrior(name='Pick Warrior', thLvl='0') {
		return {
			name: name,
			thLvl: thLvl,
			attack1: 'Pick',
			attack2: 'Ask',
			lock1: false,
			lock2: false,
			stars1: '0',
			stars2: '0',
			viewed: false
		}
	}

	// get all wars
	warFactory.partial = function() { 
		return $http.get('/api/partialWars/');
	};

	// get all wars
	War.all = function(){ 
		return $http.get('/api/wars/');
	};

	// create a war
	War.prototype.create = function() { 
		return $http.post('/api/wars/', this);
	};
	// update a war
	warFactory.update = function(id, warData) { 
		return $http.put('/api/wars/' + id, warData);
	};
	// delete a war
	warFactory.delete = function(id) { 
		return $http.delete('/api/wars/' + id);
	};
	// upload a war photo to S3
	warFactory.upload = function(data) {
		return $http.get('/api/sign_s3?file_name=' + data.lastModifiedDate + '&file_type=' + data.type);
	};
	// return our entire warFactory object
	return War;
});

angular.module('warFactory', []) 
.factory('War', function($http, $q) {

	// create a new object
	var warFactory = {};

	/* STATIC FUNCTIONS */


	/* PUBLIC FUNCTIONS */

	// New War object
	function War(start, size) {

    	// Public properties, assigned to the instance ('this')
    	this.start = start;
		this.opponent = "";
		this.size = size;
		this.inProgress = true;
		this.warriors = [];
		this.results = {
			outcome : 'null', // "war-win", "war-loss",
			exp : 'null',
			ourScore : 'null',
			theirScore : 'null',
			ourDest : 'null',
			theirDest : 'null'
		}
	}

	// get a single war
	War.prototype.get = function(id) { 
		
		var defer = $q.defer();
		var warObj = this;  // 'this' is overwritten in the promise

		$http.get('/api/wars/' + id)
		.then(function(data) {

			// Strip layers of abstractions
			data = data.data.data;

			// Populate public attributes
			warObj.start = Number(data.start);
			warObj.opponent = data.opponent;
			warObj.size = Number(data.size);
			warObj.inProgress = data.inProgress;
			
			warObj.results = {
				outcome : data.results.outcome,
				exp : Number(data.results.exp),
				ourScore : Number(data.results.ourScore),
				theirScore : Number(data.results.theirScore),
				ourDest : Number(data.results.ourDest),
				theirDest : Number(data.results.theirDest)
			}

			defer.resolve();
		}, function(err) {

			defer.reject(err);
		});

		return defer.promise;
	};

	// Populate Warrior List
	War.prototype.populateWarriors = function() {
		var defer = $q.defer();
		var warObj = this;  // 'this' is overwritten in the promise

		$http.get('/api/lastWar/' + this.size)
		.then(function(res) {

			if (res.data.success) {
				// Use this information in some way useful

			} else {  // A similar war could not be found
				
				for (var i = 0; i < warObj.size; i++) {
					warObj.warriors.push(newWarrior());
				}
			}

			defer.resolve(res.data);
		}, function(err) {
			// Reserved for server-sided failures, not a normal occurrence
			
			defer.reject(err);
		});

		return defer.promise;
	}

	// create a war
	War.prototype.create = function() { 
		return $http.post('/api/wars/', this);
	};

	/* PRIVATE FUNCTIONS */

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

	/* STILL CONVERTING */

	// update a war
	warFactory.update = function(id, warData) { 
		return $http.put('/api/wars/' + id, warData);
	};
	// delete a war
	warFactory.delete = function(id) { 
		return $http.delete('/api/wars/' + id);
	};
	// upload a war photo to S3
	// warFactory.upload = function(data) {
	// 	return $http.get('/api/sign_s3?file_name=' + data.lastModifiedDate + '&file_type=' + data.type);
	// };
	// return our entire warFactory object
	return War;
});

'use strict';

define(['lodash', 'configModel', 'stomp', 'sockjs'], function(_, configModel)
{
	var stompClient = null;
	var connectedPromise = null;
	var websocket = function() {};

	var instance;

	function registerSubscription(topic, handler, frame) {
		var connections = instance.connections;
		if (!connections[topic]) connections[topic] = {};
		if (!connections[topic].handlers) connections[topic].handlers = [];
		connections[topic].frame = frame;
		if (connections[topic].handlers.indexOf(handler) < 0) {
			connections[topic].handlers.push(handler);
		}
	}

	websocket.prototype = {
		
		connections: {},
		subscriptions: {},
		setConnected: function(connected) {
			this.isConnected = connected;
			if (!connected) connectedPromise = null;
		},
		
		connectAndSubscribe: function(topic, callback) {
			var self = this;
			this.connect.then(function () {
				return self.subscribe(topic, callback)
			}.bind(this)).then(function () {
				return self.stompClient;
			})
		},

		connect: function(callback) {
			var self = this;
			connectedPromise = new Promise(function (resolve, reject) {
				if (self.isConnected && self.stompClient) {
					resolve(self.stompClient);
					if (callback) callback(true);
					return;
				}
				var socket = new SockJS('/cgs/websocket/stomp');
				socket.onclose = self.handleClose();
				var stompClient = Stomp.over(socket);
				stompClient.debug = null;
				stompClient.connect({}, function(frame) {
					self.setConnected(true);
					resolve(stompClient);
					if (callback) callback(true);
				}, function(error) {
					reject(error);
					callback(false);
				});
				self.socket = socket;
				self.stompClient = stompClient;
			});
			return connectedPromise;
		},

		subscribe: function (topic, callback, errCallback) {
			var self = this;
			var p = new Promise(function (resolve, reject) {
				if (!connectedPromise) return reject('Not connected');
				if (self.isSubscribed(topic, callback)) {
					resolve(true);
					return;
				}
				return connectedPromise.then(function (stompClient) {
					if (self.stompClient) {
						if (!self.isSubscribed(topic, callback)) registerSubscription(topic, callback);
						var sub = self.stompClient.subscribe('/topic/' + topic, function(frame){
							if (!self.isConnected) return;
							var body = JSON.parse(frame.body);
							if (instance.connections[topic]) {
								for (var k in instance.connections[topic].handlers) {
									var h = instance.connections[topic].handlers[k];
									h(body);
							    }	
							}
						});
						resolve(true);
					} else {
						reject('Not connected');
						if (errCallback) errCallback('Error on websocket subscriptions');
					}
				});
			});
			return p;
		},

		unsubscribe: function (topic, handler) {
			
		},

		isSubscribed: function (topic, handler) {
			if (this.connections 
				&& this.connections[topic] 
				&& this.connections[topic].handlers.indexOf(handler) >= 0) return true;
			return false;
		},

		disconnect: function (attempt) {
			if (this.stompClient != null) {
				try {
					this.stompClient.disconnect();
				} catch(e) {
					if (attempt < 5) {
						setTimeout(this.disconnect.bind(this), 300, attempt++);
						return;
					}
				}
				this.stompClient = null;
			}
			this.setConnected(false);
		},

		send: function (value) {
			this.stompClient.send("/app/websocket", {}, JSON.stringify({ 'value': value }));
		}, 

		handleClose: function () {
			if (!this.isConnected) {
				console.warn('SOCKET CLOSED');
				//setTimeout(this.connect.bind(this), 100);
			}
		}		
	};
	instance = new websocket();
    instance.id = Math.floor(Math.random()*10000);
	return instance;
});

define(['lodash', 'jquery'], function(_, $) {

	return {

		migrate: function(commands, json){

			if (!json || !commands) return json;

			this.json = json;

			_.each(commands, function(cmd){
				if (!this[cmd.action]) throw ('migration utils - command migration error - command not found');
				this[cmd.action](cmd.args);
			});

			return this.json;

		},

		validate: function(args, keyArr){

			_.each(keyArr, function(key){
				if (typeof args[key] == 'undefiend'){
					return false;
				}
			});

			return true;
		},

		replace: function(args){
			if (!this.validate(args, ['source','target'])) return false;
			this[args.target] = this[args.source];
			delete this[args.source];
		},

		delete: function(args){
			if (!this.validate(args, ['source'])) return false;
			delete this[args.source];
		}

	}

});
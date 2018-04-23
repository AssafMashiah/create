define([ 'BaseController', 'mustache', 'components/comments/commentsView', 'events',
	'text!components/comments/templates/commentsTemplate.html', 'repo','editMode'],
	function( BaseController, mustache, commentsView, events, commentTemplate, repo, editMode ) {

	var comments = BaseController.extend({

		initialize: function(config, configOverrides) {

			this._super(config, configOverrides);
			this.data = require('cgsUtil').cloneObject(config.data || []);
			this.parentRecordId = config.parentRecordId;
			this.$parent = config.$parent;
			this.menuLoadCallback = this.onMenuLoad.bind(this);

            this.registerEvents();
            this.drawAll();

		},

        registerEvents: function() {
            events.register('addComment', this.addComment, this );
            events.bind('end_load_of_menu', this.menuLoadCallback);
        },

        onMenuLoad: function() {
            if ( (repo.get(this.parentRecordId) &&
                repo.get(this.parentRecordId).data &&
                repo.get(this.parentRecordId).data.comments &&
                repo.get(this.parentRecordId).data.comments.length) || 
            	editMode.readOnlyMode
                ) {
                this.refreshMenu(true);
            } else {
                this.refreshMenu(false);
            }
        },

		//dispose comment component
		dispose: function(){
			events.unbind('addComment');
            events.unbind('end_load_of_menu', this.menuLoadCallback);
            //when comment is disposed (when reroute) trigger blur in order to save
            this.saveAll();
			this.removeAll();

			this._super();

			delete this.commentViews;
		},

        saveAll: function() {
            _.each(this.commentViews, _.bind(function(view){
                view.$el.find(".commentArea").trigger('blur');
            },this));
        },

		//triggered after change in comment text or click on minimize
		onChangeComment : function(item){
			var changed = false,
				dataObj = _.find(this.data, {id:item.id });

			if(!dataObj) return;

			//comment text was updated
			if(item.data !== undefined && dataObj.comment != item.data){
				dataObj.comment = item.data;
				changed = true;
			}
			//click on minimize
			if(item.isMinimized !== undefined){
				dataObj.isMinimized = item.isMinimized;
			}

			if (changed) {
				repo.updateProperty(this.parentRecordId, 'comments', require('cgsUtil').cloneObject(this.data));
			}
			else {
				repo.startTransaction({ ignore: true });
				repo.updateProperty(this.parentRecordId, 'comments', require('cgsUtil').cloneObject(this.data));
				repo.endTransaction();
			}
			//re-render the comment view
			setTimeout(function() {
				this.commentViews && this.commentViews[item.id] && this.commentViews[item.id].render(dataObj);
			}.bind(this), 100);
		},

		//triggered after click on delete comment
		onDeleteComment: function(id){
			var self = this;

			self.data = _.reject(self.data, function (element) {
				return element.id == id;
			});
			//self.data.splice(id, 1);
			repo.updateProperty(self.parentRecordId, 'comments', require('cgsUtil').cloneObject(self.data));
			self.removeAll();


			//TODO: function..
			self.updateHasComment(self.drawAll());
		},

		//re-load tree component (in sequence) to show the comment indication in the tree
		updateHasComment: function(hasComment){
			var record = require("repo_controllers").get(this.parentRecordId);
			var tree = record ? record.screen.components.tree : null;

			if(tree){
				tree.load(this.parentRecordId);
			}

            this.refreshMenu(hasComment);
		},

        refreshMenu: function(hasComment) {
            if (hasComment) {
                events.fire('setMenuButtonState', 'menu-button-add-comment', 'disable');
            } else {
                events.fire('setMenuButtonState', 'menu-button-add-comment', 'enable');
            }
        },
		//add new comment- currently allowing only one comment
		addComment: function(){

			//allow only one comment
			if(this.data.length == 0 ){
				this.removeAll();
				this.data.push({comment: '', isMinimized: false});
				repo.updateProperty(this.parentRecordId, 'comments', require('cgsUtil').cloneObject(this.data));
                this.updateHasComment(this.drawAll());

			}
		},

		//init new comment view
		drawComment: function(item, index){

			//create the container div to hold the comment view
			var id = this.parentRecordId+"_comment_"+index;
			this.$parent.append("<div class='comment' id='"+id+"'></div>");

			this.commentViews[id] = new commentsView({
				el: $("#"+id),
				id: id,
				data: item,
				onChange : this.onChangeComment.bind(this),
				onDelete: this.onDeleteComment.bind(this)
			});
		},

		//display all the comments
		drawAll: function(){
            var hasComments = false;
			this.commentViews = {};
			_.each(this.data, _.bind(function(item, index){
				this.drawComment(item, index);
                hasComments = true;
			}, this));
            return hasComments;
		},

		//remove all the comments from the DOM
		removeAll: function(){
			_.invoke(this.commentViews, 'dispose');
		}

	}, {type: 'comments'});

	return comments;

});
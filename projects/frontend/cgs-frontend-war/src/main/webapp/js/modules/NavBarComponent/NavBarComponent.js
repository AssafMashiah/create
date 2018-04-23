define(['lodash', 'events', 'BaseController', './TaskBarView', './NavBarComponentView', './NavBarItemView', './LockMessageView', './config', 'repo', 'types'],
function(_, events, BaseController, TaskBarView, NavBarComponentView, NavBarItemView, LockMessageView,  config, repo, types) {

	var NavBarComponent = BaseController.extend({

		initialize: function(configOverrides) {
			this.constructor.test = this.constructor.test || 1;
			this.constructor.test++;
			this._super(config, configOverrides);
			this.registerEvents();
			this.view = new NavBarComponentView({controller: this});
		},

		load: function(id) {
			this.record = repo.get(id);

			if(!this.lockMessage)
				this.lockMessage = new LockMessageView({controller: this, obj: this.record});

			if((types[this.record.type].screen === 'LessonScreen'||
				types[this.record.type].screen === 'TaskScreen')	&& !this.navBarItem){

				var arr_ancestors = repo.getAncestors(id);
				if(repo.get(id).type == 'lesson'){
					arr_ancestors.splice(0,0, $.extend(true, {}, this.record));
				}
				if (arr_ancestors.length > config.maxNumOfAncestorsInNavBar) {
					this.navBarItemOver = new NavBarItemView({controller:this, obj:this.record, arr_ancestors:arr_ancestors,
						maxNumOfAncestorsInNavBar:arr_ancestors.length, type:'over'});
				}

				this.navBarItem = new NavBarItemView({controller:this, obj:this.record, arr_ancestors:arr_ancestors,
					maxNumOfAncestorsInNavBar:config.maxNumOfAncestorsInNavBar-1, type:'regular'});
			}
			if(this.config.showSubTaskBar){
				this.taskBar = new TaskBarView({controller:this, obj: this.record});
			}

            events.fire( "cgs-hints-align" );
		},
		updateBreadcrumbsView : function(){
			if(this.navBarItemOver){
				this.navBarItemOver.render();
			}
			this.navBarItem.render();
		},

		registerEvents: function(){
			this.bindEvents({
				'close_course':{'type':'register', 'func': function() {
					if (this.router.activeScreen.constructor.type == 'courseScreen') {
						this.dispose();
					}
				}.bind(this),
					'ctx':this}
			});
		},

		dispose: function(){
			if(this.lockMessage){
				this.lockMessage.dispose();
				this.lockMessage = null;
			}
			if(this.navBarItem){
				this.navBarItem.dispose();
				this.navBarItem = null;
			}
			if(this.navBarItemOver){
				this.navBarItemOver.dispose();
				this.navBarItemOver = null;
			}
			if(this.taskBar){
				this.taskBar.dispose();
				this.taskBar = null;
			}
			this._super();
		}

	}, {type: 'NavBarComponent'});

	return NavBarComponent;

});

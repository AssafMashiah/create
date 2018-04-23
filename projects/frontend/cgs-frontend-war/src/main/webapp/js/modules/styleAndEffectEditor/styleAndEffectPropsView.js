define(['BasePropertiesView', 'mustache',
	'text!modules/styleAndEffectEditor/templates/styleAndEffectProps.html',
	'text!modules/styleAndEffectEditor/templates/detailsSection.html'],
function(BasePropertiesView, mustache, template,detailsSection) {

	var styleAndEffectPropsView = BasePropertiesView.extend({

		initialize: function(options) {
			this.template = template;
			this.isProps = true;
			this._super(options);
		},
		render :function(){
			this.$el.append(mustache.render(this.template, this, {'details':detailsSection}));
			this.bindEvents();
		},
		bindEvents: function(){
			this.$('.details').addClass('open');
			this.$('.style_name').on('change',this.changeName.bind(this));

			this.$('select[class^="family-"]').change(this.changeDefauldFont.bind(this));
			this.$('.removeCssProperty').one('click',this.removeCssProperty.bind(this));
		},
		removeCssProperty: function(e){
			this.controller.removeCssProperty($(e.target).parents('.cssItem').attr('property'));
		},

        changeDefauldFont: function(e) {
			var select = $(e.target);

			this.$('select[class^="family-"]').not(select).find('option').show().filter('[value="' + select.val() + '"]').hide();

			var newFontName = [this.$('select.family-1').val(), this.$('select.family-2').val(), this.$('select.family-3').val()].join(',');

			this.controller.setFont(newFontName);
        },
        changeName: function(e){
			var newVal = $(e.target).val();

			if(newVal == ''){
				this.$('.style_name').val(this.controller.data.currentItem.name);
			}else{

				if(this.controller.data.currentItem.name !=  newVal){
					this.controller.data.currentItem.name = newVal;
					require('localeModel').setStyleChanges();
					this.controller.startStageEditing();
				}
        	}
		}

	}, {type: 'styleAndEffectPropsView'});
	return styleAndEffectPropsView;

});
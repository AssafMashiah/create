define(['jquery', 'BaseView', 'mustache', 'repo', 'validate', 'dialogs', 'events', 'text!components/growing_list/html/growingList.html', 'text!components/growing_list/html/growingListRow.html', 'text!components/growing_list/html/growingListPredefinedRow.html'],
  function ($, BaseView, mustache, repo, validate, dialogs, events, template, row_template, predefinedRowTemplate) {

    var growingListComponentView = BaseView.extend({

      events: {
        "click .js-growing-add": "add_new",
        "click .js-growing-remove": "remove_row",
        "click .js-growing-edit": "load_entity",
        "blur input.description": "updateModel",
        "change input.growinglist-component__predefined-option": "updateModel",
      },

      initialize: function f1425(options) {

        this.initData(options);
        this._super();
      },
      /*init default data for list render*/
      initData: function (options) {
        this.options = options;
        this.columns = [{
          name: this.options.column_name
        }];
        //parse the array to fit the table with index
        this.data = [];

        _.each(options.data, _.bind(function (object, i) {
          // skip predefined rows
          if (object.isPredefined) {
            return;
          }

          var repoItem = repo.get(object.id),
            validation = {};
          if (repoItem) {
            validation.notValid = repoItem && repoItem.data.isValid === false;
            if (validation.notValid) {
              validation.message = validate.getInvalidReportString(repoItem.data.invalidMessage);
            }
          }

          this.data.push(_.extend({
            index: (i + 1)
          }, object, validation));
        }, this));

        this.has_data = this.data.length;

        this.has_additional_fields = this.rowTemplate = row_template;

        this.predefinedRowTemplate = predefinedRowTemplate;

        if (Object.prototype.toString.call(options.predefinedFields) === '[object Array]') {
          this.has_predefined_fields = true;
          this.predefinedFields = options.predefinedFields.map(function (field) {
            var foundInSavedData;
            // Check to see if option was saved in BE so that we can
            // set input checked
            if (Object.prototype.toString.call(options.data) === '[object Array]') {
              foundInSavedData = options.data.find(function (option) {
                return option.id === field.id;
              });

              // check input
              if (foundInSavedData) {
                field.checked = 'checked="checked"';
              }
            }

            return field;
          });
        }
      },

      render: function f1426() {
        this._super(template, {
          row: this.rowTemplate,
          predefinedRow: this.predefinedRowTemplate,
        });

        //init invalid tooltip
        this.initValidationTooltip(this.$('.validTip'))
      },

      initValidationTooltip: function ($selector) {
        $selector.tooltip({
          content: function () {
            return $(this)
              .attr('title');
          }
        })
      },

      //add new row to the growing table
      add_new: function f1427(e) {
        var last = $(this.el)
          .find("div.js-growing-row:last input.description"),
          item = {},
          repoItem = null;

        if ($(last)
          .length && !$.trim($(last)
            .val())
          .length) {
          $(last)
            .focus();
          return;
        }
        if (_.isFunction(this.options.initialize_item)) {
          item['id'] = this.options.initialize_item(e);
          //initValidation
          require('validate')
            .isEditorContentValid(item.id);
          repoItem = repo.get(item.id);

        }

        var i = $(this.el)
          .find("div.js-growing-row")
          .length + 1,

          html = mustache.render(this.rowTemplate, {
            index: i,
            columns: this.columns,
            id: item.id,
            options: this.options,
            notValid: true,
            message: (repoItem && repoItem.data.invalidMessage) ? validate.getInvalidReportString(repoItem.data.invalidMessage) : ''
          });

        $(this.el)
          .find("div.growinglist")
          .append(html)
          //TODO add support on n columns ->  input.columns[first]
          .find('div.js-growing-row:last input.description:first')
          .focus();

        this.initValidationTooltip(this.$("[data-item-id=" + "'" + item.id + "'" + "] .validTip"));

      },

      /**
       * remove row from the growing table
       * @param e
       */
      remove_row_handle: function f1428(e) {
        $(e.currentTarget)
          .closest('div.js-growing-row')
          .remove();
        this.updateModel(e);
        //rewrite the index
        this.fix_index();
      },

      remove_row: function f1429(e) {
        if (this.options.showDialogOnDelete) {
          events.once('growing_list_delete_item', function f1430(response) {
            if (response !== "cancel") {
              this.remove_row_handle(e);
            }
          }.bind(this));

          dialogs.create('simple', {
            title: this.options.title,

            content: {
              text: "Are you sure you want to delete this item?",
              icon: 'warn'
            },
            buttons: {
              confirm: {
                label: 'OK'
              },
              cancel: {
                label: 'Cancel'
              }
            },
            closeOutside: false
          }, 'growing_list_delete_item');
        } else {
          this.remove_row_handle(e);
        }

      },

      /**
       * rewrite the index after row maniopulation
       */
      fix_index: function f1431() {
        $(this.el)
          .find("div.js-growing-row div.column.index")
          .each(function (i) {
            $(this)
              .html(i + 1);
          });
      },

      /**
       * update the model with func that is set from the containing object
       * @param e
       */
      updateModel: function f1432(e) {
        if (_.isFunction(this.options.update_model_callback)) {
          this.options.update_model_callback(e, this.serialize_list_data(), this);
        }
      },

      /**
       * serialize the data in the list to  json
       */
      serialize_list_data: function f1433() {
        var list = [];
        // parse text inputs
        $(this.el)
          .find('div.js-growing-row')
          .each(function f1434() {
            var obj = {};
            //TODO add support on n columns
            obj['item'] = $(this)
              .find("input.description")
              .val();
            if ($(this)
              .data('item-id')) {
              obj['id'] = $(this)
                .data('item-id');
            } else {
              obj['id'] = require('repo')
                .genId();
              $(this)
                .attr('data-item-id', obj['id']);
              $(this)
                .data('item-id', obj['id']);
            }

            list.push(obj);
          });

        // parse checkboxes
        $(this.el)
          .find('.growinglist-component__predefined-option')
          .each(function eachPredefinedOption() {
            var $checkbox = $(this);
            var obj = {};

            // If checkbox is not checked,
            // don't include it
            if (!$checkbox.is(':checked')) {
              return;
            }

            // add flag to differentiate from typed fields
            obj.isPredefined = true;
            obj.id = $checkbox.data('id');
            obj.item = $checkbox.val();

            list.push(obj);
          });

        return list;
      },

      load_entity: function f1435(e) {
        if ($(e.target)
          .attr('href')) {
          location.href = $(e.target)
            .attr('href');
        }
      },
      getGrowingListInvalidString: function () {

      }
    });

    return growingListComponentView;
  });

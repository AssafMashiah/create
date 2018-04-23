define(['Class', 'repo', 'pluginRepoTemplateConverter'], function (Class, repo, pluginRepoTemplateConverter) {
    var PluginHiddenModel = Class.extend({
        initialize: function (parentId) {
            this.parentId = parentId;
            this.children = [];
        },
        addHiddenChild: function (data, success) {
            var converter = new pluginRepoTemplateConverter();

            data.parentId = this.parentId;

            converter.get([data], function (response) {
                response[0].type = 'pluginHidden';

                var id = repo.addTemplate({ parentId: this.parentId, template: JSON.stringify(response) });

                success && success(id);
            }.bind(this))
        },
        removeHiddenChild: function (id) {
            if (~this.children.indexOf(id)) {
                this.children = _.filter(this.children, function (childId) {
                    return childId !== id;
                })

                repo.remove(id);
            } else {
                throw new TypeError("Item is not hidden or not exists");
            }
        },
        getHiddenChildren: function () {
            return _.map(this.children, function (childId) {
                return repo.get(childId);
            })
        },
        load: function (id) {
            var router = require('router'),
                activeEditorId = router.activeScreen && router.activeScreen.editor && router.activeScreen.editor.record && router.activeScreen.editor.record.id,
                child = repo.getChildren(id)[0];

            router.load(id);

            var hiddenController = require('repo_controllers').get(id);

            if (hiddenController && activeEditorId) {
                hiddenController.nextActiveId = activeEditorId;
            }

            if (child) {
                var controller = require('repo_controllers').get(child.id);
                if (controller) {
                    setTimeout(controller.startEditing.bind(controller), 100);
                }
            }
        }
    });

    return PluginHiddenModel;
})
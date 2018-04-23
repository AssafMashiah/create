define( [ "require", "jquery", "mustache", "lodash"],
function( require, $, mustache, _ ) {

    function alignProgress(entity, json) {
        var parent = json[entity.id];
        var task = json[parent.parent];
        if(task.type == 'sorting' || task.type == 'sequencing' || task.type == 'matching'){
            entity['showProgressType'] = true;
            entity['progressType'] = 'oneCompletion';
        }

        if (task.type === 'cloze') {
             entity['ignoreCheckingItems'] = _.chain(json[entity.id].data.ignore_checking_list).where({ checked: true }).map(function (item) {
                return { id: item.id }
            }).value();
        }

	    entity.checkable = (typeof entity.checking_enabled == "undefined") ? true : entity.checking_enabled;

        _.each(parent.children, function(child, index) {
            if(child && json[child].type == "hint") {
                var newHint = {};
                newHint.show_hint = parent.data.show_hint;
                //hint_timing==1 means always show hint
                if(parent.data.hint_timing == 1) {
                    newHint.first = true;
                    newHint.mid = true;
                    newHint.last = true;
                }
                //hint_timing==2 means show hint after X number of attempts
                if( parent.data.hint_timing == 2 &&
                    parent.data.on_attempt >= 1 &&
                    parent.data.on_attempt < parent.data.num_of_attempts-1) {

                    newHint.first = false;
                    newHint.mid = true;
                    newHint.last = false;
                }

                if( parent.data.hint_timing == 2 &&
                    parent.data.on_attempt == parent.data.num_of_attempts-1) {

                    newHint.first = false;
                    newHint.mid = false;
                    newHint.last = true;
                }
                  newHint.attemptNum = parent.data.on_attempt;
                  newHint.maxAttempts =  parent.data.num_of_attempts;
                _.extend(json[child].data, newHint);
            }
        })

    }

    return alignProgress;
});
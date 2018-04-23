define(["require", "jquery", "mustache", "lodash"],
    function(require, $, mustache, _) {

        function alignFeedback(entity, json) {

            var json2xml = require('json2xml');

            entity.genericFeedbacks = [];
            entity.specificFeedbacks = [];

            // Generic feedbacks
            var attempts = json[json[entity.id].parent].data.num_of_attempts;
            _.each(entity.feedbacks_map, function(map, feedback_type) {
                _.each(map, function(textViewerId, attempt) {

                    if (attempt == "type") {
                        return;
                    }

                    mergeFeedbackData(json, attempt, feedback_type, textViewerId);
                    entity.genericFeedbacks.push({
                        mustached: json2xml.convert(json, textViewerId)
                    });

                    if (attempt == "preliminary" && attempts > 2) {

                        for (var i = attempts; i > 2; i--) {
                            var newTextViewer = {};
                            $.extend(true, newTextViewer, json[textViewerId]);
                            newTextViewer.id = textViewerId + "-" + i;
                            json[newTextViewer.id] = newTextViewer;
                            mergeFeedbackData(json, 'mid', feedback_type, newTextViewer.id);
                            if ($.inArray(newTextViewer.id, json[json[textViewerId].parent].children) == -1) {
                                json[json[textViewerId].parent].children.push(newTextViewer.id);
                            }
                            entity.genericFeedbacks.push({
                                mustached: json2xml.convert(json, newTextViewer.id)
                            });
                        }
                    }
                });
            });

            // Specific feedbacks
            var task = json[entity.id];
            while ((task = json[task.parent]) && ['mc', 'cloze', 'matching', 'sorting'].indexOf(task.type) == -1);

            if (!task) return;

            var clozeAnswer = _.find(json, function(rec) {
                return rec.parent == task.id && rec.type == 'cloze_answer'
            });

            switch(task.type){
            // mc task
                case 'mc':
                _.each(entity.feedbacks_map_specific, function(map, id) {
                    var optionFeedback = {
                        id: id
                    };
                    // correct option
                    if (!isEmptyFeedback(json[map.correct_feedback_id])) {
                        optionFeedback.correct = [{
                            type: 'id',
                            value: id,
                            mustached: json2xml.convert(json, map.correct_feedback_id)
                        }];
                    }
                    // incorrect option
                    if (!isEmptyFeedback(json[map.incorrect_feedback_id])) {
                        optionFeedback.wrong = [{
                            type: 'id',
                            value: id,
                            mustached: json2xml.convert(json, map.incorrect_feedback_id)
                        }];
                    }
                    entity.specificFeedbacks.push(optionFeedback);
                });
                break;

            // cloze task
                case 'cloze':
                    if (clozeAnswer) {
                // The task is cloze write 
                if (clozeAnswer.data.interaction == 'write') {
                    _.each(entity.feedbacks_map_specific, function(map, id) {
                        var optionFeedback = {
                            id: id,
                            correct: [],
                            partially: [],
                            wrong: []
                        }

                        if (!isEmptyFeedback(json[map.correct_feedback_id])) {
                            var ans = getAnswerText(json, clozeAnswer, id, id);
                            if (ans) {
                                optionFeedback.correct.push({
                                    type: ans.type,
                                    value: ans.data,
                                    mustached: json2xml.convert(json, map.correct_feedback_id)
                                });
                            }
                        }

                        if (!isEmptyFeedback(json[map.incorrect_feedback_id])) {
                            optionFeedback.wrong.push({
                                type: 'default',
                                value: '',
                                mustached: json2xml.convert(json, map.incorrect_feedback_id)
                            });
                        }

                        _.each(map.related_feedbacks, function(relMap, relId) {
                            if (!isEmptyFeedback(json[relMap.feedback_id])) {
                                var answer = getAnswerText(json, clozeAnswer, id, relId);
                                if (answer) {
                                    optionFeedback[relMap.type].push({
                                        type: answer.type,
                                        value: answer.data,
                                        mustached: json2xml.convert(json, relMap.feedback_id)
                                    });
                                }
                            }
                        });

                        entity.specificFeedbacks.push(optionFeedback);
                    });
                }
                // The task is cloze drag&drop 
                else {
                    _.each(entity.feedbacks_map_specific, function(map, id) {
                        var optionFeedback = {
                            id: id,
                            correct: [],
                            partially: [],
                            wrong: []
                                };

                        if (id == 'default_feedbacks') {
                            optionFeedback.id = 'default';
                            if (!isEmptyFeedback(json[map.correct.feedback_id])) {
                                optionFeedback.correct.push({
                                    type: 'default',
                                    value: '',
                                    mustached: json2xml.convert(json, map.correct.feedback_id)
                                });
                            }
                            if (!isEmptyFeedback(json[map.incorrect.feedback_id])) {
                                optionFeedback.wrong.push({
                                    type: 'default',
                                    value: '',
                                    mustached: json2xml.convert(json, map.incorrect.feedback_id)
                                });
                            }
                        } else {
                            if (!isEmptyFeedback(json[map.correct_feedback_id])) {
                                optionFeedback.correct.push({
                                    type: 'id',
                                    value: id,
                                    mustached: json2xml.convert(json, map.correct_feedback_id)
                                });
                            }

                            _.each(map.related_feedbacks, function(relMap, relId) {
                                if (!isEmptyFeedback(json[relMap.feedback_id])) {
                                    optionFeedback[relMap.type].push({
                                        type: 'id',
                                        value: relId,
                                        mustached: json2xml.convert(json, relMap.feedback_id)
                                    });
                                }
                            });
                        }

                        entity.specificFeedbacks.push(optionFeedback);
                    });
                }
            }
                break;

                case 'matching':
                case 'sorting':

                    _.each(entity.feedbacks_map_specific, function(map, id) {
                        var optionFeedback = {
                            correct: [],
                            wrong: []
                        };

                        if (id == 'default_feedbacks') {
                            optionFeedback.id = 'default';
                            if (!isEmptyFeedback(json[map.correct.feedback_id])) {
                                optionFeedback.correct.push({
                                    type: 'default',
                                    value: '',
                                    mustached: json2xml.convert(json, map.correct.feedback_id)
                                });
        }
                            if (!isEmptyFeedback(json[map.incorrect.feedback_id])) {
                                optionFeedback.wrong.push({
                                    type: 'default',
                                    value: '',
                                    mustached: json2xml.convert(json, map.incorrect.feedback_id)
                                });
                            }
                        } else {
                            var mtqSubQuestion = json[json[id].parent];
                            var mtqSubAnswer = _.find(mtqSubQuestion.children, function (childID) {
                                return ['mtqMultiSubAnswer', 'mtqSubAnswer'].indexOf(json[childID].type) > -1;
                            });
                            optionFeedback.id = mtqSubAnswer;
                            _.each(map.related_feedbacks, function(relMap, relId) {
                                if (!isEmptyFeedback(json[relMap.feedback_id])) {
                                    optionFeedback[relMap.type].push({
                                        type: 'id',
                                        value: json[relId].data.correct!==undefined ? json[relId].data.correct.toString() :relId,
                                        mustached: json2xml.convert(json, relMap.feedback_id)
                                    });
                                }
                            });
                        }

                        entity.specificFeedbacks.push(optionFeedback);
                    });
                
                break;
            }
        }

        function isEmptyFeedback(feedback) {
            if (feedback && feedback.data && feedback.data.title) {
                return !$('<div />').html(feedback.data.title).text().trim() &&
                        !$('<div />').html(feedback.data.title).find('component, latex ,mathfield').length;
            }

            return true;
        }

        function getAnswerText(json, clozeAnswer, answerId, id) {
            // Found in repo
            if (json[id]) {
                if (['mathfield', 'answerFieldTypeMathfield'].indexOf(json[id].type) != -1) {
                    return {
                        type: 'mathfield',
                        data: json[id].data.markup
                    }
                }
                else {
                    return {
                        type: 'plain',
                        data: $('<div />').html(json[id].data.title).text()
                    }
                }
            }

            var answerData,
                retVal,
                answerLists = ['AdditionalCorrectAnswers', 'PartiallyCorrectAnswers', 'ExpectedWrong', 'additionalExactMatch'];
            if (json[answerId]) {
                answerData = json[answerId].data;
            }
            else {
                var ctv = _.chain(clozeAnswer.children)
                    .map(function(child) { return json[child]; })
                    .find(function(child) { return child.type == 'cloze_text_viewer'; })
                    .value();

                if (ctv && ctv.data.answerFields) {
                    if (answerId == id && ctv.data.answerFields[answerId]) {
                        if (ctv.data.answerFields[answerId].type == 'text') {
                            return {
                                type: 'plain',
                                data: $('<div />').html(ctv.data.title).find('span[id=' + answerId + ']').text()
                            };
                        }
                        else {
                            var markup = (ctv.data.answerMarkup && ctv.data.answerMarkup[answerId] && ctv.data.answerMarkup[answerId].markup) || ctv.data.mathfieldArray[$('<div />').html(ctv.data.title).find('answerfield[id=' + answerId + '] mathfield').attr('id')].markup;
                            return {
                                type: 'mathfield',
                                data: markup
                            };
                        }
                    }

                    answerData = ctv.data.answerFields[answerId];
                }
            }

            if (!answerData) return {};

            _.each(answerLists, function(list) {
                var opt = _.where(answerData[list], { id: id });
                if (opt.length) {
                    retVal = {
                        type: opt[0].item ? 'plain' : 'mathfield',
                        data: opt[0].item || opt[0].markup
                    }
                }
            });

            return retVal;
        }

        function mergeFeedbackData(json, attempt, feedback_type, mergeToID) {
            var newObj = {};
            newObj.message = true;
            newObj.attempt = feedback_map[attempt];
            newObj.feedback_type = feedback_map[feedback_type] || feedback_type;
            if (!feedback_map[feedback_type]) {
                newObj.name = feedback_type;
            }
            _.extend(json[mergeToID].data, newObj);
        }

        var feedback_map = {
            all_correct: "allCorrect",
            all_incorrect: "allIncorrect",
            partly_correct: "partCorrect",
            missing_item: "allCorrectPartMissing",
            partly_correct_more_80: "partCorrectMoreThan80Percent",
            partly_correct_less_80: "partCorrectLessThan80Percent",
            partly_correct_missing_item: "partCorrectPartMissing",
            all_correct_and_wrong: "allCorrectPartIncorrect",
            preliminary: "first",
            mid: "mid",
            final: "last"
        };

        return alignFeedback;
    }
);
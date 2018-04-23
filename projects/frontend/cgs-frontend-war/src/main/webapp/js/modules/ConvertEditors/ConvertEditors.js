define(['lodash', 'BaseContentEditor', 'repo', './config' , './constants', 'events', './ConvertEditorsView'],
    function f354(_, BaseContentEditor, repo, config, constants, events, ConvertEditorsView) {

        /* This is from Stack Overflow, needs refactor */

        function htmlWithLineBreaks(html) {
            var breakToken = '_______break_______',
                lineBreakedHtml = html.replace(/<br\s?\/?>/gi, breakToken).replace(/<p\.*?>(.*?)<\/p>/gi, breakToken + '$1' + breakToken);
            return $('<div>').html(lineBreakedHtml).text().replace(new RegExp(breakToken, 'g'), '<br>');
        }

        /*** Conversion-related code, possibly should move to a separate module. ***/

        function _commit_content(to_type, task_id, content_type, value) {
            if (to_type === null) {
                var rec = [task_id],
                    viewer = null;
            }
            else {
                var rec = repo.getChildrenRecordsByType(task_id, to_type),
                    viewer = null;
            }

            if (rec && rec[0]) rec = rec[0];
            else return;

            if (content_type == "text") {
                viewer = {
                    // childConfig: void 0,
                    children: [],
                    data: {
                        mathfieldArray: {},
                        showNarrationType: true,
                        textEditorStyle: "texteditor",
                        title: value,
                        width: "100%",
                        disableDelete: to_type != 'question'
                    },
                    parent: rec.id,
                    type: "textViewer"
                };
            }
            else if (content_type == "image") {
                viewer = {
                    // childConfig: void 0,
                    children: [],
                    data: {
                        image: value.src,
                        imgHeight: value.height,
                        imgWidth: value.width,
                        minimumReadable: "50%",
                        title: "Image",
                        disableDelete: to_type != 'question' && value.disableDelete
                    },
                    parent: rec.id,
                    type: "imageViewer"
                };
            }

            if (viewer) {
                var newId = repo.set(viewer),
                    newChildren = require('cgsUtil').cloneObject(rec.children);

                newChildren.push(newId);
                repo.updateProperty(rec.id, 'children', newChildren, true);
            }

            return rec;
        }

        var _convert_cfg = {
            convert_question_only_editor: {
                task_template: "modules/QuestionOnlyEditor/TaskTemplate",
                fields: ["question_content", "question_title"],

                commit_content: function f355(from, task_id, content_type, value) {
                    var to_type = {
                        "question_title": "instruction",
                        "question_content": "question"
                    }[from];
                    if (to_type == 'instruction') {
                        var instruction = repo.getChildrenRecordsByType(task_id, to_type)[0];
                        if (instruction) {
                            instruction.data.show = true;
                        }
                    }
                    _commit_content(to_type, task_id, content_type, value);
                }
            },

            convert_multiple_choice: {
                task_template: "modules/MCEditor/TaskTemplate",
                fields: ["question_content", "question_instruction"],

                commit_content: function f356(from, task_id, content_type, value) {
                    var to_type = {
                        "question_instruction": "instruction",
                        "question_content": "question"
                    }[from];
                    var rec = _commit_content(to_type, task_id, content_type, value);
                }
            },

            convert_freewriting_editor: {
                task_template: "modules/FreeWritingEditor/TaskTemplate",
                fields: ["question_content"],

                commit_content: function f357(from, task_id, content_type, value) {
                    _commit_content("question", task_id, content_type, value);
                }
            },

            convert_narrative_editor: {
                task_template: "modules/NarrativeEditor/TaskTemplate",
                fields: ["question_content"],

                commit_content: function f358(from, task_id, content_type, value) {
                    _commit_content("question", task_id, content_type, value);
                }
            },

            convert_pedagogical_statement: {
                task_template: "modules/PedagogicalStatementEditor/TaskTemplate",
                fields: ["question_content", "question_instruction_content"],

                commit_content: function f359(from, task_id, content_type, value) {
                    var to_type = {
                        "question_instruction_content": "title",
                        "question_content": "question"
                    }[from];
                    var rec = _commit_content(to_type, task_id, content_type, value);
                    if (rec.type == "title") {
                        repo.updateProperty(rec.id, 'show', true, false, true);
                }
                }
            },

            convert_self_check_editor: {
                task_template: "modules/SelfCheckEditor/TaskTemplate",
                fields: ["question_content", "question_title"],

                commit_content: function f360(from, task_id, content_type, value) {
                    var to_type = {
                        "question_title": "title",
                        "question_content": "question"
                    }[from];
                    var rec = _commit_content(to_type, task_id, content_type, value);
                    if (rec.type == "title") {
                        repo.updateProperty(rec.id, 'show', true, false, true);
                }
            }
            }
        };

        /*** Conversion-related code ends here. ***/


        var ConvertEditors = BaseContentEditor.extend({
            initialize: function f361(options) {
                this._super(config, options);

                this.stage_view = new ConvertEditorsView({ controller: this });

                this.bindEvents({
                    pdf_convert_done: {'type': 'register', 'func': this.onConvertDone, 'ctx': this, 'unbind': 'dispose'},
                    pdf_sub_editor_added: {'type': 'register', 'func': this.onEditorSelected, 'ctx': this, 'unbind': 'dispose'},
                    drop_content: {'type': 'register', 'func': this.onDropContent, 'ctx': this, 'unbind': 'dispose'},
                    setEvents: {'type': 'register', 'func': this.onEditorLoad, 'ctx': this, 'unbind': 'dispose'},
                    setDroppable: {'type': 'register', 'func': this.setDroppable, 'ctx': this, 'unbind': 'dispose'}
                });

                this.editors_queue = [];
            },

            //on drop content from the pdf to the editors zone get the editor record and update it with the data
            onDropContent: function f362(id, contentId, data) {
                return repo.updateProperty(id, contentId, data);
            },
            onEditorLoad: function f363(editorId) {
                return this.stage_view.setEvents(editorId);
            },
            editors_queue: [],
            //recive editor type and add it to childrens
            onEditorSelected: function f364(options) {
                if (constants.limits[options.type]) {
                    var childrens = repo.getChildrenRecordsByType(this.config.id, options.type);

                    if (childrens.length === constants.limits[options.type]) {
                        return false;
                    }
                }

                var childRecord = repo.set({
                    'type': options.type,
                    'parent': this.config.id,
                    'children': [],
                    'data': $.extend({}, options.data || {}, constants.editors.default_data)
                });

                this.editors_queue.push(childRecord);

                var newChildren = require('cgsUtil').cloneObject(this.record.children);
                if (constants.positions[options.type]) {
                    newChildren.unshift(childRecord);
                } else {
                    newChildren.push(childRecord);
                }
                repo.updateProperty(this.record.id, 'children', newChildren, true);
                //add editor to repo
                this.renderChildren();

                var firstEditor = $('#editors #ConvertEditors .element_preview_wrapper'),
                    newEditor = $('#editors [data-elementid="' + childRecord + '"]');
                if (firstEditor.length && newEditor.length)
                $('#editors').scrollTop(newEditor.offset().top - firstEditor.offset().top);

                events.fire('convertEditorAdded');
            },

            setDroppable: function f365(id) {
                this.stage_view.setDroppable(id);
            },

            onConvertDone: function f366(config) {
                var html_sequence = repo.getAncestorRecordByType(this.record.id, "html_sequence");
                var get_recursive_clone = repo.getRecursiveDeepClone(this.record.parent);
                var livePageElements = _.filter(html_sequence.children, function(childId) {
                    return repo.get(childId).type.indexOf('livePage') == 0;
                });

                //if we inside convert mode and press cacnel we don't want to lost all the sequence data only what we add from the last state
                if (config.status === "cancel") {
                    //check if we add new editors while we in convert mode
                    if (this.editors_queue.length) {
                        //itreate through the editors queue (queue - wait for the user to save them)
                        _.each(this.editors_queue, function f367(item) {
                            //remove the editor from the repo
                            repo.remove(item);
                        });
                    }

                } else {
                    //just set clone of the last state if user want make edit again
                    repo.updateProperty(html_sequence.id, 'editModeData', get_recursive_clone, false, true);

                    _.each(livePageElements, repo.remove, repo);
                    livePageElements = [];
                }

                html_sequence.children = _.map(this.record.children, function f368(child_id) {
                    var child = repo.get(child_id);

                    if (child.type in _convert_cfg) {
                        var ccfg = _convert_cfg[child.type],
                            task_template = require(ccfg.task_template).template;

                        var tmpObj = JSON.parse(task_template);
                        _.each(tmpObj, function f369(item) {
                            if (item.data) {
                                item.data.ignore_defaults = true;
                            }
                        });
                        task_template = JSON.stringify(tmpObj);

                        logger.debug(logger.category.EDITOR, 'Add new task from template ' + ccfg.task_template);

                        var task_template_cfg = {
                                template: task_template,
                                parentId: html_sequence.id
                            },
                            retval = repo.addTemplate(task_template_cfg);

                        
                        _.each(ccfg.fields, function f370(field_name) {
                            //checks that the field_name is in English due to a problem 
                            //that it breaks the Sizzle dom selection
                            if(field_name == "question_instruction"){
                                return;
                            }
                            $(child.data[field_name]).find("[type]").map(function f371(_, obj) {

                                var type = (obj = $(obj)).attr("type");

                                if (type == "text") {
                                    var text = htmlWithLineBreaks(obj.html()) // obj.text();

                                    ccfg.commit_content(field_name, retval, "text", text);
                                }
                                else if (type == "image") {
                                    var image_src = obj.find("img").attr("src"),
                                        image = image_src.substr(image_src.indexOf("/media/")),
                                        img = document.querySelector("img[src='" + image_src + "']");

                                    ccfg.commit_content(field_name, retval, "image", {
                                        src: image,
                                        width: img.naturalWidth,
                                        height: img.naturalHeight,
                                        disableDelete: true
                                    });
                                }
                                ;
                            });
                        });

                        if (child.type == "convert_freewriting_editor") {
                            var fw = repo.get(retval),
                                fwAnswer = repo.getChildrenRecordsByType(retval, "FreeWritingAnswer"),
                                textEditor = repo.getChildrenRecordsByType(fwAnswer[0].id, "textEditor");

                            repo.updateProperty(textEditor[0].id, 'ShowToolbar', child.data.toolbar, false, true);
                            repo.updateProperty(textEditor[0].id, 'answer_size', child.data.size, false, true);
                            textEditor[0].data.MaxChars = child.data.MaxChars;
                        }

                        if (child.type == "convert_multiple_choice") {
                            var question = repo.get(retval),
                                options = repo.getChildrenRecordsByType(retval, "mcAnswer");

                            //
                            repo.updateProperty(repo.getChildrenRecordsByType(retval, "instruction")[0].children[0]
                                , "title", child.data.question_instruction);

                            if (options.length) options = options[0];
                            else throw new Error("BUG");

                            repo.updateProperty(options.id, 'children', _.filter(options.children, function f372(rec) {
                                return repo.get(rec).type != "option";
                            }), true, true);

                            if ((child.data.mode  === "multiple_answers") || child && child.data && child.data.checked && child.data.checked.selected && _.isArray(child.data.checked.selected)) {
                                repo.updateProperty(options.id, 'answerMode', 'mmc', false, true);
                            } else {
                                repo.updateProperty(options.id, 'answerMode', 'mc', false, true);
                            }

                            repo.updateProperty(options.id, 'random', child.data.randomize, false, true);
                            repo.updateProperty(options.id, 'optionsType', child.data.type + 'Viewer', false, true);
                            // repo.updateProperty(child.id, 'type', child.data.type + 'Viewer', false, true);

                            _.map(child.children, function f373(answer_id) {
                                var answer = repo.get(answer_id);

                                if (answer.type == "convert_mc_answer") {
                                    var option_rec = {
                                        children: [],
                                        data: {
                                            correct: false,
                                            title: "option"
                                        },
                                        parent: options.id,
                                        type: "option"
                                    };

                                    if (child && child.data && child.data.checked && child.data.checked.selected && _.isArray(child.data.checked.selected)) {
                                        if (child.data.checked.selected.indexOf(answer.id) !== -1) {
                                            option_rec.data.correct = true;
                                        }
                                    } else if (child && child.data && child.data.checked && child.data.checked.selected && child.data.checked.selected == answer_id) {
                                        option_rec.data.correct = true;
                                    }

                                    var new_option_id = repo.set(option_rec);
                                    repo.updateProperty(options.id, 'children', _.union(options.children, [new_option_id]), true, true);

                                    if (!answer.data.answer_content || !answer.data.answer_content.trim()) {
                                        _commit_content(null, option_rec, child.data.type, "");
                                    } else {
                                        $(answer.data.answer_content).find("[type]").map(function f374(_, obj) {
                                            var type = (obj = $(obj)).attr("type");

                                            if (type == "text") {
                                                var text = htmlWithLineBreaks(obj.html()) // obj.text();

                                                _commit_content(null, option_rec, "text", text);
                                            }
                                            else if (type == "image") {
                                                var image_src = obj.find("img").attr("src"),
                                                    image = image_src.substr(image_src.indexOf("/media/")),
                                                    img = document.querySelector("img[src='" + image_src + "']");

                                                _commit_content(null, option_rec, "image", {
                                                    src: image,
                                                    width: img.naturalWidth,
                                                    height: img.naturalHeight,
                                                    disableDelete: true
                                                });
                                            }
                                            ;
                                        });
                                    }
                                }
                            });
                        }

                        return retval;
                    }
                    else if (child.type == "convert_header_editor") {
                        var header_data = {};

                        _.each(["question_instruction", "question_content"], function f375(field_name) {
                            header_data[field_name] = [];

                            $(child.data[field_name]).find("[type]").map(function f376(_, obj) {
                                var type = (obj = $(obj)).attr("type");

                                if (type == "text") {
                                    var text = htmlWithLineBreaks(obj.html()) // obj.text();
                                    header_data[field_name].push(text);
                                }
                                // No support for images.
                            });
                        });



                        var header = repo.createItem({
                            data: {
                               "showGenericTitle":true, 
                               "showGenericSubTitle" : true,
                                'title': "FIXME"
                            },
                            displayTaskDropdown: false,
                            isCourse: false,
                            parentId: html_sequence.id,
                            setScreenLabel: "Header",
                            showTaskSettingsButton: false,
                            type: "header"
                        });


                        var genericTitle = repo.createItem({
                            type: 'genericTitle',
                            parentId:header,
                            data : {
                                "title": "title",
                                "disableDelete":true
                            }
                        });
                       
                        var headerTitle = repo.createItem({
                            parentId : genericTitle,
                            type: 'textViewer',
                            data: {
                                "title": header_data.question_instruction.join("\n"),
                                "disableDelete":true,
                                "mode" : "singleStyleNoInfoBaloon",
                                "availbleNarrationTypes" :[
                                    {"name": "None", "value": ""},
                                    {"name":"General", "value": "1"}
                                ]
                            }
                        });

                        var genericSubTitle = repo.createItem({
                            type: 'genericSubTitle',
                            parentId:header,
                            data : {
                                "title": "title",
                                "disableDelete":true
                            }
                        });
                       
                        var headerSubTitle = repo.createItem({
                            parentId : genericSubTitle,
                            type: 'textViewer',
                            data: {
                                "title": header_data.question_content.join("\n"),
                                "disableDelete":true,
                                "mode" : "singleStyleNoInfoBaloon",
                                "availbleNarrationTypes" :[
                                    {"name": "None", "value": ""},
                                    {"name":"General", "value": "1"}
                                ]
                            }
                        });

                        return header;
                    }

                    throw new Error("Unknown type:", child.type);
                });

                // Clean up instruction.

                _.each(html_sequence.children, function f377(child_id) {
                    var child = repo.get(child_id),
                        instructions = repo.getChildrenRecordsByType(child_id, "instruction");

                    if (instructions && instructions.length) {
                        var instruction = instructions[0];

                        if (instruction.children.length != 1) {
                            instruction.children.shift();
                            repo.updateProperty(instruction.children[0], 'disableDelete', true, false, true);
                        }
                    }
                });

                _.each(html_sequence.children, function f378(child_id) {
                    var child = repo.get(child_id),
                        titles = repo.getChildrenRecordsByType(child_id, "title");

                    if (titles && titles.length) {
                        var title = titles[0];

                        if (title.children.length != 1) {
                            title.children.shift();
                            repo.updateProperty(title.children[0], 'disableDelete', true, false, true);
                        }
                    }
                });

                if (this.record.children.length) {
                    repo.updateProperty(html_sequence.id, 'type', 'sequence', true, true);
                    repo.updateProperty(html_sequence.id, 'exposure', 'all_exposed', false, true);
                    repo.updateProperty(html_sequence.id, 'type', 'simple', false, true);
                    repo.updateProperty(html_sequence.id, 'isPdfConverted', true, false, true);
                    repo.updateProperty(html_sequence.id, 'isThumbnailUpdated', false, false, true);
                }

                repo.updateProperty(html_sequence.id, 'children', _.union(html_sequence.children, livePageElements), true, true);

                //init validation function, before liading the sequence, to show the user all the invalid components
                require('validate').isEditorContentValid(html_sequence.id);

                this.router.load(html_sequence.id);
            }

        }, { type: "ConvertEditors" });

        return ConvertEditors;
    });

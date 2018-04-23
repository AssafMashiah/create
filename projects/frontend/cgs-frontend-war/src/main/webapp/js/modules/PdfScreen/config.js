define({
	components: {
		props: {
			modName: 'PropsComponent'
		},
		menu: {
			modName: "MenuComponent",
			config: {
				menuItems: [{
					'label' : '((course.levels.sequence))',
					id: "menu-button-html-seq",
					type: "button",
					icon: "star",
					canBeDisabled: false,
					subMenuItems: [{
						'label' : '((course.levels.sequence))',
						type: "btn-group-title",
						subMenuItems: [{
							id: "menu-button-html-new-header",
							icon: "star",
							'label' : '((Header))',
							event: "pdf_sub_editor_added",
							args: { "type": "convert_header_editor" },
							canBeDisabled: true
						},
						{
							id: "menu-button-html-new-qa",
							icon: "star",
							'label' : '((Question Only))',
							event: "pdf_sub_editor_added",
							args: { type: 'convert_question_only_editor' },
							canBeDisabled: true
						},
						{
							id: "menu-button-html-new-mc",
							icon: "star",
							'label' : '((MC))',
							event: "pdf_sub_editor_added",
							args: { type: 'convert_multiple_choice', data: {
								'input_type': 'radio'
							} },
							canBeDisabled: true
						},
						{
							id: "menu-button-html-new-fw",
							icon: "star",
							'label' : '((Free Writing))',
							args: {
								type: 'convert_freewriting_editor'
							},
							event: "pdf_sub_editor_added",
							canBeDisabled: true
						},
						/*{
							id: "menu-button-html-new-cloze",
							icon: "star",
							'label' : '((Cloze))',
							event: "pdf_sub_editor_added",
							canBeDisabled: true
						},
						{
							id: "menu-button-html-new-matching",
							icon: "star",
							'label' : '((Matching))',
							event: "pdf_sub_editor_added",
							canBeDisabled: true
						},*/
						{
							id: "menu-button-html-new-narrative",
							icon: "star",
							'label' : '((Context))',
							event: "pdf_sub_editor_added",
							args: { type: 'convert_narrative_editor' },
							canBeDisabled: true
						},
						{
							id: "menu-button-html-new-pedst",
							icon: "star",
							'label' : '((Pedagogical))',
							event: "pdf_sub_editor_added",
							args: { type: 'convert_pedagogical_statement' },
							canBeDisabled: true
						},
						{
							id: "menu-button-html-new-self",
							icon: "star",
							'label' : '((Self-check))',
							event: "pdf_sub_editor_added",
							args: {
								type: 'convert_self_check_editor'
							},
							canBeDisabled: true
						}]
					},
					{
						'label' : '((Edit))',
						type: "btn-group",
						subMenuItems: [{
							id: "menu-button-html-done",
							icon: "folder-close",
							'label' : '((Done))',
							event: "pdf_convert_done",
							args: {
								status: "convert"
							},
							canBeDisabled: true
						},
						{
							id: "menu-button-html-cancel",
							icon: "undo",
							'label' : '((Cancel))',
							event: "pdf_convert_done",
							args: {
								status: "cancel"
							},
							canBeDisabled: true
						}]
					}]
				}],
				menuInitFocusId: "menu-button-html-seq"
			}
		}
	}
})

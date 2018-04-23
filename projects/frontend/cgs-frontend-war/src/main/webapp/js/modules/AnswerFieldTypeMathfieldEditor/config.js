define({
    menuItems:[],
    constants: {
      completionTypesNonCheckable:[
      {
         "key": 'A',
         'label' : '((task.answer_field_type_mathfield.props.all_option))',
      },
      {
         "key": 'E',
         'label' : '((Expression))',
      },
      {
         "key": 'O',
         'label' : '((Operators))',
      },
      {
         "key": 'Q',
         'label' : '((Equation))',
      },
      {
         "key": 'D',
         'label' : '((Digits))',
      },
      {
         "key": 'W',
         'label' : '((Whole Number))',
      }
    ],
      completionTypes: [
            {
               "key": 'A',
               'label' : '((task.answer_field_type_mathfield.props.all_option))',
            },
            {
              "key": "C",
              "label" : "((task.answer_field_type_mathfield.props.completion_option))"
            },
            {
               "key": 'E',
               'label' : '((Expression))',
            },
            {
               "key": 'O',
               'label' : '((Operators))',
            },
            {
               "key": 'Q',
               'label' : '((Equation))',
            },
            {
               "key": 'D',
               'label' : '((Digits))',
            },
            {
               "key": 'W',
               'label' : '((Whole Number))',
            }],
      editor:{
        'Letter' : {
           'MaxChars'  : 1
        },
        'Word'   : {
          'MaxChars' : 15
        },
        'Line'  : {
          'MaxChars' : 45
        }
      } 
    }
});
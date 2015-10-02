$.extend(true, MENUS, {
    UI: {
        init: function() {
            $('#department_menu').menu().addClass('drop-shadow');
            $('#department_menu').on('click', function() {
                $('#department_menu').fadeOut()
            }).on('mouseleave', function() {
                $('#department_menu').fadeOut()
            });
            MENUS.UI.initShared()
        }
    },
    department: function(event, caller) {
        var title = caller.innerHTML,
            id = caller.id;
        $('#department_title_option').html('<a href="#" class="menu_header"><b>' + title + '</b></a>');
        $('#edit_department_option').off().on('click', function() {
            DEPARTMENTS.edit(id)
        });
        $('.menu_header').off().hover(function() {
            $(this).css({
                color: 'white'
            })
        }, function() {
            $(this).css({
                color: 'black'
            })
        });
        $('#department_menu').css({
            top: event.pageY - 20,
            left: event.pageX - 20
        }).show()
    }
});
var CONTROLLER = {
        UI: {
            init: function() {
                CONTROLLER.UI.initShared();
                ADMINISTRATORS.UI.init();
                INSTRUCTORS.UI.init()
            },
            update: function() {
                if (DEPARTMENTS.Active) {
                    $('#bottom_course_div').fadeIn();
                    if (COURSES.Active) {
                        $('#bottom_question_div').fadeIn();
                        $('#bottom_eval_div').fadeIn();
                        $('#bottom_student_div').fadeIn();
                        $('#bottom_data_div').fadeIn()
                    } else {
                        $('#question_select').empty();
                        $('#evaluation_select').empty();
                        $('#student_select').empty();
                        $('#data_select').empty();
                        $('#bottom_question_div').fadeOut();
                        $('#bottom_eval_div').fadeOut();
                        $('#bottom_student_div').fadeOut();
                        $('#bottom_data_div').fadeOut();
                        $('#question_header').html('Questions');
                        $('#student_header').html('Students')
                    }
                } else {
                    $('#course_select').empty();
                    $('#question_select').empty();
                    $('#evaluation_select').empty();
                    $('#student_select').empty();
                    $('#data_select').empty();
                    $('#bottom_course_div').fadeOut();
                    $('#bottom_question_div').fadeOut();
                    $('#bottom_eval_div').fadeOut();
                    $('#bottom_student_div').fadeOut();
                    $('#bottom_data_div').fadeOut();
                    $('#question_header').html('Questions');
                    $('#student_header').html('Students')
                }
            }
        },
        init: function() {
            CONTROLLER.UI.init();
            if (document.getElementById('license')) {
                UI.dialog('License Expired', 'Please contact support@mtuner.ca.')
            } else {
                OPTIONS.checkMaintenance();
                DEPARTMENTS.load()
            }
        },
        arguments: function(append) {
            if (!append) append = '';
            return '&department=' + DEPARTMENTS.Active + '&course=' + COURSES.Active + '&year=' + COURSES.getYear() + '&semester=' + COURSES.getSemester() + '&evaluation=' + EVALUATIONS.Active + '&student=' + STUDENTS.Active + append
        }
    },
    DEPARTMENTS = {
        Data: [],
        Selected: [],
        Active: null,
        Select: 'department_select',
        Loading: false,
        initControllers: function() {
            COURSES.Active = null;
            STUDENTS.Active = null;
            QUESTIONS.Active = null;
            EVALUATIONS.Active = null;
            DATA.Active = null;
            COURSES.Selected = [];
            EVALUATIONS.Selected = [];
            QUESTIONS.Selected = [];
            DATA.Selected = [];
            STUDENTS.Selected = [];
            COURSES.load();
            QUESTIONS.load();
            EVALUATIONS.load();
            STUDENTS.load()
        },
        create: function() {
            $('#department_id').val('');
            $('#department_title').val('');
            toggleDisplay('create_department_panel')
        },
        edit: function(id) {
            if (id != DEPARTMENTS.Active) DEPARTMENTS.loadDepartment(id);
            $.ajax({
                url: '/actions/department.php?action=load&department=' + id,
                success: function(data) {
                    var item = JSON.parse(data);
                    document.getElementById('create_department_form').ID.value = item.ID;
                    document.getElementById('create_department_form').Title.value = decode(item.Title);
                    toggleDisplay('create_department_panel')
                }
            })
        },
        load: function() {
            if (DEPARTMENTS.Loading == true) return;
            DEPARTMENTS.Loading = true;
            $.ajax({
                url: '/actions/administrator.php?action=departments',
                success: function(data) {
                    try {
                        DEPARTMENTS.Data = JSON.parse(data)
                    } catch (error) {
                        DEPARTMENTS.Data = [];
                        UI.dialog('Error', 'Could not load departments')
                    };
                    DEPARTMENTS.Loading = false;
                    DEPARTMENTS.updateSelect()
                }
            }).done(function() {
                DEPARTMENTS.Loading = false
            })
        },
        save: function() {
            $.ajax({
                url: '/actions/department.php?action=create',
                type: 'POST',
                data: $('#create_department_form').serialize(),
                success: function() {
                    DEPARTMENTS.load(false);
                    toggleDisplay('create_department_panel')
                }
            })
        },
        loadDepartment: function(id) {
            if (DEPARTMENTS.Loading == true) return;
            DEPARTMENTS.Loading = true;
            setCookie('selectedDepartment', id, 30);
            DEPARTMENTS.Active = id;
            DEPARTMENTS.initControllers();
            CONTROLLER.UI.update();
            DEPARTMENTS.Loading = false
        },
        updateSelect: function() {
            if (DEPARTMENTS.Loading == true) return;
            DEPARTMENTS.Loading = true;
            var items = DEPARTMENTS.Data;
            $('#department_select').empty();
            var itemCount = DEPARTMENTS.Data.length;
            for (var c = 0; c < itemCount; c++) {
                var item = UI.multiSelectItem(DEPARTMENTS.Data[c]['ID'], DEPARTMENTS.Data[c]['Title'], false),
                    description = '<big>' + decode(DEPARTMENTS.Data[c]['Title']) + '</big><span class="department_details"><br>' + DEPARTMENTS.Data[c]['Courses'].length + ' Courses</span>';
                item.className = 'multiple_select_item white';
                $(item).html(description).css({
                    lineHeight: '1.2em',
                    paddingTop: '0.5em',
                    paddingBottom: '0.4em'
                });
                $(item).click(function(event) {
                    DEPARTMENTS.selectItem(this, event)
                });
                $(item).on('contextmenu', function(event) {
                    MENUS.department(event, this)
                });
                if (c == (itemCount - 1)) $(item).addClass('bottom-shadow');
                $('#department_select').append(item)
            };
            DEPARTMENTS.Loading = false;
            var lastSelected = getCookie('selectedDepartment');
            if (lastSelected != false) setTimeout(function() {
                $('#' + lastSelected).click()
            }, 300)
        },
        selectItem: function(item, event) {
            if (CONTROLLER.Loading == true) return;
            if (event.altKey) {
                UI.altClick(DEPARTMENTS.Selected, item.id)
            } else if (event.shiftKey) {
                UI.shiftClick(DEPARTMENTS.Select, DEPARTMENTS.Selected, item.id)
            } else UI.click(DEPARTMENTS, 'Active', DEPARTMENTS, 'Selected', DEPARTMENTS, 'Select', item.id);
            if (DEPARTMENTS.Selected.length == 1) {
                DEPARTMENTS.loadDepartment(DEPARTMENTS.Selected[0])
            } else DEPARTMENTS.loadDepartment(null)
        },
        remove: function() {
            if (DEPARTMENTS.Selected.length === 0) {
                UI.dialog('Error', 'No departments selected!');
                return
            };
            var status = confirm('Are you sure you want to delete these departments and all associated courses/questions/evaluations?\n' + FUNCTIONS.listArray(DEPARTMENTS.Selected, 0));
            if (status !== true) return;
            var itemCount = DEPARTMENTS.Selected.length;
            for (var c = 0; c < itemCount; c++) {
                var url = '/actions/department.php?action=delete&department=' + DEPARTMENTS.Selected[c];
                $.ajax({
                    url: url,
                    async: false
                })
            };
            DEPARTMENTS.Selected = [];
            DEPARTMENTS.load(false)
        },
        toggleDetails: function() {
            if ($('.department_details').is(':visible')) {
                $('.department_details').hide()
            } else $('.department_details').show()
        }
    },
    COURSES = {
        Data: [],
        Selected: [],
        Active: null,
        Select: 'course_select',
        Loading: false,
        UI: {
            init: function() {
                $('#year_semester_div').fadeIn();
                $('#year_select').menu().css({
                    position: 'absolute',
                    right: 95,
                    minWidth: 60,
                    maxWidth: 60,
                    width: 60,
                    height: 20,
                    padding: '1px',
                    top: 0
                });
                $('#semester_select').menu().css({
                    position: 'absolute',
                    right: 0,
                    minWidth: 90,
                    maxWidth: 90,
                    width: 90,
                    height: 20,
                    padding: '1px',
                    top: 0
                });
                $('#course_year_select').menu();
                $('#course_semester_select').menu();
                $('#course_year_select').css({
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: 24,
                    padding: 2
                });
                $('#course_semester_select').css({
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    height: 24,
                    padding: 2
                })
            }
        },
        initControllers: function() {
            STUDENTS.Active = null;
            QUESTIONS.Active = null;
            EVALUATIONS.Active = null;
            DATA.Active = null;
            EVALUATIONS.Selected = [];
            QUESTIONS.Selected = [];
            DATA.Selected = [];
            STUDENTS.Selected = [];
            DATA.load();
            QUESTIONS.load();
            EVALUATIONS.load();
            STUDENTS.load()
        },
        save: function() {
            $('#course_introduction').val(CKEDITOR.instances['course_introduction'].getData());
            var form = $('#create_course_form'),
                department = form.find('input[name="Department"]'),
                data = form.serialize();
            $.ajax({
                url: '/actions/course.php?action=create&department=' + department.val(),
                type: 'POST',
                data: data,
                success: function() {
                    COURSES.load();
                    toggleDisplay('create_course_panel')
                }
            })
        },
        create: function() {
            $('#course_id').val('');
            $('#course_title').val('');
            $('#course_code').val('');
            $('#course_year_select').val(COURSES.getYear());
            $('#course_semester_select').val(COURSES.getSemester());
            $('#course_department').val(DEPARTMENTS.Active);
            CKEDITOR.instances['course_introduction'].setData('');
            toggleDisplay('create_course_panel')
        },
        edit: function(id) {
            if (id != COURSES.Active) COURSES.loadCourse(id);
            $.ajax({
                url: '/actions/course.php?action=load&course=' + id,
                success: function(data) {
                    var item = JSON.parse(data);
                    $('#course_id').val(item.ID);
                    $('#course_title').val(decode(item.Title));
                    $('#course_code').val(decode(item.Code));
                    $('#course_year_select').val(item.Year);
                    $('#course_semester_select').val(item.Semester);
                    $('#course_department').val(item.Department);
                    $('#course_textbook').val(decode(item.TextbookURL));
                    CKEDITOR.instances['course_introduction'].setData(decode(item.Introduction));
                    toggleDisplay('create_course_panel')
                }
            })
        },
        load: function() {
            if (COURSES.Loading == true) return;
            COURSES.Loading = true;
            if (DEPARTMENTS.Active == null) {
                COURSES.Active = null;
                COURSES.Selected = [];
                CONTROLLER.UI.update();
                COURSES.Data = [];
                COURSES.Loading = false;
                COURSES.updateSelect();
                return
            };
            $.ajax({
                url: '/actions/department.php?action=courses&department=' + DEPARTMENTS.Active + '&year=' + COURSES.getYear() + '&semester=' + COURSES.getSemester(),
                beforeSend: function() {
                    COURSES.Active = null;
                    COURSES.Selected = [];
                    CONTROLLER.UI.update()
                },
                success: function(data) {
                    try {
                        COURSES.Data = JSON.parse(data)
                    } catch (error) {
                        COURSES.Data = [];
                        UI.dialog('Error', 'Could not load courses')
                    };
                    COURSES.Loading = false;
                    COURSES.updateSelect()
                }
            }).done(function() {
                COURSES.Loading = false
            })
        },
        loadAll: function(department) {
            if (COURSES.Loading == true) return;
            COURSES.Loading = true;
            if (DEPARTMENTS.Active == null) {
                COURSES.Active = null;
                COURSES.Selected = [];
                CONTROLLER.UI.update();
                COURSES.Data = [];
                COURSES.Loading = false;
                COURSES.updateSelect();
                return
            };
            $.ajax({
                url: '/actions/department.php?action=all-courses&department=' + department,
                beforeSend: function() {
                    COURSES.Active = null;
                    COURSES.Selected = [];
                    CONTROLLER.UI.update()
                },
                success: function(data) {
                    try {
                        COURSES.Data = JSON.parse(data)
                    } catch (error) {
                        COURSES.Data = [];
                        UI.dialog('Error', 'Could not load courses')
                    };
                    COURSES.Loading = false;
                    COURSES.updateSelect()
                }
            }).done(function() {
                COURSES.Loading = false
            })
        },
        loadCourse: function(id) {
            if (COURSES.Loading == true) return;
            COURSES.Loading = true;
            setCookie('selectedCourse', id, 30);
            COURSES.Active = id;
            COURSES.initControllers();
            CONTROLLER.UI.update();
            COURSES.Loading = false
        },
        remove: function() {
            if (COURSES.Selected.length === 0) {
                UI.dialog('Error', 'No courses selected!');
                return
            };
            var items = COURSES.Selected.join(),
                status = confirm('Are you sure you want to delete these courses and all questions/evaluations?\n' + FUNCTIONS.listArray(COURSES.Selected, 0));
            if (status !== true) return;
            var itemCount = COURSES.Selected.length;
            for (var c = 0; c < itemCount; c++) $.ajax({
                url: '/actions/course.php?action=delete&course=' + COURSES.Selected[c],
                async: false
            });
            COURSES.load()
        },
        updateSelect: function() {
            if (COURSES.Loading == true) return;
            COURSES.Loading = true;
            $('#' + COURSES.Select).empty();
            var itemCount = COURSES.Data.length;
            for (var c = 0; c < itemCount; c++) {
                var item = UI.multiSelectItem(COURSES.Data[c]['ID'], '', false),
                    description = '<big>' + decode(COURSES.Data[c]['Title']) + '</big><span class="course_details"><br>' + decode(COURSES.Data[c]['Code']) + '</span>';
                $(item).on('contextmenu', function(event) {
                    MENUS.course(event, this)
                });
                $(item).click(function(event) {
                    COURSES.selectItem(this, event)
                });
                $(item).html(description).css({
                    lineHeight: '1.2em',
                    paddingTop: '0.5em',
                    paddingBottom: '0.4em'
                });
                if (c == (itemCount - 1)) $(item).addClass('bottom-shadow');
                $('#' + COURSES.Select).append(item)
            };
            COURSES.Loading = false;
            var lastSelected = getCookie('selectedCourse');
            if (lastSelected != false) setTimeout(function() {
                $('#' + lastSelected).click()
            }, 300)
        },
        selectItem: function(item, event) {
            if (CONTROLLER.Loading == true) return;
            if (event.altKey) {
                UI.altClick(COURSES.Selected, item.id)
            } else if (event.shiftKey) {
                UI.shiftClick(COURSES.Select, COURSES.Selected, item.id)
            } else UI.click(COURSES, 'Active', COURSES, 'Selected', COURSES, 'Select', item.id);
            if (COURSES.Selected.length == 1) {
                COURSES.loadCourse(item.id)
            } else COURSES.loadCourse(null)
        }
    },
    QUESTIONS = {
        Data: [],
        Selected: [],
        Active: null,
        Select: 'question_select',
        SecondarySelect: 'eval_item_select',
        Loading: false,
        load: function() {
            if (QUESTIONS.Loading == true) return;
            QUESTIONS.Loading = true;
            $('#question_header').html('Loading...');
            var property = $('#sort_select').val();
            $('#eval_sort_select').val(property);
            $.ajax({
                url: '/actions/course.php?action=questions&course=' + COURSES.Active + '&property=' + property,
                success: function(data) {
                    try {
                        QUESTIONS.Data = JSON.parse(data)
                    } catch (error) {
                        QUESTIONS.Data = [];
                        UI.dialog('Error', 'Could not load questions')
                    };
                    QUESTIONS.Loading = false;
                    QUESTIONS.updateSelect()
                }
            }).done(function() {
                QUESTIONS.Loading = false;
                QUESTIONS.refreshTags()
            })
        }
    },
    INSTRUCTORS = {
        Data: [],
        Courses: [],
        UI: {
            Mode: 'Standard',
            toggleMode: function() {
                if (INSTRUCTORS.UI.Mode == 'Standard') {
                    INSTRUCTORS.UI.MODE.edit()
                } else INSTRUCTORS.UI.MODE.standard()
            },
            init: function() {
                $('#existing_instructor_select').css({
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: 220,
                    height: 'auto'
                });
                $('#instructor_courses').css({
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    right: 0,
                    width: 395,
                    height: 'auto'
                });
                $('#instructor_course_select').menu().css({
                    bottom: 5,
                    width: 235,
                    left: 0,
                    height: 20
                });
                $('#instructor_role_select').menu().css({
                    bottom: 5,
                    width: 80,
                    left: 242,
                    height: 20
                });
                $('#existing_instructor_select').change(function() {
                    if (this.selectedIndex != -1) {
                        INSTRUCTORS.loadInstructor(this.options[this.selectedIndex].id)
                    } else INSTRUCTORS.loadInstructor(false)
                })
            },
            MODE: {
                standard: function() {
                    INSTRUCTORS.UI.Mode = 'Standard';
                    $('#toggle_instructor_button').button("option", {
                        icons: {
                            primary: 'ui-icon-plus'
                        }
                    });
                    $('#create_instructor_form').fadeOut();
                    $('#instructor_courses').animate({
                        top: 0,
                        bottom: 0
                    });
                    $('#existing_instructor_select').animate({
                        top: 0,
                        bottom: 0
                    })
                },
                edit: function() {
                    INSTRUCTORS.UI.Mode = 'Edit';
                    $('#toggle_instructor_button').button("option", {
                        icons: {
                            primary: 'ui-icon-triangle-1-n'
                        }
                    });
                    $('#create_instructor_form').fadeIn();
                    $('#instructor_courses').animate({
                        top: 45,
                        bottom: 0
                    });
                    $('#existing_instructor_select').animate({
                        top: 180,
                        bottom: 30
                    })
                }
            }
        },
        manage: function() {
            MENUS.options();
            toggleDisplay('manage_instructor_panel');
            INSTRUCTORS.load();
            INSTRUCTORS.loadCourses()
        },
        load: function() {
            $.ajax({
                url: '/actions/instructor.php?action=load-all',
                success: function(data) {
                    INSTRUCTORS.Data = JSON.parse(data);
                    INSTRUCTORS.updateInstrcutorSelect()
                }
            })
        },
        loadInstructor: function(instructor) {
            if (instructor == false) {
                document.getElementById('instructor_courses').options.length = 0;
                INSTRUCTORS.UI.MODE.standard();
                return
            };
            $.ajax({
                url: '/actions/instructor.php?action=all-courses&instructor=' + instructor,
                success: function(data) {
                    document.getElementById('instructor_courses').options.length = 0;
                    var items = JSON.parse(data),
                        itemCount = items.length;
                    for (var c = 0; c < itemCount; c++) {
                        var itemString = items[c]['Code'] + ' - ' + decode(items[c]['Title']) + ' [' + items[c]['Year'] + '] [' + items[c]['Semester'] + '] [' + items[c]['Role'] + ']',
                            option = new Option(itemString, itemString, false, false);
                        option.id = items[c]['ID'];
                        $('#instructor_courses').append(option)
                    }
                }
            }).done(function() {
                INSTRUCTORS.editInstructor(instructor)
            })
        },
        loadCourses: function() {
            $.ajax({
                url: '/actions/course.php?action=all-courses',
                success: function(data) {
                    INSTRUCTORS.Courses = JSON.parse(data);
                    INSTRUCTORS.updateCourseSelect()
                }
            })
        },
        create: function() {
            var instructor = $('#instructor_account').val(),
                password = $('#instructor_password').val(),
                passwordAgain = $('#instructor_password_confirm').val();
            if (instructor.length === 0) {
                UI.dialog('Error', 'No instructor specified, please enter an account name and try again.');
                return
            };
            if (password.length === 0 || passwordAgain.length === 0) {
                UI.dialog('Error', 'No password specified!')
            } else if (password != passwordAgain) {
                UI.dialog('Error', 'Passwords don\'t match!');
                return
            };
            $.ajax({
                url: '/actions/instructor.php?action=create',
                type: 'POST',
                data: $("#create_instructor_form").serialize(),
                success: function(data) {
                    if (data == '-1') UI.dialog('Success', 'Instructor updated.');
                    INSTRUCTORS.load()
                }
            })
        },
        remove: function() {
            if ($('#existing_instructor_select :selected').length === 0) {
                UI.dialog('Error', 'No instructors selected!');
                return
            };
            var selectedItems = [];
            $('#existing_instructor_select :selected').each(function() {
                if (this.id != USER.ID) selectedItems.push(this.id)
            });
            var status = confirm('Are you sure you want to delete the selected instructor(s)?');
            if (status !== true) return;
            $.ajax({
                url: '/actions/instructor.php?action=delete',
                type: 'POST',
                data: {
                    instructors: JSON.stringify(selectedItems)
                },
                async: false
            }).done(function(data) {
                INSTRUCTORS.load()
            })
        },
        editInstructor: function(instructor) {
            $.ajax({
                url: '/actions/instructor.php?action=load&instructor=' + instructor,
                success: function(data) {
                    INSTRUCTORS.UI.MODE.edit();
                    var item = JSON.parse(data);
                    $('#instructor_account').val(item.Account);
                    $('#instructor_first').val(item.First);
                    $('#instructor_last').val(item.Last);
                    $('#instructor_email').val(item.Email)
                }
            })
        },
        addCourse: function() {
            var instructorSelect = document.getElementById('existing_instructor_select'),
                instructorCourseSelect = document.getElementById('instructor_course_select'),
                instructorRoleSelect = document.getElementById('instructor_role_select');
            if (!instructorSelect.options[instructorSelect.selectedIndex]) {
                UI.dialog('Error', 'No instructor selected!');
                return
            };
            var instructor = instructorSelect.options[instructorSelect.selectedIndex].id,
                course = instructorCourseSelect.options[instructorCourseSelect.selectedIndex].id,
                role = instructorRoleSelect.options[instructorRoleSelect.selectedIndex].value;
            $.ajax({
                url: '/actions/instructor.php?action=add-course&course=' + course + '&instructor=' + instructor + '&role=' + role,
                success: function(data) {
                    INSTRUCTORS.loadInstructor(instructor)
                }
            })
        },
        removeCourse: function() {
            var instructorSelect = document.getElementById('existing_instructor_select'),
                instructorCourseSelect = document.getElementById('instructor_courses'),
                instructorRoleSelect = document.getElementById('instructor_role_select'),
                instructorCourses = instructorCourseSelect.options;
            if (!instructorSelect.options[instructorSelect.selectedIndex]) {
                UI.dialog('Error', 'No instructor selected!');
                return
            };
            var instructor = instructorSelect.options[instructorSelect.selectedIndex].id,
                itemCount = instructorCourses.length;
            for (var i = 0; i < itemCount; i++)
                if (instructorCourses[i].selected === true) {
                    var course = instructorCourses[i].id;
                    $.ajax({
                        url: '/actions/instructor.php?action=remove-course&course=' + course + '&instructor=' + instructor,
                        async: false
                    })
                };
            INSTRUCTORS.loadInstructor(instructor)
        },
        cancelImport: function() {
            $('#import_panel').fadeOut();
            $('#manage_instructor_panel').fadeIn()
        },
        updateInstrcutorSelect: function() {
            document.getElementById('existing_instructor_select').options.length = 0;
            var itemCount = INSTRUCTORS.Data.length;
            for (var c = 0; c < itemCount; c++) {
                var entry = '';
                if (INSTRUCTORS.Data[c]['First'] != '' && INSTRUCTORS.Data[c]['Last'] != '') entry += INSTRUCTORS.Data[c]['Last'] + ', ' + INSTRUCTORS.Data[c]['First'] + ' | ';
                var option = new Option(entry + INSTRUCTORS.Data[c]['Account'] + '', INSTRUCTORS.Data[c]['Account'], false, false);
                option.id = INSTRUCTORS.Data[c]['ID'];
                $('#existing_instructor_select').append(option)
            }
        },
        updateCourseSelect: function() {
            document.getElementById('instructor_course_select').options.length = 0;
            var itemCount = INSTRUCTORS.Courses.length;
            for (var c = 0; c < itemCount; c++) {
                var itemString = INSTRUCTORS.Courses[c]['Code'] + ' - ' + decode(INSTRUCTORS.Courses[c]['Title']) + ' [' + INSTRUCTORS.Courses[c]['Year'] + '] [' + INSTRUCTORS.Courses[c]['Semester'] + ']',
                    option = new Option(itemString, itemString, false, false);
                option.id = INSTRUCTORS.Courses[c]['ID'];
                $('#instructor_course_select').append(option)
            }
        }
    },
    ADMINISTRATORS = {
        Data: [],
        UI: {
            init: function() {
                $('#existing_admin_select').css({
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: 240,
                    height: 'auto'
                });
                $('#admin_departments').css({
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    right: 0,
                    width: 375,
                    height: 'auto'
                });
                $('#existing_admin_select').change(function() {
                    if (this.selectedIndex != -1) {
                        ADMINISTRATORS.loadAdministrator(this.options[this.selectedIndex].id)
                    } else ADMINISTRATORS.loadAdministrator(false)
                })
            },
            standard: function() {
                $('#existing_admin_select').animate({
                    top: 0
                })
            },
            editMode: function() {
                $('#existing_admin_select').animate({
                    top: 180
                })
            }
        },
        getAccounts: function() {
            var accounts = [],
                itemCount = this.Data.length;
            for (var c = 0; c < itemCount; c++) accounts.push(this.Data[c].Account);
            return accounts
        },
        manage: function() {
            this.load();
            MENUS.options();
            toggleDisplay('manage_admin_panel');
            ADMINISTRATORS.loadDepartments()
        },
        load: function() {
            $.ajax({
                url: '/actions/administrator.php?action=load-all',
                success: function(data) {
                    var items = JSON.parse(data);
                    document.getElementById('existing_admin_select').options.length = 0;
                    ADMINISTRATORS.Data = items;
                    var systemAdmins = [],
                        departmentAdmins = [],
                        itemCount = items.length;
                    for (var c = 0; c < itemCount; c++)
                        if (items[c]['System'] === true) {
                            systemAdmins.push(items[c])
                        } else departmentAdmins.push(items[c]);
                    var disabledOption = new Option('System Administrators', '', false, false);
                    disabledOption.disabled = 'disabled';
                    disabledOption.style.backgroundColor = 'black';
                    disabledOption.style.color = 'white';
                    $('#existing_admin_select').append(disabledOption);
                    itemCount = systemAdmins.length;
                    for (var c = 0; c < itemCount; c++) {
                        var option = new Option(systemAdmins[c]['Account'], systemAdmins[c]['Account'], false, false);
                        option.id = systemAdmins[c]['ID'];
                        $('#existing_admin_select').append(option)
                    };
                    var departmentHeader = $(disabledOption).clone().html('Departmental Administrators');
                    $('#existing_admin_select').append(departmentHeader);
                    itemCount = departmentAdmins.length;
                    for (var c = 0; c < itemCount; c++) {
                        var option = new Option(departmentAdmins[c]['Account'], departmentAdmins[c]['Account'], false, false);
                        option.id = departmentAdmins[c]['ID'];
                        $('#existing_admin_select').append(option)
                    }
                }
            })
        },
        create: function() {
            var account = $('#create_admin_form input[name=account]').val(),
                password = $('#create_admin_form input[name=password]').val(),
                passwordAgain = $('#create_admin_form input[name=password_again]').val();
            if (account.length === 0) {
                UI.dialog('Error', 'No adminstrator specified, please enter an account name and try again.');
                return
            };
            var accounts = this.getAccounts(),
                isNew = accounts.indexOf(account) == -1;
            if (isNew) {
                if (password.length === 0 || passwordAgain.length === 0) {
                    UI.dialog('Error', 'No password(s) specified, please enter a password and try again.');
                    return
                } else if (password != passwordAgain) {
                    UI.dialog('Error', 'Passwords don\'t match!');
                    return
                };
                var status = confirm('Are you sure you want to create this administrator?');
                if (status !== true) return
            } else {
                var status = confirm('Are you sure you want to update this administrator?');
                if (status !== true) return
            };
            $.ajax({
                url: '/actions/administrator.php?action=create',
                type: 'POST',
                data: $("#create_admin_form").serialize(),
                success: function(data) {
                    if (data == '-1') UI.dialog('Success', 'Administrator updated.');
                    ADMINISTRATORS.load()
                }
            })
        },
        reloadControls: function() {
            if (document.getElementById('system_admin_checkbox').checked) {
                $('#system_admin_button').addClass('green')
            } else $('#system_admin_button').removeClass('green')
        },
        loadAdministrator: function(administrator) {
            if (administrator == false) {
                document.getElementById('system_admin_checkbox').checked = false;
                ADMINISTRATORS.reloadControls();
                ADMINISTRATORS.updateDepartments([]);
                $('#existing_admin_select').animate({
                    bottom: 0,
                    top: 0
                });
                return
            };
            $.ajax({
                url: '/actions/administrator.php?action=load&administrator=' + administrator,
                success: function(data) {
                    var item = JSON.parse(data);
                    document.getElementById('system_admin_checkbox').checked = item.System;
                    ADMINISTRATORS.updateDepartments(item.Departments);
                    $('#admin_account').val(item.Account);
                    $('#admin_first').val(item.First);
                    $('#admin_last').val(item.Last);
                    $('#admin_email').val(item.Email);
                    $('#existing_admin_select').animate({
                        bottom: 30,
                        top: 180
                    });
                    ADMINISTRATORS.reloadControls()
                }
            })
        },
        loadDepartments: function() {
            $.ajax({
                url: '/actions/department.php?action=departments',
                success: function(data) {
                    var items = JSON.parse(data);
                    document.getElementById('admin_departments').options.length = 0;
                    var itemCount = items.length;
                    for (var c = 0; c < itemCount; c++) {
                        var option = new Option(items[c]['Title'], items[c]['Title'], false, false);
                        option.id = items[c]['ID'];
                        $('#admin_departments').append(option)
                    }
                }
            })
        },
        update: function() {
            if ($('#existing_admin_select :selected').length === 0) {
                UI.dialog('Error', 'No administrators selected!');
                return
            };
            var status = confirm('Are you sure you want to update the selected administrator(s)?');
            if (status !== true) return;
            var selectedAdmins = [];
            $('#existing_admin_select :selected').each(function() {
                if (this.id != USER.ID) selectedAdmins.push(this.id)
            });
            var isSystem = $('#system_admin_checkbox').is(':checked'),
                adminDepartments = [];
            $('#admin_departments :selected').each(function() {
                adminDepartments.push(this.id)
            });
            var data = {
                administrators: JSON.stringify(selectedAdmins),
                departments: JSON.stringify(adminDepartments),
                system: isSystem
            };
            $.ajax({
                url: '/actions/administrator.php?action=update',
                type: 'POST',
                data: data,
                async: false
            }).done(function(data) {
                ADMINISTRATORS.load()
            })
        },
        remove: function() {
            if ($('#existing_admin_select :selected').length === 0) {
                UI.dialog('Error', 'No administrators selected!');
                return
            };
            var selectedAdmins = [];
            $('#existing_admin_select :selected').each(function() {
                if (this.id != USER.ID) selectedAdmins.push(this.id)
            });
            var status = confirm('Are you sure you want to delete the selected administrator(s)?');
            if (status !== true) return;
            $.ajax({
                url: '/actions/administrator.php?action=delete',
                type: 'POST',
                data: {
                    administrators: JSON.stringify(selectedAdmins)
                },
                async: false
            }).done(function(data) {
                ADMINISTRATORS.load()
            })
        },
        toggleOption: function(id) {
            document.getElementById(id).checked = !document.getElementById(id).checked;
            this.reloadControls()
        },
        updateDepartments: function(departments) {
            $('#admin_departments option').each(function() {
                if (departments.indexOf(this.id) != -1) {
                    this.selected = true;
                    $(this).css({
                        color: 'green'
                    })
                } else {
                    this.selected = false;
                    $(this).css({
                        color: 'gray'
                    })
                }
            })
        },
        cancelImport: function() {
            $('#import_panel').fadeOut();
            $('#manage_admin_panel').fadeIn()
        }
    },
    OPTIONS = {
        checkMaintenance: function() {
            $.ajax({
                url: '/actions/settings.php?action=maintenance-status',
                success: function(data) {
                    if (data == '0') {
                        $('#maintenance_status').html('<a href="#" style="color:white;padding-left:0px;text-align:left;">Status: Online</a>');
                        $('#maintenance_status_wrapper').removeClass('red').addClass('gloss menu_header green')
                    } else {
                        $('#maintenance_status').html('<a href="#" style="color:white;padding-left:0px;text-align:left;">Status: Offline</a>');
                        $('#maintenance_status_wrapper').removeClass('green').addClass('gloss menu_header red')
                    };
                    $('.menu_header').off().hover(function() {
                        $(this).css({
                            color: 'white'
                        })
                    }, function() {
                        $(this).css({
                            color: 'black'
                        })
                    })
                }
            })
        },
        toggleMaintenance: function() {
            $('#maintenance_status').html('<a href="#">Please wait...</a>');
            $.ajax({
                url: '/actions/settings.php?action=toggle-maintenance',
                success: function() {
                    OPTIONS.checkMaintenance()
                }
            })
        },
        setTheme: function(theme) {
            var status = confirm('Are you sure you want to change the theme to ' + theme + '?');
            if (status != true) return;
            $.ajax({
                url: '/actions/settings.php?action=set-theme&theme=' + theme,
                success: function() {
                    window.location.reload()
                }
            })
        },
        setTimezone: function(zone) {
            $.ajax({
                url: '/actions/settings.php?action=set-timezone&zone=' + zone,
                success: function() {
                    window.location.reload()
                }
            })
        },
        activeSessions: function() {
            $.ajax({
                url: '/actions/session.php?action=active-sessions'
            }).done(function(data) {
                try {
                    var sessions = JSON.parse(data)
                } catch (error) {
                    UI.dialog('Error', 'Could not retrieve session list');
                    return
                };
                var count = sessions.length;
                if (count != $('#session_list').children().length) {
                    var string = '<a href="#">Active Sessions: ' + count + '</a><ul id="session_list">';
                    for (var c = 0; c < count; c++) string = string + '<li title="' + sessions[c]['starttime'] + '"><a href="#">' + sessions[c]['account'] + '</a></li>';
                    string = string + '</ul>';
                    $('#active_sessions').html(string).addClass('ui-corner-all');
                    $('#session_list').addClass('y-overflow');
                    $('#option_panel').menu('refresh')
                }
            })
        }
    },
    PANELS = {
        Fullscreen: false,
        Panels: {
            department_panel: {
                id: 'department_panel',
                left: 0,
                width: 200,
                right: 'auto'
            },
            course_panel: {
                id: 'course_panel',
                left: 211,
                width: 200,
                right: 'auto'
            },
            question_panel: {
                id: 'question_panel',
                left: 422,
                width: 320,
                right: 'auto'
            },
            evaluation_panel: {
                id: 'evaluation_panel',
                left: 753,
                width: 220,
                right: 'auto'
            },
            student_panel: {
                id: 'student_panel',
                left: 983,
                width: 100,
                right: 'auto'
            },
            data_panel: {
                id: 'data_panel',
                left: 1094,
                width: 'auto',
                right: 0
            }
        }
    },
    SETTINGS = {
        manage: function() {
            toggleDisplay('settings_panel');
            SETTINGS.load()
        },
        load: function() {
            $.ajax({
                url: '/actions/settings.php?action=system-settings',
                success: function(data) {
                    $('#settings_form').empty();
                    var items = JSON.parse(data),
                        inputs = '';
                    $(items).each(function() {
                        var input = document.createElement("textarea");
                        input.className = 'system-setting';
                        input.id = this.IDENTIFIER;
                        input.name = this.IDENTIFIER;
                        input.value = this.INFO;
                        $(input).css({
                            width: '100%',
                            minWidth: '100%',
                            textAlign: 'left',
                            padding: 4,
                            boxSizing: 'border-box',
                            fontSize: 14
                        });
                        $('#settings_form').append('<br>' + this.IDENTIFIER + ':').append(input).append('<br>')
                    });
                    $('.system-setting').each(function() {
                        $(this).css({
                            height: 0
                        }).css({
                            height: (this.scrollHeight + 10)
                        })
                    })
                }
            })
        },
        save: function() {
            $.ajax({
                url: '/actions/settings.php?action=update-settings',
                type: 'POST',
                data: $('#settings_form').serialize(),
                success: function(data) {
                    UI.dialog('Success', 'Settings Updated');
                    SETTINGS.load()
                }
            })
        }
    }

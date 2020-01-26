$(document).ready(function () {
    //var url = "scripts/wizarddata.js";

    var url = "http://cmspreviewresources.windowsphone.com/windowsphone/en-us/cmpn/MSID-Wizard/V2/wizarddata.js";
    var provider = new MicrosoftWizardProject.DataAccess.Provider();
    var logic = new MicrosoftWizardProject.Logic.Controller(provider);
    logic.Init();
    var render = new MicrosoftWizardProject.Gui.Render(logic);
    render.Init();

    logic.LoadedAction(url, function (data) {
        if (data != false) {
            if (logic.wizard != undefined) {
                render.Render(data);
                render.WindowsResize();
            }
        }
    });
});

var MicrosoftWizardProject;
(function (MicrosoftWizardProject) {
    (function (DataAccess) {
        var Provider = (function () {
            function Provider() {
            }
            Provider.prototype.GetData = function (url, dataCallback) {
                var wizardData;
                $.ajax({
                    url: url,
                    type: 'GET',
                    async: false,
                    jsonpCallback: 'jsonCallback',
                    contentType: "application/json",
                    dataType: 'jsonp',
                    success: function (data) {
                        if (data != null) {
                            wizardData = data.wizard;
                            dataCallback(data.wizard);
                        } else {
                            dataCallback(false);
                        }
                    },
                    error: function (data) {
                        dataCallback(false);
                    }
                });
                return wizardData;
            };
            return Provider;
        })();
        DataAccess.Provider = Provider;
    })(MicrosoftWizardProject.DataAccess || (MicrosoftWizardProject.DataAccess = {}));
    var DataAccess = MicrosoftWizardProject.DataAccess;
})(MicrosoftWizardProject || (MicrosoftWizardProject = {}));

var MicrosoftWizardProject;
(function (MicrosoftWizardProject) {
    (function (Logic) {
        var Controller = (function () {
            function Controller(provider) {
                this.provider = provider;
                this.currentFlow = [];
                this.allEmailsInAccounts = [];
                this.accounts = [];
                this.byEmailHierarchy = [];
                this.savedState = [];
                Controller.prototype.provider = provider;
            }
            Controller.prototype.Init = function () {
                Controller.prototype.currentFlow = new Array();
                Controller.prototype.allEmailsInAccounts = new Array();
                Controller.prototype.accounts = new Array();
                Controller.prototype.byEmailHierarchy = new Array();
                Controller.prototype.selectedEmailId = "";
                Controller.prototype.savedState = new Array();
            };

            Controller.prototype.LoadedAction = function (link, callback) {
                Controller.prototype.provider.GetData(link, function (data) {
                    if (data != false) {
                        Controller.prototype.wizard = data;
                        callback(Controller.prototype.wizard);
                    } else {
                        callback(false);
                    }
                });
            };

            Controller.prototype.emptyCheckboxes = function () {
                var checkbox = $("#account_" + Controller.prototype.wizard.step[0].id + " input.checkbox[type = checkbox]:checked");
                for (var i = 0; i < checkbox.length; i++) {
                    if ($(checkbox[i]).attr("checked") === true) {
                        $(checkbox[i]).attr("checked", "");
                        $(checkbox[i]).parent().find(".btncheckbox").removeClass('checked');
                    }
                }
            };

            Controller.prototype.addPlaceHolderForOldIE = function () {
                if (!Modernizr.input.placeholder) {
                    $('[placeholder]').focus(function () {
                        var input = $(this);
                        if (input.val() == input.attr('placeholder')) {
                            input.val('');
                            input.removeClass('placeholder');
                        }
                    }).blur(function () {
                        var input = $(this);
                        if (input.val() == '' || input.val() == input.attr('placeholder')) {
                            input.addClass('placeholder');
                            input.val(input.attr('placeholder'));
                        }
                    }).blur();
                }
                $('[placeholder]').parents('form').submit(function () {
                    $(this).find('[placeholder]').each(function () {
                        var input = $(this);
                        if (input.val() == input.attr('placeholder')) {
                            input.val('');
                        }
                    });
                });
            };

            Controller.prototype.emptyInputs = function () {
                var inputs = $("#account_" + Controller.prototype.wizard.step[1].id + " input[type='text']");
                var errors = $(".errorMessage");
                for (var i = 0; i < errors.length; i++) {
                    if ($(errors[i]).text() != "")
                        $(errors[i]).text("");
                }
                for (var i = 0; i < inputs.length; i++) {
                    if ($(inputs[i]).attr("name") === "addedInput") {
                        $(inputs[i]).parent().remove();
                    } else {
                        if ($(inputs[i]).val() != "") {
                            $(inputs[i]).val("");
                            $(inputs[i]).parent().find("a.clearlink").css("visibility", "hidden");
                        }
                    }
                    $(inputs[i]).parent().parent().parent().find(".addemaildiv").hide();
                }
                Controller.prototype.addPlaceHolderForOldIE();
            };

            Controller.prototype.emptyWizard = function () {
                Controller.prototype.emptyCheckboxes();
                Controller.prototype.emptyInputs();
                $('#nextbtn_' + Controller.prototype.wizard.step[0].id).attr('disabled', 'disabled');
            };

            Controller.prototype.StartOverWizardAction = function (step, heightcallback) {
                Controller.prototype.emptyWizard();
                $(".step").css("left", $("#wizardMiddle").width());
                $("#" + step).css("left", "0px");
                var stepheight = $("#" + step).height() + 100;
                $("#WizardSection,#wizardPage").height(stepheight);
                heightcallback(stepheight);
                Controller.prototype.currentFlow = new Array();
                Controller.prototype.addtoCurrentFlow(step);
            };

            Controller.prototype.ShowWizardState = function (heightcallback) {
                if (Controller.prototype.currentFlow.length != 0) {
                    $("#heroPage").css("top", "0px");
                    $("#wizardPage").css("top", "0px");
                    var stepheight = $("#" + Controller.prototype.currentFlow[Controller.prototype.currentFlow.length - 1]).height();
                    $("#wizardPage,#WizardSection").height(stepheight);
                    var heroheight = $("#heroPage").height();
                    Controller.prototype.animateToTopQuick($("#heroPage"), $("#wizardPage"), $("#heroPage").height(), $("#heroPage").height(), "-=");
                    if (Controller.prototype.currentFlow.length === 1) {
                        Controller.prototype.StartOverWizardAction(Controller.prototype.currentFlow[0], function (dataheight) {
                            heightcallback(dataheight);
                        });
                    } else {
                        for (var i = 0; i < Controller.prototype.currentFlow.length - 1; i++) {
                            var step = $("#" + Controller.prototype.currentFlow[i]);
                            var nextstep = $("#" + Controller.prototype.currentFlow[i + 1]);
                            Controller.prototype.animateToLeftQuick(step, nextstep, step.width(), nextstep.width(), "-=");
                        }
                    }
                    heightcallback(stepheight + 100);
                }
            };

            Controller.prototype.ShowWizardAction = function (step, heightcallback) {
                Controller.prototype.StartOverWizardAction(step, function (dataheight) {
                    heightcallback(dataheight);
                });
                $("#heroPage").css("top", "0px");
                $("#wizardPage").css("top", "0px");
                var wizardheight = $("#wizardPage").height();
                var heroheight = $("#heroPage").height();
                Controller.prototype.animateToTop($("#heroPage"), $("#wizardPage"), $("#heroPage").height(), $("#heroPage").height(), "-=");
            };

            Controller.prototype.addtoCurrentFlow = function (step) {
                if (Controller.prototype.currentFlow.length === 0) {
                    Controller.prototype.currentFlow.push(step);
                    Controller.prototype.saveState(step);
                } else {
                    if (step != Controller.prototype.currentFlow[Controller.prototype.currentFlow.length - 1]) {
                        Controller.prototype.currentFlow.push(step);
                        Controller.prototype.saveState(step);
                    }
                }
            };

            Controller.prototype.saveState = function (step) {
                Controller.prototype.savedState = new Array();
                Controller.prototype.savedState.accounts = [];
                Controller.prototype.savedState.allemailsinaccounts = [];
                Controller.prototype.savedState.selectedEmailId = "";
                Controller.prototype.savedState.currentFlow = [];
                if (step === Controller.prototype.wizard.step[1].id) {
                    Controller.prototype.savedState.accounts = Controller.prototype.copyArray(Controller.prototype.accounts);
                } else if (step === Controller.prototype.wizard.step[2].id) {
                    Controller.prototype.savedState.accounts = Controller.prototype.copyArray(Controller.prototype.accounts);
                    Controller.prototype.savedState.allemailsinaccounts = Controller.prototype.copyContent(Controller.prototype.allEmailsInAccounts);
                    Controller.prototype.savedState.byEmailHierarchy = Controller.prototype.copyByEmailArray(Controller.prototype.byEmailHierarchy);
                } else if (step === Controller.prototype.wizard.step[3].id) {
                    Controller.prototype.savedState.accounts = Controller.prototype.copyArray(Controller.prototype.accounts);
                    Controller.prototype.savedState.allemailsinaccounts = Controller.prototype.copyContent(Controller.prototype.allEmailsInAccounts);
                    Controller.prototype.savedState.byEmailHierarchy = Controller.prototype.copyByEmailArray(Controller.prototype.byEmailHierarchy);
                    Controller.prototype.savedState.selectedEmailId = Controller.prototype.selectedEmailId;
                }
                Controller.prototype.savedState.currentFlow = Controller.prototype.copyArray(Controller.prototype.currentFlow);
                var state;
                if (Modernizr.history) {
                    window.history.pushState(Controller.prototype.savedState, "state");
                }
            };

            Controller.prototype.GoBackAction = function (heightcallback) {
                if (Controller.prototype.currentFlow.length > 1) {
                    var currentstep = Controller.prototype.currentFlow[Controller.prototype.currentFlow.length - 1];
                    var previousstep = Controller.prototype.currentFlow[Controller.prototype.currentFlow.length - 2];
                    $("#btnlayout_" + currentstep + ", #btnlayout_" + previousstep).css("visibility", "hidden");
                    Controller.prototype.animateToLeft($("#" + currentstep), $("#" + previousstep), $("#wizardMiddle").width(), $("#wizardMiddle").width(), "+=", function (test) {
                        if (test) {
                            $("#btnlayout_" + currentstep + ", #btnlayout_" + previousstep).css("visibility", "visible");
                        }
                    });
                    var stepheight = $("#" + previousstep).height();
                    $("#WizardSection,#wizardPage").height(stepheight + 100);
                    heightcallback(stepheight + 100);
                    Controller.prototype.currentFlow.pop();
                    Controller.prototype.saveState(currentstep);
                } else {
                    Controller.prototype.animateToTop($("#heroPage"), $("#wizardPage"), $("#heroPage").height(), $("#heroPage").height(), "+=");
                    heightcallback($("#heroPage").height());
                    Controller.prototype.currentFlow.pop();
                    Controller.prototype.saveState(currentstep);
                }
            };

            Controller.prototype.SetCurrentData = function (state) {
                Controller.prototype.currentFlow = state.currentFlow;
                Controller.prototype.accounts = state.accounts;
                Controller.prototype.allEmailsInAccounts = state.allemailsinaccounts;
                Controller.prototype.byEmailHierarchy = state.byEmailHierarchy;
                Controller.prototype.selectedEmailId = state.selectedEmailId;
                if (Controller.prototype.selectedEmailId != "") {
                    Controller.prototype.showResultStep(function () {
                    });
                }
                if (Controller.prototype.allEmailsInAccounts.length != 0) {
                    Controller.prototype.showChoicesStep(function () {
                    });
                }
                if (Controller.prototype.accounts.length != 0) {
                    Controller.prototype.showAccounts(function () {
                    });
                    var checkboxes = $('input.checkbox[type=checkbox]');
                    var btncheckbox = $("input[type='button']");
                    for (var i = 0; i < checkboxes.length; i++) {
                        var index = $.inArray($(checkboxes[i]).attr("data-account"), Controller.prototype.accounts);
                        if (index != -1) {
                            $(checkboxes[index]).attr("checked", "true");
                            $(btncheckbox[index]).addClass('checked');
                        }
                    }
                }
            };

            Controller.prototype.animateToLeftQuick = function (item1, item2, width1, width2, signe) {
                item1.animate({
                    left: signe + width1 + "px"
                }, {
                    duration: 0,
                    specialEasing: {
                        height: 'easeOutBack'
                    }
                });

                item2.animate({
                    left: signe + width2 + "px"
                }, {
                    duration: 0,
                    specialEasing: {
                        height: 'easeOutBack'
                    }
                });
            };

            Controller.prototype.animateToLeft = function (item1, item2, width1, width2, signe, callback) {
                item1.animate({
                    left: signe + width1 + "px"
                }, {
                    duration: 500,
                    specialEasing: {
                        height: 'easeOutBack'
                    },
                    complete: function () {
                    }
                });

                item2.animate({
                    left: signe + width2 + "px"
                }, {
                    duration: 500,
                    specialEasing: {
                        height: 'easeOutBack'
                    },
                    complete: function () {
                        callback(true);
                    }
                });
            };

            Controller.prototype.animateToTopQuick = function (item1, item2, height1, height2, signe) {
                item2.animate({
                    top: signe + height2 + "px"
                }, {
                    duration: 0,
                    specialEasing: {
                        height: 'easeOutBack'
                    }
                });
                item1.animate({
                    top: signe + height1 + "px"
                }, {
                    duration: 0,
                    specialEasing: {
                        height: 'easeOutBack'
                    }
                });
            };

            Controller.prototype.animateToTop = function (item1, item2, height1, height2, signe) {
                item2.animate({
                    top: signe + height2 + "px"
                }, {
                    duration: 500,
                    specialEasing: {
                        height: 'easeOutBack'
                    }
                });
                item1.animate({
                    top: signe + height1 + "px"
                }, {
                    duration: 500,
                    specialEasing: {
                        height: 'easeOutBack'
                    }
                });
            };

            Controller.prototype.CheckboxAction = function (checkbox) {
                if ($("#" + checkbox.id + " input").is(":checked")) {
                    $('#nextbtn_' + Controller.prototype.wizard.step[0].id).removeAttr('disabled');
                } else {
                    var checkboxes = $('input.checkbox[type=checkbox]:checked');
                    if (checkboxes.length == 0)
                        $('#nextbtn_' + Controller.prototype.wizard.step[0].id).attr('disabled', 'disabled');
                }
            };

            Controller.prototype.AddemailAction = function (btn, heightcallback) {
                var accountid = $(btn).attr("data-account");
                var email = $($("#emails" + accountid + " input")[$("#emails" + accountid + " input").length - 1]).val();
                var placeholder = $($("#emails" + accountid + " input")[$("#emails" + accountid + " input").length - 1]).attr('placeholder');
                if (email != placeholder) {
                    if (Controller.prototype.isValidEmailAddress(email)) {
                        if (Controller.prototype.wizard.step[1].id === Controller.prototype.wizard.step[1].id) {
                            $("#emails" + accountid).append("<div class=' clearable divclearable added'><input name='addedInput' class='inputinside clearable added' size='30' style='border-width: 0px; outline: none; ' type = 'text' placeholder = '" + Controller.prototype.wizard.step[1].placeholder + "'/><a class='clearlink' href='javascript: '></a></div>");
                            $("#emails" + accountid + " input").bind("change keyup input focus", function () {
                                Controller.prototype.InputChange(this);
                            });
                            $($("#emails" + accountid + " a.clearlink")).click(function () {
                                Controller.prototype.ClearRemoveEmailAction(this);
                            });
                            $("#emails" + accountid + " div.added a.clearlink").css("visibility", "visible");
                        }
                        Controller.prototype.tabIndexAssociate();
                        Controller.prototype.addPlaceHolderForOldIE();
                    } else {
                        $("#error_" + accountid + Controller.prototype.wizard.step[1].id).text(Controller.prototype.wizard.errormessage);
                    }
                } else {
                    $("#error_" + accountid + Controller.prototype.wizard.step[1].id).text(Controller.prototype.wizard.errormessage);
                }

                var stepheight = $("#" + Controller.prototype.wizard.step[1].id).height() + 100;
                $("#WizardSection").height(stepheight);
                $("#wizardPage").height(stepheight + 50);
                heightcallback(stepheight);
            };

            Controller.prototype.ClearRemoveEmailAction = function (closebtn) {
                if ($(closebtn).prev().val() != "" && $(closebtn).prev().val() != $(closebtn).prev().attr('placeholder')) {
                    $(closebtn).prev().val('').focus();
                } else {
                    if ($(closebtn).parent().find("input").attr("name") === "addedInput") {
                        $(closebtn).parent().remove();
                        var obj = $(closebtn).parent().find("input");
                    }
                }
            };

            Controller.prototype.saveEmail = function (email, accountid) {
                var naccount = 0;
                for (var i = 0; i < Controller.prototype.allEmailsInAccounts.length; i++) {
                    if (Controller.prototype.allEmailsInAccounts[i].accountid === accountid) {
                        var nemail = 0;
                        for (var j = 0; j < Controller.prototype.allEmailsInAccounts[i].emails.length; j++) {
                            if (Controller.prototype.allEmailsInAccounts[i].emails[j] != email)
                                nemail++;
                        }
                        if (nemail === Controller.prototype.allEmailsInAccounts[i].emails.length) {
                            Controller.prototype.allEmailsInAccounts[i].emails.push(email);
                            $("#error_" + accountid + Controller.prototype.wizard.step[1].id).text("");
                        }
                    } else
                        naccount++;
                }
                if (naccount === Controller.prototype.allEmailsInAccounts.length) {
                    var arr = new Array();
                    arr.accountid = accountid;
                    arr.emails = [];
                    arr.emails.push(email);
                    Controller.prototype.allEmailsInAccounts.push(arr);
                    $("#error_" + accountid + Controller.prototype.wizard.step[1].id).text("");
                }
            };

            Controller.prototype.isValidEmailAddress = function (emailAddress) {
                return emailAddress.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i);
            };

            Controller.prototype.animatetonext = function (step, nextstep, heightcallback) {
                if (nextstep != "") {
                    $("#btnlayout_" + step + ", #btnlayout_" + nextstep).css("visibility", "hidden");
                    Controller.prototype.animateToLeft($("#" + step), $("#" + nextstep), $("#" + step).width(), $("#" + nextstep).width(), "-=", function (test) {
                        if (test)
                            $("#btnlayout_" + step + ", #btnlayout_" + nextstep).css("visibility", "visible");
                    });
                    var stepheight = $("#" + nextstep).height() + 100;
                    $("#WizardSection,#wizardPage").height(stepheight);
                    heightcallback(stepheight);
                    Controller.prototype.addtoCurrentFlow(nextstep);
                }
            };

            Controller.prototype.verifycheckbox = function () {
                var test = true;
                var checkboxes = $('input.checkbox[type=checkbox]:checked');
                if (checkboxes.length == 0) {
                    test = false;
                } else {
                    test = true;
                }
                return test;
            };

            Controller.prototype.verifyRadioButton = function () {
                var test = true;
                var radioButtons = $('input.radio[type=radio]:checked');
                if (radioButtons.length == 0) {
                    test = false;
                } else {
                    test = true;
                }
                return test;
            };

            Controller.prototype.tabIndexAssociate = function () {
                var inputs = $("#account_" + Controller.prototype.wizard.step[1].id + " input[type='text']");
                for (var i = 0; i < inputs.length; i++) {
                    if ($(inputs[i]).attr("tabindex") != undefined) {
                        $(inputs[i]).attr("tabindex", i + 10);
                    }
                }
            };

            Controller.prototype.showAccounts = function (callback) {
                $(".accountStep2").hide();
                var checkboxes = $('input.checkbox[type=checkbox]:checked');
                Controller.prototype.tabIndexAssociate();
                for (var i = 0; i < checkboxes.length; i++) {
                    var accountid = $(checkboxes[i]).attr("data-account");
                    Controller.prototype.accounts.push(accountid);
                }
                for (var i = 0; i < Controller.prototype.accounts.length; i++) {
                    $("#account_" + Controller.prototype.accounts[i] + Controller.prototype.wizard.step[1].id).show();
                }
                callback(true);
            };

            Controller.prototype.saveAllEmails = function (callback) {
                var test = true;
                var addheight = 0;
                Controller.prototype.allEmailsInAccounts = new Array();
                Controller.prototype.byEmailHierarchy = new Array();
                for (var i = 0; i < Controller.prototype.accounts.length; i++) {
                    for (var j = 0; j < $("#emails" + Controller.prototype.accounts[i] + " input").length; j++) {
                        var email = $($("#emails" + Controller.prototype.accounts[i] + " input")[j]).val();
                        var placeholder = $($("#emails" + Controller.prototype.accounts[i] + " input")[j]).attr('placeholder');
                        if (email != placeholder) {
                            if (Controller.prototype.isValidEmailAddress(email)) {
                                Controller.prototype.saveEmail(email, Controller.prototype.accounts[i]);
                            } else {
                                if (j === 0 || email != "") {
                                    $("#error_" + Controller.prototype.accounts[i] + Controller.prototype.wizard.step[1].id).text(Controller.prototype.wizard.errormessage);
                                    test = false;
                                    addheight = addheight + 30;
                                }
                            }
                        } else {
                            $("#error_" + Controller.prototype.accounts[i] + Controller.prototype.wizard.step[1].id).text(Controller.prototype.wizard.errormessage);
                            test = false;
                            addheight = addheight + 30;
                        }
                    }
                }
                callback(addheight);
                return test;
            };

            Controller.prototype.showChoicesStep = function (callback) {
                $(".accountStep3").hide();
                $(".emaildiv").remove();
                $("#account_" + Controller.prototype.wizard.step[2].id).append("<form id='emailsForm'></form>");
                for (var i = 0; i < Controller.prototype.byEmailHierarchy.length; i++) {
                    $("#emailsForm").append("<div id='emaildiv_" + i + "' class='emaildiv' ></div>");
                    if (i === 0)
                        $("#emaildiv_" + i).append("<div class='emailTitle' ><input class='radio' data-index='" + i + "' id='emailRadio_" + i + "' type = 'radio' name = 'email' value = " + Controller.prototype.byEmailHierarchy[i].email + " checked> <span >" + Controller.prototype.byEmailHierarchy[i].email + "</span></div>");
else
                        $("#emaildiv_" + i).append("<div class='emailTitle' ><input class='radio' data-index='" + i + "' id='emailRadio_" + i + "' type = 'radio' name = 'email' value = " + Controller.prototype.byEmailHierarchy[i].email + " > <span >" + Controller.prototype.byEmailHierarchy[i].email + "</span></div>");
                    for (var j = 0; j < Controller.prototype.byEmailHierarchy[i].accounts.length; j++) {
                        var account = $.grep(Controller.prototype.wizard.account, function (e) {
                            return e.id == Controller.prototype.byEmailHierarchy[i].accounts[j];
                        });
                        $("#emaildiv_" + i).append("<p class='accountTitle'>" + account[0].value + "</p>");
                        $("#emaildiv_" + i).append("<p class='helperText'>" + account[0].helpertext + "</p>");
                    }
                }

                callback(true);
            };

            Controller.prototype.showResultStep = function (callback) {
                var radiobutton = $('input.radio[type=radio]:checked');

                if (Controller.prototype.selectedEmailId === undefined) {
                    if (Controller.prototype.byEmailHierarchy.length === 1) {
                        Controller.prototype.selectedEmailId = "0";
                    }
                } else {
                    if ($(radiobutton[0]).attr("data-index") != undefined)
                        Controller.prototype.selectedEmailId = $(radiobutton[0]).attr("data-index");
                }

                var step = $.grep(Controller.prototype.wizard.step, function (e) {
                    return e.id == Controller.prototype.wizard.step[3].id;
                });
                $(".accountStep4, .switchAccount").hide();
                $(".titleResultAccount, .emailsResultAccount, .keeperAccount").remove();
                $("#instructionIntro").show();
                $(".selectedEmail").text(Controller.prototype.byEmailHierarchy[Controller.prototype.selectedEmailId].email);
                for (var i = 0; i < Controller.prototype.byEmailHierarchy[Controller.prototype.selectedEmailId].accounts.length; i++) {
                    var result = $.grep(Controller.prototype.wizard.account, function (e) {
                        return e.id == Controller.prototype.byEmailHierarchy[Controller.prototype.selectedEmailId].accounts[i];
                    });
                    if (result[0].name === "xbox") {
                        $(".switchAccount").show();
                    }
                    if (Controller.prototype.allEmailsInAccounts.length === 1)
                        if (Controller.prototype.allEmailsInAccounts[0].emails.length === 1)
                            $("#chosenEmail .switchAccount, #instructionIntro").hide();
                    $("#chosenEmail").append("<div class='emailsResultAccount'><img class='resultIcon' src='" + result[0].icon + "' alt='iconselectedaccount' /><span>" + result[0].value + "</span></div> ");
                    $("#chosenEmail").append("<div class='keeperAccount'>" + result[0].keeperText.cdatasection + "</div>");
                }

                for (var i = 0; i < Controller.prototype.byEmailHierarchy.length; i++) {
                    if (i != +Controller.prototype.selectedEmailId) {
                        for (var j = 0; j < Controller.prototype.byEmailHierarchy[i].accounts.length; j++) {
                            $("#account_" + Controller.prototype.byEmailHierarchy[i].accounts[j] + step[0].id).show();
                            var account = $.grep(Controller.prototype.wizard.account, function (e) {
                                return e.id == Controller.prototype.byEmailHierarchy[i].accounts[j];
                            });
                            if (account[0].name === "xbox") {
                                $(".switchAccount").show();
                            }
                        }
                    }
                }
                $(".selectedEmail").text(Controller.prototype.byEmailHierarchy[Controller.prototype.selectedEmailId].email);
                callback(true);
            };

            Controller.prototype.gotoEmailsStep = function (step, heightcallback) {
                if (Controller.prototype.verifycheckbox()) {
                    Controller.prototype.accounts = new Array();
                    Controller.prototype.showAccounts(function (data) {
                        if (data) {
                            var nextstep = Controller.prototype.wizard.step[1].id;
                            Controller.prototype.animatetonext(step, nextstep, heightcallback);
                        }
                    });
                }
            };

            Controller.prototype.gotoAccountsStep = function (step, heightcallback) {
                Controller.prototype.showChoicesStep(function (data) {
                    if (data) {
                        var nextstep = Controller.prototype.wizard.step[2].id;
                        Controller.prototype.animatetonext(step, nextstep, heightcallback);
                    }
                });
            };

            Controller.prototype.gotoResultStep = function (caller, step, heightcallback) {
                if (Controller.prototype.allEmailsInAccounts.length === 1) {
                    Controller.prototype.showResultStep(function (data) {
                        if (data) {
                            var nextstep = Controller.prototype.wizard.step[3].id;
                            Controller.prototype.animatetonext(step, nextstep, heightcallback);
                        }
                    });
                } else {
                    if (Controller.prototype.verifyRadioButton()) {
                        Controller.prototype.showResultStep(function (data) {
                            if (data) {
                                var nextstep = Controller.prototype.wizard.step[3].id;
                                Controller.prototype.animatetonext(step, nextstep, heightcallback);
                            }
                        });
                    }
                }
            };

            Controller.prototype.GoNextAction = function (caller, step, heightcallback) {
                if (step === Controller.prototype.wizard.step[0].id) {
                    Controller.prototype.gotoEmailsStep(step, heightcallback);
                } else {
                    if (step === Controller.prototype.wizard.step[1].id) {
                        var addheight = 0;
                        var test = Controller.prototype.saveAllEmails(function (dataheight) {
                            addheight = dataheight;
                        });
                        if (test) {
                            if (Controller.prototype.allEmailsInAccounts.length === 1) {
                                if (Controller.prototype.allEmailsInAccounts[0].emails.length === 1) {
                                    Controller.prototype.changeHierarchyByEmail();
                                    Controller.prototype.selectedEmailId = "0";
                                    Controller.prototype.gotoResultStep(caller, step, heightcallback);
                                } else {
                                    Controller.prototype.changeHierarchyByEmail();
                                    Controller.prototype.gotoAccountsStep(step, heightcallback);
                                }
                            } else {
                                Controller.prototype.changeHierarchyByEmail();
                                Controller.prototype.gotoAccountsStep(step, heightcallback);
                            }
                        } else {
                            $("#WizardSection,#wizardPage").height($("#" + step).height() + addheight);
                            heightcallback($("#" + step).height() + addheight);
                        }
                    } else {
                        if (step === Controller.prototype.wizard.step[2].id) {
                            Controller.prototype.gotoResultStep(caller, step, heightcallback);
                        }
                    }
                }
            };

            Controller.prototype.changeHierarchyByEmail = function () {
                Controller.prototype.byEmailHierarchy = new Array();
                for (var i = 0; i < Controller.prototype.allEmailsInAccounts.length; i++) {
                    for (var j = 0; j < Controller.prototype.allEmailsInAccounts[i].emails.length; j++) {
                        var index = Controller.prototype.arrayContainsValue(Controller.prototype.byEmailHierarchy, Controller.prototype.allEmailsInAccounts[i].emails[j]);
                        if (index === -1) {
                            var arr = new Array();
                            arr.email = Controller.prototype.allEmailsInAccounts[i].emails[j];
                            arr.accounts = [];
                            arr.accounts.push(Controller.prototype.allEmailsInAccounts[i].accountid);
                            Controller.prototype.byEmailHierarchy.push(arr);
                        } else {
                            Controller.prototype.byEmailHierarchy[index].accounts.push(Controller.prototype.allEmailsInAccounts[i].accountid);
                        }
                    }
                }
            };

            Controller.prototype.arrayContainsValue = function (array, value) {
                if (array.length != 0) {
                    for (var i = 0; i < array.length; i++) {
                        if (array[i].email === value)
                            return i;
                    }
                }
                return -1;
            };

            Controller.prototype.copyArray = function (firstArray) {
                var result = new Array();
                for (var i = 0; i < firstArray.length; i++) {
                    result.push(firstArray[i]);
                }
                return result;
            };

            Controller.prototype.copyContent = function (firstArray) {
                var result = new Array();
                for (var i = 0; i < firstArray.length; i++) {
                    var arr = new Array();
                    arr.accountid = firstArray[i].accountid;
                    arr.emails = [];
                    for (var j = 0; j < firstArray[i].emails.length; j++) {
                        arr.emails.push(firstArray[i].emails[j]);
                    }
                    result.push(arr);
                }
                return result;
            };

            Controller.prototype.copyByEmailArray = function (firstArray) {
                var result = new Array();
                for (var i = 0; i < firstArray.length; i++) {
                    var arr = new Array();
                    arr.email = firstArray[i].email;
                    arr.accounts = [];
                    for (var j = 0; j < firstArray[i].accounts.length; j++) {
                        arr.accounts.push(firstArray[i].accounts[j]);
                    }
                    result.push(arr);
                }
                return result;
            };

            Controller.prototype.InputChange = function (obj) {
                var email = $(obj).val();
                if ($(obj).attr("name") === "addedInput") {
                    $(obj).parent().find("a").css("visibility", "visible");

                    if (email != "" && email != $(obj).attr('placeholder')) {
                        if (Controller.prototype.isValidEmailAddress(email)) {
                            $(obj).parent().parent().parent().find(".addemaildiv").show();
                            $(obj).parent().parent().parent().find(".errorMessage").text("");
                        } else {
                            $(obj).parent().parent().parent().find(".addemaildiv").hide();
                        }
                    }
                } else {
                    if (email === "" || email === $(obj).attr('placeholder')) {
                        $(obj).parent().find("a").css("visibility", "hidden");
                    } else {
                        $(obj).parent().find("a").css("visibility", "visible");
                        if (email != $(obj).attr('placeholder')) {
                            if (Controller.prototype.isValidEmailAddress(email)) {
                                $(obj).parent().parent().parent().find(".addemaildiv").show();
                                $(obj).parent().parent().parent().find(".errorMessage").text("");
                            } else {
                                $(obj).parent().parent().parent().find("#addemaildiv").hide();
                            }
                        } else {
                            $(obj).parent().parent().parent().find("#addemaildiv").hide();
                        }
                    }
                }
            };
            return Controller;
        })();
        Logic.Controller = Controller;
    })(MicrosoftWizardProject.Logic || (MicrosoftWizardProject.Logic = {}));
    var Logic = MicrosoftWizardProject.Logic;
})(MicrosoftWizardProject || (MicrosoftWizardProject = {}));

var MicrosoftWizardProject;
(function (MicrosoftWizardProject) {
    (function (Gui) {
        var Render = (function () {
            function Render(logic) {
                this.logic = logic;
                Render.prototype.logic = logic;
            }
            Render.prototype.Init = function () {
                Render.prototype.adjustHeight($("#heroPage").height());
                var width = $(window).width();
                if ($("body").attr("data-mobileBrowser") === "true") {
                    $("#wizardMiddle,#heroMiddle,#popupMiddle,#loadingMiddle,#welcome,.step").width(width);
                } else {
                    if (width < 896) {
                        $("#wizardMiddle,#heroMiddle,#popupMiddle,#loadingMiddle,#welcome,.step").width(width);
                    } else {
                        $("#wizardMiddle,#heroMiddle,#popupMiddle,#loadingMiddle,#welcome,.step").width(896);
                    }
                }
            };

            Render.prototype.Render = function (wizard) {
                Render.prototype.buildWizard(wizard, function (dataheight) {
                    Render.prototype.adjustHeight(dataheight);
                });
                $("#btnStartHero").click(function () {
                    Render.prototype.logic.ShowWizardAction(Render.prototype.logic.wizard.step[0].id, function (dataheight) {
                        Render.prototype.adjustHeight(dataheight);
                    });
                });
                $(".step").css("left", $("#wizardMiddle").width());
                $("#" + wizard.step[0].id).css("left", "0px");

                Render.prototype.styletweaksForMobile(function (dataheight) {
                    Render.prototype.adjustHeight(dataheight);
                });
                var state = null;
                if (Modernizr.history) {
                    state = window.history.state;
                }

                if (state != null) {
                    Render.prototype.logic.SetCurrentData(state);
                    Render.prototype.logic.ShowWizardState(function (dataheight) {
                        Render.prototype.adjustHeight(dataheight);
                    });
                }
            };

            Render.prototype.buildWizard = function (wizard, callback) {
                if ($(".wizard").length != 0)
                    $(".wizard").remove();

                if (wizard.title != undefined) {
                    if (wizard.herobody != undefined)
                        $("#welcome").append(wizard.herobody.cdatasection);
                    if (wizard.herobutton != undefined)
                        $("#btnStartHero p").text(wizard.herobutton);
                    if (wizard.herotitle != undefined)
                        $("#herotext #t1").text(wizard.herotitle);
                    if (wizard.herointro != undefined)
                        $("#herotext #t2").text(wizard.herointro);
                    $("#wizardTitle").text(wizard.title);
                    $("#WizardSection").append("<div class='wizard'></div>");
                    if (wizard.step != undefined) {
                        Render.prototype.buildFirstStep(wizard, wizard.step[0]);
                        Render.prototype.buildSecondStep(wizard, wizard.step[1]);
                        Render.prototype.buildSelectionStep(wizard, wizard.step[2]);
                        Render.prototype.buildFinalStep(wizard, wizard.step[3]);
                    }
                }
                callback($("#heroPage").height());
            };

            Render.prototype.buildFirstStep = function (wizard, step) {
                $(".wizard").append("<div class='step' id='" + step.id + "' ><div>");
                $("#" + step.id).append("<div id='questiontxt_" + step.id + "' class='questiontxt'><h1>" + step.question.value + "</h1></div>");
                if (step.question.introtext != undefined)
                    $("#" + step.id).append("<div id='introtext_" + step.id + "' class='introtext'>" + step.question.introtext.cdatasection + "</div>");
                if (wizard.account != undefined) {
                    $("#" + step.id).append("<div id='account_" + step.id + "' class='accounts'></div>");
                    for (var j = 0; j < wizard.account.length; j++) {
                        var account = wizard.account[j];
                        $("#account_" + step.id).append("<div id='account_" + account.id + step.id + "' class ='account'></div>");
                        $("#account_" + account.id + step.id).append("<div id='checkdiv_" + account.id + step.id + "' class='checkdiv'  data-account='" + account.id + "' ><input type='checkbox' class='checkbox' id='checkbox_" + account.id + step.id + "' name='" + account.name + "'  data-account='" + account.id + "' /> <input type='button' class ='btncheckbox ' id='btncheckbox_" + account.id + step.id + "'  data-account='" + account.id + "' /> <img class='checkboxicon' id='icon_" + account.id + step.id + "' src='" + account.icon + "' alt='icon" + account.name + "' /><h3 id='label_" + account.name + "' class='checkboxLabel' for='input" + account.name + "' >  " + account.value + "</h3></div>");

                        $("#checkbox_" + account.id + step.id).change(function () {
                            Render.prototype.logic.CheckboxAction(this);
                        });
                        $("#checkdiv_" + account.id + step.id).live("click", function (event) {
                            var target = $(event.target);
                            if (target.is('input:checkbox'))
                                return;
                            var checkbox = $(this).find("input[type='checkbox']");
                            var btncheckbox = $(this).find("input[type='button']");
                            if (checkbox.attr("checked") == "") {
                                checkbox.attr("checked", "true");
                                btncheckbox.addClass('checked');
                            } else {
                                checkbox.attr("checked", "");
                                btncheckbox.removeClass('checked');
                            }
                            Render.prototype.logic.CheckboxAction(this);
                        });
                    }
                }
                $("#" + step.id).append("<div id='btnlayout_" + step.id + "' class='backstaroverbtn' </div>");
                $("#btnlayout_" + step.id).append("<input type='submit' id='nextbtn_" + step.id + "' class='nextbtn  button1' value='" + wizard.nextbutton + "' disabled><input type='submit' id='backbtn_" + step.id + "' class='backbtn  button1' value='" + wizard.backbutton + "'>");
                $("#backbtn_" + step.id).click(function () {
                    Render.prototype.logic.GoBackAction(function (dataheight) {
                        Render.prototype.adjustHeight(dataheight);
                    });
                });
                $("#nextbtn_" + step.id).click(function () {
                    Render.prototype.logic.GoNextAction(this, step.id, function (dataheight) {
                        Render.prototype.adjustHeight(dataheight);
                    });
                });
            };

            Render.prototype.buildSecondStep = function (wizard, step) {
                $(".wizard").append("<div class='step' id='" + step.id + "' ><div>");
                $("#" + step.id).append("<div id='questiontxt_" + step.id + "' class='questiontxt'><h1>" + step.question.value + "</h1></div>");
                if (step.question.introtext != undefined)
                    $("#" + step.id).append("<div id='introtext_" + step.id + "' class='introtext'>" + step.question.introtext.cdatasection + "</div>");

                if (wizard.account != undefined) {
                    $("#" + step.id).append("<form id='account_" + step.id + "' class='accounts'></form>");
                    for (var j = 0; j < wizard.account.length; j++) {
                        var account = wizard.account[j];
                        $("#account_" + step.id).append("<div id='account_" + account.id + step.id + "' class ='accountStep2'></div>");
                        $("#account_" + account.id + step.id).append("<div id='checkdiv_" + account.id + step.id + "' class='checkdiv'> <img id='icon_" + account.id + step.id + "' src='" + account.icon + "' alt='icon" + account.name + "' /><h3 id='label_" + account.name + "' class='checkboxLabel' for='input" + account.name + "' >  " + account.value + "</h3></div>");
                        $("#account_" + account.id + step.id).append("<div id='inputbtn_" + account.id + step.id + "' class='inputbtn'></div>");
                        $("#inputbtn_" + account.id + step.id).append("<div class='emailsdiv' id='emails" + account.id + "'><div class=' clearable divclearable'><input class='inputinside clearable' size='30' style='border-width: 0px; outline: none; ' type = 'text' placeholder = '" + step.placeholder + "'/><a class='clearlink' href='javascript: '></a></div></div>");
                        $("#inputbtn_" + account.id + step.id).append("<div class='addemaildiv' id='addemaildiv" + account.id + "' ><span id='btn_" + account.id + step.id + "' data-account='" + account.id + "' name='btn" + account.name + "' class='addEmailbtn activebtn' >" + step.valuebutton + "</span></div>");
                        $("#inputbtn_" + account.id + step.id).append("<div><p id='error_" + account.id + step.id + "' class='errorMessage'> </p></div>");

                        $("#btn_" + account.id + step.id).click(function () {
                            Render.prototype.logic.AddemailAction(this, function (dataheight) {
                                Render.prototype.adjustHeight(dataheight);
                            });
                        });
                    }
                }
                $("#" + step.id).append("<div id='btnlayout_" + step.id + "' class='backstaroverbtn' </div>");
                $("#btnlayout_" + step.id).append("<input type='submit' id='nextbtn_" + step.id + "' class='nextbtn button1' value='" + wizard.nextbutton + "' ><input type='submit' id='backbtn_" + step.id + "' class='backbtn button1'  value='" + wizard.backbutton + "'><input type='submit' id='startoverbtn_" + step.id + "' class='startoverbtn button1' value='" + wizard.startoverbutton + "'>");
                $("#backbtn_" + step.id).click(function () {
                    Render.prototype.logic.GoBackAction(function (dataheight) {
                        Render.prototype.adjustHeight(dataheight);
                    });
                });
                $("#nextbtn_" + step.id).click(function () {
                    Render.prototype.logic.GoNextAction(this, step.id, function (dataheight) {
                        Render.prototype.adjustHeight(dataheight);
                    });
                });
                $("#startoverbtn_" + step.id).click(function () {
                    Render.prototype.logic.StartOverWizardAction(wizard.step[0].id, function (dataheight) {
                        Render.prototype.adjustHeight(dataheight);
                    });
                });
                for (var i = 0; i < $(".accountStep2 input").length; i++) {
                    $($(".accountStep2 input")[i]).bind("change keyup input focus", function (e) {
                        Render.prototype.logic.InputChange(this);
                    });
                    $($(".accountStep2 a.clearlink")[i]).click(function () {
                        Render.prototype.logic.ClearRemoveEmailAction(this);
                    });
                }
            };

            Render.prototype.buildSelectionStep = function (wizard, step) {
                $(".wizard").append("<div class='step' id='" + step.id + "' ><div>");
                $("#" + step.id).append("<div id='questiontxt_" + step.id + "' class='questiontxt'><h1>" + step.question.value + "</h1></div>");
                if (step.question.introtext != undefined)
                    $("#" + step.id).append("<div id='introtext_" + step.id + "' class='introtext'>" + step.question.introtext.cdatasection + "</div>");

                if (wizard.account != undefined) {
                    $("#" + step.id).append("<div id='account_" + step.id + "' class='accounts'></div>");
                }

                $("#" + step.id).append("<div id='btnlayout_" + step.id + "' class='backstaroverbtn' </div>");
                $("#btnlayout_" + step.id).append("<input type='submit' id='nextbtn_" + step.id + "' class='nextbtn button1' value='" + wizard.nextbutton + "'><input type = 'submit' id = 'backbtn_" + step.id + "' class = 'backbtn button1'  value = '" + wizard.backbutton + "' > <input type='submit' id='startoverbtn_" + step.id + "' class = 'startoverbtn button1' value = '" + wizard.startoverbutton + "' > ");
                $("#backbtn_" + step.id).click(function () {
                    Render.prototype.logic.GoBackAction(function (dataheight) {
                        Render.prototype.adjustHeight(dataheight);
                    });
                });
                $("#nextbtn_" + step.id).click(function () {
                    Render.prototype.logic.GoNextAction(this, step.id, function (dataheight) {
                        Render.prototype.adjustHeight(dataheight);
                    });
                });
                $("#startoverbtn_" + step.id).click(function () {
                    Render.prototype.logic.StartOverWizardAction(wizard.step[0].id, function (dataheight) {
                        Render.prototype.adjustHeight(dataheight);
                    });
                });
            };

            Render.prototype.buildFinalStep = function (wizard, step) {
                $(".wizard").append("<div class='step' id='" + step.id + "' ><div>");
                $("#" + step.id).append("<div id='printPage' onclick='javascript: window.print()' ></div>");

                $("#" + step.id).append("<div id='questiontxt_" + step.id + "' class='questiontxt'><h1>" + step.question.value + "</h1></div>");
                if (step.question.introtext != undefined)
                    $("#" + step.id).append("<div id='introtext_" + step.id + "' class='introDiv'><div id='xboxswitchAccount'></div><div class='introtext resultintro'>" + step.question.introtext.cdatasection + "</div>");

                $("#" + step.id).append("<div id='chosenEmail'></div>");
                $("#" + step.id).append("<div id='instructions'><p id='instructionIntro'>" + step.instructions + "</p></div>");

                if (wizard.account != undefined) {
                    $("#" + step.id).append("<div id='account_" + step.id + "' class='accounts'></div>");
                    for (var j = 0; j < wizard.account.length; j++) {
                        var account = wizard.account[j];
                        $("#account_" + step.id).append("<div id='account_" + account.id + step.id + "' class ='accountStep4' ></div>");
                        $("#account_" + account.id + step.id).append("<div class='titleInstructionsAccount'><h3 id='title_" + account.id + step.id + "'>" + account.value + "</h3></div>");
                        if (account.name === "xbox") {
                            if (account.switchText != undefined)
                                $("#xboxswitchAccount").append("<div class='switchAccount' id='switchAccount" + account.id + step.id + "'>" + account.switchText.cdatasection + "</div>");
                        }
                        $("#account_" + account.id + step.id).append("<div class='instructionsAccount' id='instructionsAccount_" + account.id + step.id + "'>" + account.instructions.cdatasection + "</div>");
                    }
                }

                $("#" + step.id).append("<div id='btnlayout_" + step.id + "' class='backstaroverbtn' </div>");
                $("#btnlayout_" + step.id).append("<input type = 'submit' id = 'backbtn_" + step.id + "' class = 'backbtn button1'  value = '" + wizard.backbutton + "' > <input type='submit' id='startoverbtn_" + step.id + "' class = 'startoverbtn button1' value = '" + wizard.startoverbutton + "' > ");
                $("#backbtn_" + step.id).click(function () {
                    Render.prototype.logic.GoBackAction(function (dataheight) {
                        Render.prototype.adjustHeight(dataheight);
                    });
                });
                $("#startoverbtn_" + step.id).click(function () {
                    Render.prototype.logic.StartOverWizardAction(wizard.step[0].id, function (dataheight) {
                        Render.prototype.adjustHeight(dataheight);
                    });
                });
            };

            Render.prototype.styletweaksForMobile = function (callback) {
                if ($("body").attr("data-mobileBrowser") === "true") {
                    $("body").css("margin", "0px");
                    $("body").css("margin-top", "10px");
                    $("#header").css("margin-left", "10px");
                    $("#herotext #t2").css("margin-top", "160px");
                    $("#herotext #t1").css("margin-top", "8px");
                    $("#herotext #t1").css("font-size", "32px");
                    $("#herotext #t2").css("font-size", "18px");
                    $("#herotext #t2, #herotext #t1").css("line-height", "24px");
                    $("#herotext #t1, #herotext #t2").css("width", "90%");
                    $("#heroMiddle #more, #btnStartHero h2").css("font-size", "22px");
                    $("#heroImage").css("background-image", "url(http://cmspreviewresources.windowsphone.com/windowsphone/en-us/cmpn/MSID-Wizard/V2/assets/intro.accounts300.png)");
                    $("#heroImage").css("width", "100%");
                    $("#heroImage").css("height", "205px");
                    $("#heroImage").css("margin-top", "40px");
                    $("#btnStartHero h2").css("margin-top", "0px");
                    $("#btnStartHero h2").css("position", "relative");
                    $("#btnStartHero img").css("position", "relative");
                    $("#btnStartHero").css("margin-bottom", "0px");
                    $("#btnStartHero, .addemaildiv").css("width", "150px");
                    $("#herotext").css("width", "100%");
                    $(".iconstart").css("margin-top", "20px");
                    $("#disclaimer").hide();
                    $(".step h1,.step h2, .step h3,#welcome h2, #welcome h1").css("font-size", "24px");
                    $(".step .introtext, .step .result,.step .result p, .step .result a, ol, li, li a, .instructionsAccount ol li, .step p, #welcome p, #welcome").css("font-size", "18px");
                    $(".step .questiontxt, .step .introtext, .step .accounts, .questiontxt, .errorMessage,.startoverbtn").css("margin-left", "10px");
                    $(".step .questiontxt, .step .introtext, .step .accounts,.nextbtn, .startoverbtn, .backbtn").css("margin-right", "10px");
                    $(".inputbtn, .errorMessage").css("width", "100%");
                    $(".inputbtn").css("clear", "both");
                    $(".inputbtn").css("margin-left", "35px");
                    $(".addemaildiv").css("margin-left", "5px");
                    $(".addemaildiv").css("margin-top", "0px");
                    $(".addemaildiv").css("font-size", "16px");
                    $(".accountStep3, .accountStep2").css("margin-bottom", "35px");
                    $(".startoverbtn").css("float", "right");
                    $("#printPage").hide();
                    $(".accountStep2 .checkdiv, .checkdiv").css("width", "100%");
                    $(".checkdiv img").css("margin-top", "6px");
                    $(".btncheckbox").css("margin-top", "10px");
                }
                callback($("#heroPage").height());
            };

            Render.prototype.adjustHeight = function (newheight) {
                $("#landingPage").height(newheight);
                var mainheight = $(window).height() - $("#header").height() - $("#footer").height() - 47;

                if ($("#main").height() < newheight || newheight > mainheight) {
                    $("#main").height(newheight);
                } else {
                    $("#main").height(mainheight);
                }
            };

            Render.prototype.WindowsResize = function () {
                var winWidth = $(window).width(), winHeight = $(window).height();
                $(window).resize(function () {
                    var width = $(this).width();

                    //New height and width
                    var winNewWidth = $(window).width(), winNewHeight = $(window).height();

                    if (winWidth != winNewWidth || winHeight != winNewHeight) {
                        if ($("body").attr("data-mobileBrowser") === "true") {
                            $("#wizardMiddle,#heroMiddle,#popupMiddle,#loadingMiddle,#welcome,.step, .backstaroverbtn").width(width);
                        } else {
                            if (width < 896) {
                                $("#wizardMiddle,#heroMiddle,#popupMiddle,#loadingMiddle,#welcome,.step, .backstaroverbtn").width(width);
                            } else {
                                $("#wizardMiddle,#heroMiddle,#popupMiddle,#loadingMiddle,#welcome,.step, .backstaroverbtn").width(896);
                            }
                        }

                        var stepcollection = $(".step");
                        var stepwidth = $(".step").width();
                        for (var i = 0; i < stepcollection.length; i++) {
                            var id = stepcollection[i].id;
                            var left = $("#" + id).css("left");
                            if (left != "0px") {
                                var signe = left.substring(0, 1);
                                if (signe != "-") {
                                    $("#" + id).css("left", stepwidth + "px");
                                } else {
                                    $("#" + id).css("left", signe + stepwidth + "px");
                                }
                            }
                        }

                        var currentstep = $(".step").filter(function () {
                            if ($(this).css("left") === "0px")
                                return $(this);
                        });

                        if ($("#wizardPage").css("top") != "0px") {
                            if (currentstep.length != 0) {
                                $("#wizardPage,#WizardSection").height(currentstep.height());
                                Render.prototype.adjustHeight(currentstep.height());
                                $("#heroPage").css("top", "-" + $("#heroPage").height() + "px");
                                $("#wizardPage").css("top", "-" + $("#heroPage").height() + "px");
                            }
                        } else {
                            if ($("#heroPage").height() != $("#landingPage").height()) {
                                Render.prototype.adjustHeight($("#heroPage").height());
                            }
                        }
                    }

                    //Update the width and height
                    winWidth = winNewWidth;
                    winHeight = winNewHeight;
                });
            };
            return Render;
        })();
        Gui.Render = Render;
    })(MicrosoftWizardProject.Gui || (MicrosoftWizardProject.Gui = {}));
    var Gui = MicrosoftWizardProject.Gui;
})(MicrosoftWizardProject || (MicrosoftWizardProject = {}));
//# sourceMappingURL=IDwizard.js.map

/// <reference path = "/html/js/jquery-1.8.2.intellisense.js"/>
/// <reference path = "/html/js/knockout-2.2.0.debug.js"/>

///// Object classes


var Car = function (rcnum, rcdate, rcurl, man, cd, summary, pua, cs, notes, rs) {
    this.recallNumber = rcnum;
    this.recallDate = rcdate;
    this.recallURL = rcurl;
    this.manufacturer = man;
    this.componentDescription = cd;
    this.defectSummary = summary;
    this.unitsAffected = pua;
    this.consequenceSummary = cs;
    this.notes = notes;
    this.recallSubject = rs;
}

var carsVM = {
    cars: []
}

var stackpage = function (pageId, pageTitle) {
    this.pageId = pageId;
    this.pageTitle = pageTitle
}

var _backstack = {stackpages:[]}

$(document).ready(function () {
    //showStates();
    showCars(null, "recent recalls");
    $('#searcherror').click(function () {
        $('#searcherror').hide();
    });
});

function newCars() {
    var vmlen = carsVM.cars.length;
    carsVM.cars.splice(0, carsVM.cars.length);
}


function setClick() {
    $('[data-clicktype]').unbind('click');
    $('[data-clicktype]').click(function () {
        itemClick($(this));
        event.preventDefault();
    });
}


function showAbout() {
    pageNav(new stackpage("#about-page", "about"));
}


function showCars(query, pagename) {
    waitOn();
    var element = $("#cars-list");
    ko.cleanNode(element);
    newCars();
    var url = "http://api.usa.gov/recalls/search.json?sort=date&organization=nhtsa";
    if (query != null && query != 'recent')
        url = url + "&query=" + query;
    $.getJSON(url)
        .done(function (json) {
            $.each(json, function () {
                if (this.results.length != 0) {
                    $.each(this.results, function (i, data) {
                        carsVM.cars.push(new Car(
                            this.recall_number,
                            this.recall_date,
                            this.recall_url,
                            this.manufacturer,
                            this.component_description,
                            this.defect_summary,
                            this.potential_units_affected,
                            this.consequence_summary,
                            this.notes,
                            this.recall_subject
                            ));
                    });
                }
                else
                    showSearchError("There were no results from this search. Please try another search. To search for recent recalls use 'recent' as the search term.");
            })
                       
            ko.applyBindings(carsVM, document.getElementById("cars-list"));
            setClick();
            if (query != null)
                _backstack.stackpages = [];
            pageNav(new stackpage("#cars-list", pagename));
            waitOff();
        })
        .fail(function () {
            waitOff(); 
            pageNav(new stackpage("#neterror-page", "oops!"))
        });
}


function showCar(rnum) {
    waitOn();
    ko.cleanNode(document.getElementById("car-page"));
    var selectedCar = carsVM.cars.filter(function (car) { return car.recallNumber == rnum });
    var viewModel = {
        car: [selectedCar[0]]
    };
    ko.applyBindings(viewModel, document.getElementById("car-page"));
    pageNav(new stackpage("#car-page", selectedCar[0].componentDescription.toString().toLowerCase()));
    waitOff();
}

function showPage(pageId, pageTitle, fdirection) {
    fdirection = typeof fdirection !== 'undefined' ? fdirection : "right";
    $('html, body').animate({ scrollTop: 0 }, 0);
    $('*[data-role="page"]').hide();
    $("#page-title").html(pageTitle);
    $(pageId).show("slide", { direction: fdirection, easing: 'easeOutQuint' }, 1000);
}

function itemClick(obj) {
    
    if ($(obj).data('clicktype') == "car") {
        showCar($(obj).data('rnum'));
    }
}

function waitOn() {
    $('#wp-waiting').show();
}

function waitOff() {
    $('#wp-waiting').hide();
}

function pageNav(spage) {
    waitOff();
    if (spage != "null") {
        _backstack.stackpages.push(spage);
        showPage(spage.pageId, spage.pageTitle);
    }
    else {
        _backstack.stackpages.pop();
        var ln = _backstack.stackpages.length - 1;
        var pg = _backstack.stackpages[ln];
        
        //reset car list if going back to select a new car
        //if (pg.pageId == "#state-list")
        //    newHospitals();
        showPage(pg.pageId, pg.pageTitle, "left");
    }

    if (_backstack.stackpages.length-1 == 0) {
        try {
            AndroidFunction.backstackoff();
        }
        catch (err) {
            window.external.notify("backstackoff");
        }
    }
    else
        try {
            AndroidFunction.backstackon();
        }
        catch (err) {
            window.external.notify("backstackon");
        }
}

function showSearch() {
    $('#searchbox').toggle("slide", { direction: 'up'}, 600);
}

function dosearch() {
    var query = $('#search-text').val();
    if (query != '') {
        showSearch();
        var pagename = "search: " + query;
        $('#searcherror').hide();
        showCars(query, pagename);
    }
    else {
        showSearchError("You didn't enter any search terms. Please enter a query and try again.");

    }
    $('#search-text').val('');
    return false;
}

function showSearchError(message) {
    $('#searchErrorMsg').text(message);
    $('#searcherror').show();
}
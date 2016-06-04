
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

var pacienti = [];

var gotInfo = 0;

var currentPatientBP = [];
var currentPatientW = [];
var currentPatientH = [];
var currentPatientExamDate = [];

var pacientiName      = ["Zdravka", "Marija", "Tija"];
var pacientiSurname   = ["Dren", "Novak", "Suhe"];
var pacientiBirthDate = ["1988-12-09T00:00:00.000Z", "1978-02-12T00:00:00.000Z", "1990-04-02T00:00:00.000Z"];
var pacientiGender    = ["FEMALE", "FEMALE", "FEMALE"];

var pacientiHeight    = ["169", "165", "174"];

var pacientiWeights    = [
	["67", "67", "68", "66", "67", "68", "67", "66"], 
	["72", "70", "71", "71", "71", "72"], 
	["50", "49", "50", "50", "49", "48", "48", "48", "47", "46"]
	];

var pacientiSystolicPressure = [
        ["110", "118", "109", "111", "110", "114", "113", "112"],
        ["112", "116", "126", "110", "114", "130"],
        ["101", "99", "103", "96", "112", "102", "93", "100", "111", "104"]
    ];

var pacientiDiastolicPressure = [
        ["60", "72", "59", "60", "73", "73", "79", "73"],
        ["62", "68", "84", "70", "64", "70"],
        ["51", "59", "57", "66", "62", "62", "73", "71", "81", "64"]
    ];
    
var pacientiExamDate = [
		["2016-01-04T12:47:00.000Z", "2016-01-19T15:05:00.000Z", "2016-01-17T10:52:00.000Z", "2016-02-02T12:21:00.000Z", "2016-02-04T16:00:00.000Z", "2016-02-19T11:12:00.000Z", "2016-03-01T11:47:00.000Z", "2016-03-04T14:00:00.000Z"],
		["2015-06-04T12:47:00.000Z", "2015-08-19T13:05:00.000Z", "2016-01-14T10:12:00.000Z", "2016-04-02T14:42:00.000Z", "2016-05-12T12:00:00.000Z", "2016-06-04T11:12:00.000Z"],
		["2015-10-04T12:00:00.000Z", "2015-10-12T11:17:00.000Z", "2015-12-07T10:00:00.000Z", "2015-12-22T9:39:00.000Z", "2016-01-29T14:12:00.000Z", "2016-02-02T11:13:00.000Z", "2016-03-11T11:59:00.000Z", "2016-03-25T17:15:00.000Z", "2016-04-04T12:00:00.000Z", "2016-05-07T11:28:00.000Z"]
	];
	
var pacientiOximetry = [
		[97, 100, 100, 96, 97, 96, 100, 99],
		[97, 92, 97, 100, 97, 100],
		[87, 92, 97, 96, 97, 96, 98, 99, 98, 99]
	];
	
var pacientiCommitter = ["Tina Maze", "Damjan Murko", "Rok Kosmac"];


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
function generirajPodatke(stPacienta) {
  var ehrId = "";

    ehrId = kreirajEHR(stPacienta);

  return ehrId;
}

function generirajPodatkePacientov(){
    for(var i = 0; i < 3; i++)
        generirajPodatke(i);
    //skrije background
    Cookies.set("Session", "generirano");
    $("#background").hide();
    setTimeout(function(){
        $("#message").html("");
    }, 4000)
}

$(document).ready(function() {
    var sess = Cookies.get('Session');
    $("#examDate").hide();
    if(sess && sess != "generirano"){
        $("#background").hide();
        $("#examDate").show();
        var pat = JSON.parse(Cookies.get("EHR"));
        pacienti.push(pat);
        $("#selectorPatient").html($("#selectorPatient")[0].innerHTML + '<option value="'+pat.partyAdditionalInfo[0].value+'">' + pat.firstNames + ' ' + pat.lastNames + '</option>');
        console.log(pacienti);
    }
    
    $("#EhrInput").keyup(function(event) {
        if (event.keyCode == 13) {
            var pacient = preberiEHR($("#EhrInput").val());
         }
    });
    
    $("#logout").click(function(event) {
        pacienti = [];
        Cookies.remove("Session");
        location.reload();
    });
    
    $("#selectorPatient").change(function () {
    	if($("#selectorPatient").val() != null){
	    	$("#examDate").show();
	    	var ehrId = $("#selectorPatient").val();
		    //console.log(ehrId);
		    currentPatientBP = [];
		    currentPatientH = [];
		    currentPatientW = [];
		    currentPatientExamDate = [];
		    gotInfo = 0;
		    $("#examDate").html("<tr><th>Examination Date</th></tr>");
		    preberiKrvniTlak(ehrId);
		    preberiTezo(ehrId);
		    preberiVisino(ehrId);
    	}
	  })
	  .change();
    
});


function preberiEHR(ehrId) {
	var sessionId = getSessionId();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#message").html("<span class='obvestilo label label-warning " +
      "fade-in'>Prosim vnesite veljaven Ehr-ID!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
	    	    $("#message").html("");
	    	    var party = data.party;
	    	    if(party.gender && party.gender == "FEMALE"){
		    	    Cookies.set("Session", "vneseno");
		    	    $("#background").hide();
					$("#examDate").show();
					pacienti.push(party);
					Cookies.set("EHR",party);
					console.log(Cookies.get("EHR"));
			        $("#selectorPatient").html($("#selectorPatient")[0].innerHTML + '<option value="'+party.partyAdditionalInfo[0].value+'">' + party.firstNames + ' ' + party.lastNames + '</option>');
			        $('#selectorPatient').prop('selectedIndex', 0);
					return party;
	    	    } else {
	    	    	$("#message").html("<span class='obvestilo label " +
		          "label-danger fade-in'>Napaka '" +
		          "Vnešena oseba ni ženskega spola" + "'!");
		          return party;
	    	    }
			},
			error: function(err) {
				$("#message").html("<span class='obvestilo label " +
          "label-danger fade-in'>Napaka '" +
          JSON.parse(err.responseText).userMessage + "'!");
			}
		});
	}
}


function kreirajData(stPacienta, ehrId, i){
    if(i >= pacientiExamDate[stPacienta].length)
    	return;
    var sessionId = getSessionId();
	
	//console.log(stPacienta+ " "+ pacientiExamDate[stPacienta].length);
	//for(var i = 0; i < pacientiExamDate[stPacienta].length; i++){
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": pacientiExamDate[stPacienta][i],
		    "vital_signs/height_length/any_event/body_height_length": pacientiHeight[stPacienta],
		    "vital_signs/body_weight/any_event/body_weight": pacientiWeights[stPacienta][i],
		    "vital_signs/blood_pressure/any_event/systolic": pacientiSystolicPressure[stPacienta][i],
		    "vital_signs/blood_pressure/any_event/diastolic": pacientiDiastolicPressure[stPacienta][i],
		    "vital_signs/indirect_oximetry:0/spo2|numerator": pacientiOximetry[stPacienta][i]
		};
	
		var parametriZahteve = {
		    ehrId: ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: pacientiCommitter[stPacienta]
		};
	
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		    	i++;
		    	kreirajData(stPacienta, ehrId, i);
		    },
		    error: function(err) {
		    	console.log(err);
		    	$("#message").html(
            "<span class='obvestilo label label-danger fade-in'>Napaka '" +
            JSON.parse(err.responseText).userMessage + "'!");
		    }
		});
	//}
}

function kreirajEHR(stPacienta) {
	var sessionId = getSessionId();
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: pacientiName[stPacienta],
		            lastNames: pacientiSurname[stPacienta],
		            gender: pacientiGender[stPacienta],
		            dateOfBirth: pacientiBirthDate[stPacienta],
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    $("#message").html($("#message")[0].innerHTML + "<span class='obvestilo " +
                          "label label-success fade-in'>Uspešno kreiran EHR '" +
                          ehrId + "'.</span>");
							
		                    pacienti.push(partyData);
		                    //console.log(partyData);
		                    $("#selectorPatient").html($("#selectorPatient")[0].innerHTML + '<option value="'+partyData.partyAdditionalInfo[0].value+'">' + partyData.firstNames + ' ' + partyData.lastNames + '</option>');
		                    $('#selectorPatient').prop('selectedIndex', -1);
		                    kreirajData(stPacienta, ehrId, 0);
		                    return ehrId;
		                }
		            },
		            error: function(err) {
		            	$("#message").html("<span class='obvestilo label " +
                    "label-danger fade-in'>Napaka '" +
                    JSON.parse(err.responseText).userMessage + "'!");
                    return null;
		            }
		        });
		    }
		});
	
}

function preberiKrvniTlak(ehrId) {
	var sessionId = getSessionId();

	$.ajax({
	    url: baseUrl + "/view/" + ehrId + "/blood_pressure",
	    type: 'GET',
	    headers: {
	        "Ehr-Session": sessionId
	    },
	    success: function (res) {
	    	//console.log(res);
	        res.forEach(function (el, i, arr) {
	            var date = new Date(el.time);
	            el.date = date;
	            //ce slucajno niso vse meritve prisotne na vsakem examu
	            if($.inArray( el.time, currentPatientExamDate) == -1){
	            	currentPatientExamDate.push(el.time);
	            }
	        });
			currentPatientBP = res;
			gotInfo++;
			fillTable();
	    }
	});
}

function preberiTezo(ehrId) {
	var sessionId = getSessionId();

	$.ajax({
	    url: baseUrl + "/view/" + ehrId + "/weight",
	    type: 'GET',
	    headers: {
	        "Ehr-Session": sessionId
	    },
	    success: function (res) {
	    	//console.log(res);
	        res.forEach(function (el, i, arr) {
	            var date = new Date(el.time);
	            el.date = date;
	            if($.inArray( el.time, currentPatientExamDate ) == -1){
	            	currentPatientExamDate.push(el.time);
	            }
	        });
			currentPatientW = res;
			gotInfo++;
			fillTable();
	    }
	});
}

function preberiVisino(ehrId) {
	var sessionId = getSessionId();

	$.ajax({
	    url: baseUrl + "/view/" + ehrId + "/height",
	    type: 'GET',
	    headers: {
	        "Ehr-Session": sessionId
	    },
	    success: function (res) {
	    	//console.log(res);
	        res.forEach(function (el, i, arr) {
	            var date = new Date(el.time);
	            el.date = date;
	            if($.inArray( el.time, currentPatientExamDate ) == -1){
	            	currentPatientExamDate.push(el.time);
	            }
	        });
			currentPatientH = res;
			gotInfo++;
			fillTable();
	    }
	});
}

function fillTable(){
	if(gotInfo != 3)
		return;
	else {
	//sortiranje datumov
	currentPatientExamDate.sort(SortDates);
	currentPatientExamDate.forEach(function (el, i, arr) {
        var date = new Date(el);
        $("#examDate").append('<tr><td>'+date.toLocaleDateString()+'</td></tr>');
    });
	}
}

function SortDates(a, b){
  return ((a < b) ? -1 : ((a > b) ? 1 : 0));
}
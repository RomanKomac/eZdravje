
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

var pacienti = [];

var pacientiName      = ["Zdravka", "Marija", "Tija"];
var pacientiSurname   = ["Dren", "Novak", "Suhe"];
var pacientiBirthDate = ["1988-12-09T00:00:00.000Z", "1978-02-12T00:00:00.000Z", "1990-04-02T00:00:00.000Z"];
var pacientiWeight    = ["67", "72", "50"];
var pacientiHeight    = ["169", "165", "174"];
var pacientiSistolycPressure = [
        
        
    ];

var pacientiDiastolycPressure = [
        
        
    ];


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
            //kreirajData(stPacienta);


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
    if(sess && sess != "generirano"){
        $("#background").hide();
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
	    	    Cookies.set("Session", "vneseno");
	    	    $("#background").hide();
				var party = data.party;
				pacienti.push(party);
				console.log(party);
				return party;
			},
			error: function(err) {
				$("#message").html("<span class='obvestilo label " +
          "label-danger fade-in'>Napaka '" +
          JSON.parse(err.responseText).userMessage + "'!");
			}
		});
	}
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
		                    $("#message").html($("#message")[0].innerHTML+"<span class='obvestilo " +
                          "label label-success fade-in'>Uspešno kreiran EHR '" +
                          ehrId + "'.</span>");
		                    //$("#preberiEHRid").val(ehrId);
		                    pacienti.push(partyData);
		                    console.log(partyData)
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
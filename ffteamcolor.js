var teamList_4cc = ["papika","cocona","yayaka","tt392","salt","hidaka","sayuri","toto","yuyu","nyunyu","mimi","iroha","welwitschia","occhan","granny","grandwizard"];


function setTeamList(listOfTeams){
	var selector = $('#teamcolor');
	selector.html('<option value="">Chat Icon</option>');
	listOfTeams.forEach(function(team){
		selector.append('<option value="' + team + '">/' + team + '/</option>');
	});
};

$('#chatwrap').append("<span><select id='teamcolor' style='cursor:default;padding:6px 10px' class='btn btn-sm btn-default'><option value=''>Chat Icon</option></select></span>");
var TEAMCOLOR = getOrDefault(CHANNEL.name + "_TEAMCOLOR", '');
setTeamList(teamList_4cc);
if (TEAMCOLOR){
	$('#teamcolor').val(TEAMCOLOR);
}
$('#teamcolor').change(function(){
	TEAMCOLOR = $(this).val();
	setOpt(CHANNEL.name + "_TEAMCOLOR", TEAMCOLOR);
});


//Format messages upon page load because they're handled differently and I can't find the function
document.getElementById("messagebuffer").childNodes.forEach(function(chatmessage){
//	if (chatmessage.childElementCount == 2) {
	  chatmessage.innerHTML = chatmessage.innerHTML.replace(/Ð.+Ð/,"");
//	} 
});

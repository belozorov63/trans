$(document).ready(function() {

	
	$(".sidebar").animate({width: "60px"},1);
	$(".sidebar").animate({width : "0px"},1000);

	var wSidebar = $(".sidebar").css("width").toString();

	$("#btnMenu").click( function () {

	$(".sidebar").stop(true);

    	if ($("#btnMenu").hasClass("active"))
		{
			$(".sidebar").animate({width : "60px"},200,"swing");

			$("#btnMenu").removeClass("active");
		}
		else 
		{

			$(".sidebar").animate({width : wSidebar},200,"swing");

			$("#btnMenu").addClass("active");
		}

	});

	$("#btnMenu").hover(

	function(e) {

		$(".sidebar").stop(true);

		if(!$("#btnMenu").hasClass("active"))
		{
			$(".sidebar").animate({width : "60px"},200,"swing");
		}
	},
	function(e) {
		if(!$("#btnMenu").hasClass("active"))
		{
			$(".sidebar").stop(true);
			$(".sidebar").animate({width : "0px"},200,"swing");
		}	
	});


	$(".sidebar").mouseover(function(e) {
		$("#btnMenu").addClass("active");
		$(".sidebar").stop(true);
        	$(".sidebar").animate({width : wSidebar},300,"swing");
    	});

	$(".sidebar").mouseout(function(e) {

        if($("#btnMenu").hasClass("active")) {
			$(".sidebar").stop(true);	
			$(".sidebar").animate({width : "0px"},200,"swing");

			$("#btnMenu").removeClass("active");

		}

    });

	

});



function inWindow(s){

  var scrollTop = $(window).scrollTop();

  var windowHeight = $(window).height();

  var currentEls = $(s);

  var result = [];

  currentEls.each(function(){

    var el = $(this);

    var offset = el.offset();

    if(scrollTop <= offset.top && (el.height() + offset.top) < (scrollTop + windowHeight))

      result.push(this);

  });

  return $(result);

}

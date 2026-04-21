var space = {};
space.ajaxfunc = function (url, param, type, callback) {

	$.ajax(
		{
			url: url,
			type: type,
			data: param,
			dataType: "json",
			beforeSend: function () { },
			cache: false,
			success: function (data) {
				callback(data);

			}

		})


}
var showdialog = function (id) {
	var $id = $("#" + id);

	$id.bPopup({
		/*        speed: 650,
				transition: 'slideIn',
				transitionClose: 'slideBack'*/
		fadeSpeed: 'fast', //can be a string ('slow'/'fast') or int
		followSpeed: 'fast', //can be a string ('slow'/'fast') or int
		modalColor: 'black'
	});
	$id.find(".close").unbind("click").click(function () {
		$id.bPopup().close();
	});


}
window.adobeDataLayer = window.adobeDataLayer || [];
let activeList = []

function getFileds(surl, param) {
	space.ajaxfunc(surl, param, "get", function (data) {
		var sdata = data.result;
		activeList = data.result
		if (data.code == 200) {
			var sdata1 = [];
			//$(".no_result").css("display", "none");
			//$(".result").css("display", "block");

			$.each(sdata, function (index, item) {

				if (
					item["activityId"] !== "448c368e-0fa8-4457-9d93-f7f990c672c5" 
					&& item["activityId"] !== "ffe274e4-80a3-40fc-b471-7f168f6fa99c"
					&& item["activityId"] !== "8fedd4d8-6e89-4694-9c0a-d26adf5f5061"
					&& item["activityId"] !== "030e781b-b57b-4c78-94f1-00e615aa928d"
					&& item["activityId"] !== "1d7ebbdc-0a9d-4e17-a4d6-73464d8e9117"
				) {


				item["leftNum"] = parseInt(item["maxNum"]) - parseInt(item["appliedNum"]);
				var date = item["startTime"].substring(0, 10)
				var startTime = item["startTime"].substring(11, 16);
				var endTime = item["endTime"].substring(11, 16);
				item["times"] = date + " " + startTime + " - " + endTime;
				var idArrengement = item["activityId"];
				var status = item['status'];
				if (status == 0) {
					item.clcs = "<a><img src=\"/content/dam/sonystyle/smallapp/dealerweb/images/new/lecture/jqqd.png\"></a>";

				}
				if (status == 1) {
					item.clcs = "<a href=\"javascript:void(0);\" onclick=\"aplly('" + idArrengement + "')\" ><img src=\"/content/dam/sonystyle/smallapp/dealerweb/images/new/lecture/wybm2.png\"></a>";

				}
				if (status == 2) {
					item.clcs = "<a><img src=\"/content/dam/sonystyle/smallapp/dealerweb/images/new/lecture/bmym2.png\"></a>";

				}
				if (status == 3) {
					item.clcs = "";

				}
				item.clcs += `<a style="margin-left: 0.1rem;" href="/smallapp/acafe/lectures/detail.htm?acid=${item["activityId"]}" target="_blank" title="褰卞儚璇惧爞"><img src='/content/dam/sonystyle/smallapp/dealerweb/images/new/lecture/ckxq2.png' alt="icon"></a>`


				var activityPics = item['activityPics'];
				for (var i = 0; i < activityPics.length; i++) {
					if (activityPics[i].picType == "灏侀潰鍥�") {
						item["iconPath"] = activityPics[i].picUrl;

					}

				}

				sdata1.push(item);


				}

			})


			$(".loading").hide();


			if(sdata1.length > 0 ){
				
				
				var result = $.ltmpl("xlecture", sdata1);
				$("#off_lectures").html(result);

			}else{
				$(".no_result").css("display", "none");
				$(".result").css("display", "block");


			}


			

		} else {
			$(".lecture_ms").hide();
			$(".loading").hide();
			$(".no_result").css("display", "block");


		}


	})







}
function getresult(surl, param) {
	$(".loading").show();
	$("#off_lectures").html("");
	$(".no_result").css("display", "none");
	getFileds(surl, param);
}



var slinks = "https://www.sonystyle.com.cn/ssoapps/retailer_activity/dealer/shopActivitys";
var parames = {};
parames["shopId"] = storeId;
parames["conceal"] = 0;
// 涓氬姟瑕佹眰锛氬鏋滄槸鑻忓窞搴楋紝璇锋眰璇剧▼浣跨敤姝� id
if(storeId === '7cf912ff839a4c0a9cddedfe2aff7b41') {
	parames["shopId"] = 'd375d154eb7b4115880e2263f012526a';
}

var sendOpenIds = function () {

	$.ajax(

		{
			url: "https://www.sonystyle.com.cn/retailer_activity/registration/shareOpen?wechatOpen=" + localStorage.getItem("openId"),
			type: "post",
			contentType: "application/json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("access_token"));
			},
			dataType: "json",
			cache: false,
			success: function (data) {

			}
		})





}




var sumitR = function (id) {


	$.ajax(

		{
			url: "https://www.sonystyle.com.cn/retailer_activity/registration/activityRegistration?activityId=" + id,
			type: "get",
			contentType: "application/json",
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("access_token"));
			},
			dataType: "json",
			cache: false,
			success: function (data) {
				if (data.returnCode == '200') {
					var rs = data.returnData;

					var stattime = rs.activityStartTime.substring(0, 10);
					var stattime1 = rs.activityStartTime.substring(10, 16);
					var endtimes = rs.activityEndTime.substring(10, 16);
					$(".yhm").html(rs.nickname);
					$(".stmobile").html(rs.phone);
					$(".email").html(rs.email);
					$(".tname").html(rs.name);
					$(".bm_title").html(rs.activityName);
					$(".bm_space").html(rs.activityAddress);
					$(".bm_time").html(stattime + ":" + stattime1 + "~" + endtimes);


					$(".gerenxinxi").hide();
					$(".bmcg").show();

					sendOpenIds();


					getresult(slinks, parames);






				} else if (data.returnCode == '903') {
					alert(data.message);

				} else {

					var whref = window.location.href;
					localStorage.setItem("backurl", whref);
					window.location.href = "https://www.sonystyle.com.cn/content/dam/sonystyle-club/index.html#/login";


				}


			}
		})





}





var aplly = function (id) {
	if(activeList.length){
		for (let i = 0; i < activeList.length; i++) {
				const element = activeList[i];
				if(id == element.activityId){
					adobeDataLayer.push({
						event:'retailer_activity_register',	//鍥哄畾鍊�
						eventInfo:{
							activityName: element.activityName,	
							activityType: element.activityName,
							pageType:'dealerPage'
						}
					})
				}
			}
		}
	var idArrage528 = id;
	$(".correctinfo").data('id', id);
	setTimeout(function () {
		$(".gerenxinxi").show();
		$(".bmcg").hide();
		$.ajax(

			{
				url: "https://www.sonystyle.com.cn/retailer_activity/registration/ifRegistered?activityId=" + id,
				// url:"json/get.json",
				type: "get",
				contentType: "application/json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("access_token"));
				},
				dataType: "json",
				cache: false,
				success: function (data) {
					if (data.returnCode == '200') {
						var rs = data.returnData;


						$(".yhm").html(rs.nickname);
						$(".stmobile").html(rs.phone);
						$(".email").html(rs.email);
						$(".tname").html(rs.name);



						showdialog("success");


					} else if (data.returnCode == '903') {
						var mess = data.message;
						$(".error_mess").html(mess);
						showdialog("ybaomingl");

					} else {
						var whref = window.location.href;
						localStorage.setItem("backurl", whref);
						window.location.href = "https://www.sonystyle.com.cn/content/dam/sonystyle-club/index.html#/login";




					}



				}
			})

	}, 400)






}



$(".correctinfo").unbind("click").click(function () {

	var id = $(this).data('id');
	sumitR(id);




})
$(function () {

	getresult(slinks, parames);

})













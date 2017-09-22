var date = $("#date");
var now = $("#startNow");
var dataAll= $("#dataAll");
var dataType =  $(".dataType")
var period=$("#period");
var periodic=$("#periodic");

periodic.change(function(){
    if(!this.checked){
        period.hide();
    }
    else{
        period.show();
    }
});

now.change(function(){
    if(this.checked){
        date.hide();
    }
    else{
        date.show();
    }
});

dataAll.change(function(){
    if(dataAll.is(":checked")){
        var dataType = document.querySelectorAll(".dataType");
        for(var i=0;i<dataType.length;i++){
            dataType[i].disabled=true;
        }
    }
    else{
        var dataType = document.querySelectorAll(".dataType");
        for(var i=0;i<dataType.length;i++){
            dataType[i].disabled=false;
        }
    }
});

var dayOptions=$(".days")
var Weekdays=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
var today=new Date();
today=today.getDay();
for(var i=0;i<7;i++){
    dayOptions[i].innerText=Weekdays[(i+today)%7];
}
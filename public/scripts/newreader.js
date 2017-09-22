var date = $("#date");
var now = $("#startNow");

console.log(date)
now.change(function(){
    if(this.checked){
        date.slideUp();
    }
    else{
        date.slideDown();
    }
})
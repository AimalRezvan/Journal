// const { response } = require("express");

deleteItem = document.getElementById("deleteItem");

if (deleteItem){
    deleteItem.addEventListener("click", function(){
        response = window.confirm("Are you sure to delete this topic?");
        if (response){
            window.location.assign("/delete/"+window.location.pathname.substring(1, ));
        }
    });
}

if (document.getElementsByClassName("direction-button")){
    elements = document.getElementsByClassName("direction-button");
    for (element of elements){
        directionEvent(element);
    }
}

let textArea = document.getElementsByName("content")[0];


function directionEvent(element){
    element.addEventListener("click", function(e){
        console.log(textArea);
        if (e.target.innerText == "|>"){
            textArea.dir="ltr";
        }else{
            textArea.dir = "rtl";
        }
    })
}

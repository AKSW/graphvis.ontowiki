$(document).ready(function(){
    $("#treeToggle").click(function(){
        $("#chart").empty();
        destroyGraph();
        createTree();
    });
    $("#graphToggle").click(function(){
        $("#chart").empty();
        destroyTree();
        createGraph();
    });

    createGraph();
});

function stringToColor(str){
    return intToARGB(hashCode(str));
}

function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function intToARGB(i){
    return ((i>>24)&0xFF).toString(16) +
           ((i>>16)&0xFF).toString(16) +
           ((i>>8)&0xFF).toString(16) +
           (i&0xFF).toString(16);
}
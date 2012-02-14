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
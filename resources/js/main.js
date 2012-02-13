$(document).ready(function(){
	$("#treeToggle").click(function(){
		$("#chart").empty();
		createTree();
	});
	$("#graphToggle").click(function(){
		$("#chart").empty();
		createGraph();
	});
	
	createGraph();
});
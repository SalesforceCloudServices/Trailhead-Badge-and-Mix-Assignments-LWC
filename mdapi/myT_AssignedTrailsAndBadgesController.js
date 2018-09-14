({
	init : function(component, event, helper) {
		helper.resetComponent(component, helper);

		var badgesOrTrailmixes = component.get("v.badgesOrTrailmixes");

		helper.generateSectionIcon(component, helper);
		helper.generateSectionTitle(component, helper);
		helper.getAssignmentCount(component, helper, badgesOrTrailmixes);
	},

	showPrevious : function(component, event, helper){
		var hasPrevious = component.get("v.hasPrevious");
		if(hasPrevious){
			var currentPage = component.get("v.currentPage");
			component.set("v.currentPage", currentPage - 1);
			
			helper.getAssignedEntries(component, helper);
		}
	},

	showNext : function(component, event, helper){
		var hasPrevious = component.get("v.hasNext");
		if(hasPrevious){
			var currentPage = component.get("v.currentPage");
			component.set("v.currentPage", currentPage + 1);
			
			helper.getAssignedEntries(component, helper);
		}
	}
})
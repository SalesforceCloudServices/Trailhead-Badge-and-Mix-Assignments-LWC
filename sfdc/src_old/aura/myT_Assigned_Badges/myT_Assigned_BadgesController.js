({
	doInit : function(component, event, helper) {
		var assignedbadges = component.get("v.assignedBadges");
        var action = component.get("c.getAssignedBadges");
        action.setCallback(this, function(response){
            component.set("v.assignedBadges", response.getReturnValue());
        });
        $A.enqueueAction(action);
        component.set("v.dueDate", Date.now());
	}
})
({
	doInit : function(component, event, helper) {
		var assignedbadges = component.get("v.assignedTrails");
        var action = component.get("c.getAssignedTrails");
        action.setCallback(this, function(response){
            component.set("v.assignedTrails", response.getReturnValue());
        });
        $A.enqueueAction(action);
	}
})
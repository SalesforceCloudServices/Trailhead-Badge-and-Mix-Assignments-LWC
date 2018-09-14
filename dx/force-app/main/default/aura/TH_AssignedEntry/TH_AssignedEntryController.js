({
	init : function(component) { //, event, helper
		//-- @TODO: move to helper method

		//-- sanitize what represents an upcoming badge.
		var upcomingEventWindow = component.get("v.upcomingEventWindow");
		if(upcomingEventWindow<2){
			upcomingEventWindow=7;
			component.set("v.upcomingEventWindow", upcomingEventWindow);
		}

		//-- assert these are set
		var assignmentEntry = component.get("v.assignmentEntry");
		var recordId = assignmentEntry.Id;
		var entryType = assignmentEntry.EntryType;

		//-- assign the icon
		//-- (generally we recommend static resource instead)
		var iconURL = assignmentEntry.Icon;
		if(entryType==="TrailMix"){
			iconURL = 'https://trailhead-web.s3.amazonaws.com/uploads/users/5396019/photos/thumb_030804d3576dab0cdc2a558055816208e421312a9d1495117d57928ef380d7f2.png?updatedAt=20180906113753';
		}

		var status = 'event-standard';
		try {
			var todayTime = 24 * 60 * 60 * 1000;
			var upcomingEventTime = upcomingEventWindow * todayTime;
			var nowTime = new Date().getTime();
			var dueDateTime = new Date(assignmentEntry.DueDate).getTime();

			if(dueDateTime - nowTime < todayTime){
				status = 'event-due';
			} else if(dueDateTime - nowTime < upcomingEventTime){
				status = 'event-upcoming';
			}
		} catch(err){
			//-- swallow for now
			//console.error('error occurred while determining the due date');
		}

		component.set('v.recordId', recordId);
		component.set('v.entryType', entryType);
		component.set('v.iconURL', iconURL);
		component.set('v.status', status);
	}
})
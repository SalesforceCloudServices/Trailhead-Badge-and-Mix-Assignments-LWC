({
	/**
	 * Determine the total number of trailhead assignments.
	 * @param badgesOrTrailmixes (String - [badges,trailmixes,both-default]) - what kinds of results to return.
	 * @postCondition - attribute badgeAssignmentCount is set if count is determined
	 * @postCondition - attribute trailmixAssignmentCount is set if count is determined
	 * @postCondition - attribute totalAssignmentCount is set if count is determined
	 * @postCondition - title is refreshed is set if count is determined (to support #s)
	 * @postCondition - collection of entries are requested if any assignments found
	 */
	getAssignmentCount : function(component, helper, badgesOrTrailmixes){

		var action = component.get('c.getAssignmentCount');
		action.setParams({ whichType: badgesOrTrailmixes });
		
		//-- allow results to be storable as they are not expected to change frequently
		//-- @see https://developer.salesforce.com/blogs/developer-relations/2017/03/lightning-components-best-practices-caching-data-storable-actions.html
		action.setStorable();

		action.setCallback(this, function(response){
		  var state = response.getState();
		  if( state === 'SUCCESS' ){
			//console.info('action success');
			var results = response.getReturnValue();
			
			component.set("v.badgeAssignmentCount", results.numBadgeAssignments);
			component.set("v.trailmixAssignmentCount", results.numTrailmixAssignments);
			component.set("v.totalAssignmentCount", results.totalAssignments);

			//-- now we know how many there are, regenerate the title
			helper.generateSectionTitle(component, helper);

			//-- get the next set of entries
			if(results.totalAssignments>0){
				helper.getAssignedEntries(component, helper, badgesOrTrailmixes);
			}
		} else {
			//console.error('Error occurred from Action');
			
			//-- https://developer.salesforce.com/blogs/2017/09/error-handling-best-practices-lightning-apex.html
			var errors = response.getError();
			helper.handleCallError(component, helper, state, errors);
		}

		});
		//-- optionally seet storable, abortable, background flags here
		$A.enqueueAction(action);
	},

	/**
	 * performs a server side call
	 * @param badgesOrTrailmixes (String - [badges,trailmixes,both-default]) - what kinds of results to return.
	 * @param paginationSize (Integer) - the number of records to return per page
	 * @param currentPage (Integer) - the current page we are on (offset = paginationSize x currentPage)
	 **/
	getAssignedEntries : function(component, helper, badgesOrTrailmixes) {

		if(!badgesOrTrailmixes){
			badgesOrTrailmixes = component.get("v.badgesOrTrailmixes");
		}

		var paginationSize = component.get("v.paginationSize");
		var currentPage = component.get("v.currentPage");
		var rowOffset = helper.determineRowOffset(component, helper, paginationSize, currentPage);

		var action = component.get('c.getAssignedTrailEntries');
		action.setParams({
			rowOffset: rowOffset,
			pageSize: paginationSize,
			whichEntries: badgesOrTrailmixes
		});

		//-- allow results to be storable as they are not expected to change frequently
		//-- @see https://developer.salesforce.com/blogs/developer-relations/2017/03/lightning-components-best-practices-caching-data-storable-actions.html
		action.setStorable();

		action.setCallback(this, function(response){
			var state = response.getState();
			if( state === 'SUCCESS' ){
				//console.info('action success');
				var results = response.getReturnValue();

				//-- set the entries
				component.set("v.trailheadEntries", results);
				
				//-- now we have the entries, we can allow pagination
				helper.managePagination(component, helper);
			} else {
				//console.error('Error occurred from Action');
				
				//-- https://developer.salesforce.com/blogs/2017/09/error-handling-best-practices-lightning-apex.html
				var errors = response.getError();
				helper.handleCallError(component, helper, state, errors);
			}
		});
		//-- optionally set storable, abortable, background flags here
		$A.enqueueAction(action);
	},

	/**
	 * Resets the component
	 * @visibility private
	 */
	resetComponent : function(component){
		component.set("v.currentPage", 0);
		component.set("v.badgeAssignmentCount", 0);
		component.set("v.trailmixAssignmentCount", 0);

		component.set("v.hasPrevious", false);
		component.set("v.hasNext", false);
	},

	/**
	 * Determines the icon to use for the section.
	 * @visibility private
	 * <p>Based on whether working with Badge / TrailMix / Both</p>
	 * @invariant attribute sectionIcon is assigned
	 */
	generateSectionIcon : function(component){ //, helper
		var badgesOrTrailmixes = component.get("v.badgesOrTrailmixes");
		var sectionIcon = "";

		if(badgesOrTrailmixes==="Both"){
			sectionIcon = "custom:custom78";
		} else if(badgesOrTrailmixes==="TrailMix"){
			sectionIcon = "custom:custom78";
		} else { //-- assume badges
			sectionIcon = "custom:custom48";
		}

		component.set("v.sectionIcon", sectionIcon);
	},

	/**
	 * Generates the section title.
	 * @visibility private
	 * <p>Based on whether working with Badge / Trailmix / Both,
	 * 	and reflects the current counts (if available)</p>
	 * @invariant attribute sectionTitle is assigned
	 */
	generateSectionTitle : function(component){ //, helper
		var badgesOrTrailmixes = component.get("v.badgesOrTrailmixes");
		var badgeAssignmentCount = component.get("v.badgeAssignmentCount");
		var trailmixAssignmentCount = component.get("v.trailmixAssignmentCount");

		var sectionTitle = "";

		var badgeAssignmentCountStr = "";
		if(badgeAssignmentCount > 0){
			badgeAssignmentCountStr = "(" + badgeAssignmentCount + ")";
		}
		var trailmixAssignmentCountStr = "";
		if(trailmixAssignmentCount > 0){
			trailmixAssignmentCountStr = "(" + trailmixAssignmentCount + ")";
		}

		if(badgesOrTrailmixes==="Both"){
			sectionTitle = "Assigned Badges" + badgeAssignmentCountStr +
				" & Trailmixes" + trailmixAssignmentCountStr;
		} else if(badgesOrTrailmixes==="TrailMix"){
			sectionTitle = "Assigned TrailMixes" + trailmixAssignmentCountStr;
		} else {//-- assume badges
			sectionTitle = "Assigned Badges" + badgeAssignmentCountStr;
		}

		component.set("v.sectionTitle", sectionTitle);
	},

	/**
	 * Refreshes the current pagination buttons.
	 * @visibility private
	 * @invariant attribute hasPrevious is assigned
	 * @invariant attribute hasNext is assigned
	 */
	managePagination : function(component, helper){
		var totalAssignmentCount = component.get("v.totalAssignmentCount");
		var paginationSize = component.get("v.paginationSize");
		var currentPage = component.get("v.currentPage");
		var rowOffset = helper.determineRowOffset(component, helper, paginationSize, currentPage);

		var hasPrevious = currentPage > 0;
		var hasNext = rowOffset + paginationSize < totalAssignmentCount;

		component.set("v.hasPrevious", hasPrevious);
		component.set("v.hasNext", hasNext);
	},

	/**
	 *  Determines the current row offset
	 *  @param paginationSize (Integer)
	 *  @param currentPage (Integer)
	 *  @return (integer)
	 */
	determineRowOffset : function(component, helper, paginationSize, currentPage){
		return(paginationSize * currentPage);
	},
	
	/**
	 * Handles the collection of errors into something acceptable for the end user.
	 * @visibility private
	 * @param errors (Object[]) - collection of errors from a server side call.
	 */
	handleCallError : function(component, helper, state, errors){
	  //-- https://developer.salesforce.com/blogs/2017/09/error-handling-best-practices-lightning-apex.html
	  var errorMessages = [];
	  if( errors && Array.isArray(errors) && errors.length > 0 ){
		errors.forEach(function(error){
		  errorMessages.push(error.message);
		});
	  }
	  
	  if( state === 'ERROR' ){
		helper.displayError('Error', 'Action error');
	  } else {
		helper.displayError('Unknown Response', 'Action failure');
	  }
	  
	  //console.error(errorMessages);
	},
	
	/**
	 * Displays an error
	 * @visibility private
	 * @param errorTitle (String)
	 * @param errorMsg (String)
	 **/
	displayError: function(errorTitle, errorCode, component, helper, event){
		var cleanErrorCode = errorCode;
		if(event){
			cleanErrorCode = event.getError();
		}

		var errorMsg = 'An error occurred: ' + cleanErrorCode + '. Please contact your System Administrator';
		
		//-- send a toast message
		var resultsToast = $A.get('e.force:showToast');
		resultsToast.setParams({
			'title': errorTitle,
			'message': errorMsg
		});
		resultsToast.fire();
	}
})
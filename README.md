# Overview DF19
This repository provides a number of Trail Tracker customizations examples to show developers and admins how they can extend Trailhead and myTrailhead. The code within is provided as an example of what can be done and is not actively supported.

If you want to install this repository as a package in an org use one of the following URLs: 

Sandbox (Recommended):
https://test.salesforce.com/packaging/installPackage.apexp?p0=04t2E000003jw7j

Developer Edition or Production:
https://login.salesforce.com/packaging/installPackage.apexp?p0=04t2E000003jw7j

As a prerequisite be sure to have installed the latest version of the [Trail Tracker app](https://appexchange.salesforce.com/appxListingDetail?listingId=a0N3A00000EFpAtUAL) first. If you installed previous versions of this package, completely remove the from your org by uninstalling the package AND deleting it from Setup > Installed Packages.

# What is included
* <b>Lightning Web Components</b> to show Assignments and Recommendations for Badges and Trailmixes
* <b>Processes</b> for creating new assignments and recommendations 
* <b>Login Flow</b> with the Assignments Lightning Web Component 
* <b>Custom Object</b> to persist Recommendations
* <b>Aura Wrapper</b> for the Assignment Lightning Web Component so it can be used with Lightning Out, Visualforce Pages and Flow
* <b>Apex Classes</b> to retrieve Trailhead Assignments / Recommendations and test classes
* <b>Custom Labels</b> to customize and integrate Trailhead Assignments / Recommendations LWCs with your myTrailhead Instance


## Assignment Component

* [th\_trailheadAssignments](dx/force-app/main/default/lwc/th_trailheadAssignments) - the Lightning Web Component that shows the list of assignments.
  * supports the following design attributes:
     * Badges or Trailmixes (Badge,TrailMix,Both) - type of entries to show
     * Page Size (Integer) - the number of records to show per page
     * Warning # days until due date (Integer) - Items within this many days will have orange due dates
  * [HTML - th\_trailheadAssignments](dx/force-app/main/default/lwc/th_trailheadAssignments/th_trailheadAssignments.html)
  * [JavaScript - th\_trailheadAssignments](dx/force-app/main/default/lwc/th_trailheadAssignments/th_trailheadAssignments.js)
  * [Metadata - th\_trailheadAssignments](dx/force-app/main/default/lwc/th_trailheadAssignments/th_trailheadAssignments.js-meta.xml)
  * [StyleSheets - th\_trailheadAssignments](dx/force-app/main/default/lwc/th_trailheadAssignments/th_trailheadAssignments.css)

## Recommendation Component
* [th\_contextualRecommend](dx/force-app/main/default/lwc/th_contextualRecommend) - the Lightning Web Component that shows the list of recommendations stored in the TH_Recommendation__c object. On a lightning record page it will show recommendations specific to that record, on a home or app page it will show all recommendations. If there are no recommendations the component will not render. 
  * supports the following design attributes:
     * Page Size (Integer) - the number of records to show per page
     * Warning # days until due date (Integer) - Items within this many days will have orange due dates

## Private components

* [th\_trailheadAssignment\_entry](dx/force-app/main/default/lwc/th_trailheadAssignment_entry/) - Private LWC component that represents a single badge or trailmix
  * [HTML - th\_trailheadAssignment\_entry](dx/force-app/main/default/lwc/th_trailheadAssignment_entry/th_trailheadAssignment_entry.html)
  * [JavaScript - th\_trailheadAssignment\_entry](dx/force-app/main/default/lwc/th_trailheadAssignment_entry/th_trailheadAssignment_entry.js)
  * [Metadata - th\_trailheadAssignment\_entry](dx/force-app/main/default/lwc/th_trailheadAssignment_entry/th_trailheadAssignment_entry.js-meta.xml)

* [th\_paginator\_entry](dx/force-app/main/default/lwc/th_paginator_entry/) - Private LWC component that paginates a list of th_trailheadAssignment_entry's

## Component Breakdown
Both the assignment and recommendation component leverage the private components

![Screenshot of Home Page Component](docs/images/LWC_Breakdown.png)

## Processes & Flows
The following Process and flows are included:
* Assigned Trailmix Chatter Post: Example of a chatter notification when a Trailmix is assigned
* Assign Lead Trailmix: Example of assigning a Trailmix when a Lead is updated
* Opportunity Badge Recommendation: Example of creating a recommendation when an opporutnity is updated
* TH Login Flow: Login flow that checks for uncompleted assignements and if any are found displays the Assignements LWC.  This needs to be manually assigned to a Profile.

All process are deployed as inactive.  Clone the latest version, update with a valid Badge or Trailmix Id and Activate.

### Aura Wrap Component

To allow the Assignment component to be used in places where Lightning Web Components are not yet supported (like Lightning-Out and flow), we provide a 'Wrapper component' (written in aura).  It includes the LWC component and can be used in many more areas.

* [th\_trailheadAssignments\_wrap](dx/force-app/main/default/aura/th_trailheadAssignments_wrap) - Wrapper Component
  * [Component - th\_trailheadAssignments\_wrap](dx/force-app/main/default/aura/th_trailheadAssignments_wrap/th_trailheadAssignments_wrap.cmp)

## Lightning Out

* [TH\_Assignments](dx/force-app/main/default/pages/TH_Assignments.page) - Visualforce Page using Lightning Out
  * [th\_trailheadAssignments\_container](dx/force-app/main/default/aura/th_trailheadAssignments_container) - Application to allow the component to be used in Lightning Out.

## Custom Labels

To allow the component to be easier to extend, we have created three Custom Labels to allow customization without touching code.

<table>
    <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Default Value</th>
    </tr>
    <tr>
        <td>th_trailhead_link_address</td>
        <td>Address to send users to when clicking the link at the bottom of the Trailhead Assignments / Recomendations component</td>
        <td>https://trailhead.salesforce.com/</td>
    </tr>
    <tr>
        <td>th_trailhead_link_label</td>
        <td>Label for the 'Trailhead' link at the bottom of the Trailhead Assignments component</td>
        <td>Traihead</td>
    </tr>
    <tr>
        <td>th_trailhead_trail_icon</td>
        <td>Icon to show when Trailmixes are assigned (as they have no icon)</td>
        <td><a href="https://trailhead-web.s3.amazonaws.com/uploads/users/5396019/photos/thumb_030804d3576dab0cdc2a558055816208e421312a9d1495117d57928ef380d7f2.png?updatedAt=20180906113753">https://trailhead-web.s3.amazonaws.com/...</a></td>
    </tr></table>
    

# Status

* Linting
  * You can now lint everything
    * by `cd dx; npm run lint` - will lint all javascript files
    * or `cd dx; npm run lint:watch` - to repeatedly lint everything
    * or `cd dx; npm run lint:watch:changed` - or to lint when you save a file and only lint that file (neat)
* Users can share badges and trails
  * Work Remaining
     * Unit tests
     * Cleanup TODO in th_overlayShare_wrap, left an example using the standard forceChatter:publisher components and bask in the glory of how well it doesn't meet our needs.
     * Review if resizing the ContextualRecommend and trailheadAssignments makes them look funny. I manually et the width to 100% on the entries, but unsure if it works everywhere.
     * How to show errors if apex fails in `th_traiheadAssignments`, th_overlayShare or th_overlayAddAssign. Show toast message?
  * Caveats
     * So far only Badges and Trailmixes are supported. Seems complete unless we need trail.
     * Sharing seems to share to another user, although it doesn't appear to show up on their wall for some reason? (Although they get an email)
  * How was it done?
     * We need to switch the Trailhead Assignments and Recommendations components to the wrap components (they register the share and add events emitted from the `trailheadAssignment_entry` component). This was done on the home page, but not sure where else is needed.
     * Note that we leverage the overlaylibrary. This is the reason we need the wrapper as it is only supported in Aura. There was a response that [the only other option is to recreate the modal component by hand.](https://org62.lightning.force.com/lightning/r/0D50M00004S4r45SAB/view)
     * The `lwc/trailheadAssignment_entry` has the buttons that emit a custom event, note that it uses bubbles and composed. [This allows the intermediaries to not know about them or care.](https://developer.salesforce.com/docs/component-library/documentation/lwc/lwc.events_propagation)
     * The `Assignments_wrapper` / `Recommendations_wrapper` then listen for it, and then use the [aura component - lightning:overlayLibrary](https://developer.salesforce.com/docs/component-library/bundle/lightning:overlayLibrary/documentation) to then create the aura `overlayShare_wrap` component.
     * That in turn creates the lwc `overlayShare` component.
     * The Apex is in the `TH_ShareUtil` apex class to actually do the share.
     * The 'click enter' to search in the Search Input examples for [lwc lightning-input component](https://developer.salesforce.com/docs/component-library/bundle/lightning-input/example) didn't work out. So I used the timeout method done in the [lwc-recipes for CompositionContactSearch](https://github.com/trailheadapps/lwc-recipes/blob/master/force-app/main/default/lwc/compositionContactSearch/compositionContactSearch.js)
     * To test the search, either add more users, or set the [th_TrailheadMinCharSearchThreshold](https://trail-assignments-lwc-dev-ed.my.salesforce.com/one/one.app#/alohaRedirect/1012E00000AjFqn?isdtp=p1) custom label.  (This seems to cache pretty hard, manually setting might be necessary)
     * Custom Labels used: [th_TrailheadMinCharSearchThreshold](https://trail-assignments-lwc-dev-ed.my.salesforce.com/one/one.app#/alohaRedirect/1012E00000AjFqn?isdtp=p1), [th_TrailheadInputSearchDelay](https://trail-assignments-lwc-dev-ed.my.salesforce.com/one/one.app#/alohaRedirect/1012E00000AjFqs?isdtp=p1)

* User can add assignments
  * Work Remaining
     * Unit tests
     * Cleanup TODO in th_overlayShare_wrap, left an example using the standard forceChatter:publisher components and bask in the glory of how well it doesn't meet our needs.
     * Review if resizing the `ContextualRecommend` and `trailheadAssignments` makes them look funny. I manually et the width to 100% on the entries, but unsure if it works everywhere.
     * How to show errors if apex fails in `th_traiheadAssignments`, `th_overlayShare` or `th_overlayAddAssign`. Show toast message?
  * Caveats
     * None - so far
  * How was it done?
     * * We need to switch the Trailhead Assignments and Recommendations components to the wrap components (they register the share and add events emitted from the `trailheadAssignment_entry` component). This was done on the home page, but not sure where else is needed.
     * Note that we leverage the overlaylibrary. This is the reason we need the wrapper as it is only supported in Aura. There was a response that [the only other option is to recreate the modal component by hand.](https://org62.lightning.force.com/lightning/r/0D50M00004S4r45SAB/view)
     * The `lwc/trailheadAssignment_entry` has the buttons that emit a custom event, note that it uses bubbles and composed. [This allows the intermediaries to not know about them or care.](https://developer.salesforce.com/docs/component-library/documentation/lwc/lwc.events_propagation)
     * The `Assignments_wrapper` / `Recommendations_wrapper` then listen for it, and then use the [aura component - lightning:overlayLibrary](https://developer.salesforce.com/docs/component-library/bundle/lightning:overlayLibrary/documentation) to then create the aura  `overlayAddAssign_wrap` components.
     * They in turn create the lwc `overlayAddAssign` components.
     * The Apex is in the `TH_Assignments` apex class to actually add the assignment.
         * Based on the type of the entry, we call either the `addTrailheadModuleAssignment` or `the addTrailmixAssignment` method
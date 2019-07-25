# Overview
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
    



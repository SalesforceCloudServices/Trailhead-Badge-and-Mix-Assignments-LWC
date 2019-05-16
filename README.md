# Overview
This repo provides a number of Trail Tracker customizations allowing developers and admins to extend Trailhead and myTrailhead.

If you want to install this repo as a package us the following link: https://login.salesforce.com/packaging/installPackage.apexp?p0=04t2E000002dAih

Be sure to already have installed the latest version of the [Trail Tracker app](https://appexchange.salesforce.com/appxListingDetail?listingId=a0N3A00000EFpAtUAL) first.

What is included:
* Multiple Lightning Web Components, include one to show Assignements and one to show Recomendations
* Multiple Processes, including new assignements and notification processes
* Login flow with the Assignements Lightning Web Component
* A custom object to persesit recomendations
* An aura wrapper for the Assignemt Lightning Web Component so it can be used with Ligthning Out, Visualforce Pages and Flow


## Assignment Component

* [th\_trailheadAssignments](dx/force-app/main/default/lwc/th_trailheadAssignments) - the Lightning Web Component that shows the list of assignments.
  * supports the following design attributes:
     * Badges or Trailmixes (Badge,TrailMix,Both) - type of entries to show
     * Page Size (Integer) - the number of records to show per page
     * Warning # days until due date (Integer) - Items within this many days are considered "Upcoming"
  * [HTML - th\_trailheadAssignments](dx/force-app/main/default/lwc/th_trailheadAssignments/th_trailheadAssignments.html)
  * [JavaScript - th\_trailheadAssignments](dx/force-app/main/default/lwc/th_trailheadAssignments/th_trailheadAssignments.js)
  * [Metadata - th\_trailheadAssignments](dx/force-app/main/default/lwc/th_trailheadAssignments/th_trailheadAssignments.js-meta.xml)
  * [StyleSheets - th\_trailheadAssignments](dx/force-app/main/default/lwc/th_trailheadAssignments/th_trailheadAssignments.css)

## Recomendation Component




## Other components included but are used behind the scenes...

* [th\_trailheadAssignment\_entry](dx/force-app/main/default/lwc/th_trailheadAssignment_entry/) - (private lwc component that represents a single badge / trailmix
  * [HTML - th\_trailheadAssignment\_entry](dx/force-app/main/default/lwc/th_trailheadAssignment_entry/th_trailheadAssignment_entry.html)
  * [JavaScript - th\_trailheadAssignment\_entry](dx/force-app/main/default/lwc/th_trailheadAssignment_entry/th_trailheadAssignment_entry.js)
  * [Metadata - th\_trailheadAssignment\_entry](dx/force-app/main/default/lwc/th_trailheadAssignment_entry/th_trailheadAssignment_entry.js-meta.xml)

### Aura Component

To allow the Assignment component to be used in places where Lightning Web Components are not yet supported (like Lightning-Out), we provide a 'Wrapper component' (written in aura).  It includes the LWC component and can be used in many more areas.

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
		<td>Address to send users to when clicking the button at the bottom of the Trailhead Assignments component</td>
		<td>https://trailhead.salesforce.com/</td>
	</tr>
	<tr>
		<td>th_trailhead_link_label</td>
		<td>Label for the 'Trailhead' button at the bottom of the Trailhead Assignments component</td>
		<td>Traihead</td>
	</tr>
	<tr>
		<td>th_trailhead_trail_icon</td>
		<td>Icon to show when trailhead trails are assigned (as they have no icon)</td>
		<td>...</td>
	</tr></table>
	


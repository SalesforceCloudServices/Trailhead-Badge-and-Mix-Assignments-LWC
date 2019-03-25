# Overview

Provide a list of the current trailhead badges and trailmixes assigned to the current user.

Done as a Home Page Component (found under the Home_Page_Default app builder page)

![Screenshot of Home Page Component](docs/images/2_HomePageComponent.gif)

and a Lightning Out tab (found under `VF Trailhead Assignments` under the app launcher, or [at this link](https://marzbrews-dev-ed.lightning.force.com/lightning/n/VF_Trailhead_Assignments))

![Screenshot of Lightning out](docs/images/1_LightningOutScreenshot.png)

## Components

* [TH\_AssignedTrailsAndBadges](sfdc/src/aura/TH_AssignedTrailsAndBadges/TH_AssignedTrailsAndBadges.cmp) - the base / home page components
  * supports the following design attributes:
     * Badges or Trailmixes (Badge,TrailMix,Both) - type of entries to show
     * Page Size (Integer) - the number of records to show per page
     * Warning # days until due date (Integer) - Items within this many days are considered "Upcoming"
  * [Apex Controller - TH\_Assignments](sfdc/src/classes/TH_Assignments.cls)
  * [design file](sfdc/src/aura/TH_AssignedTrailsAndBadges/TH_AssignedTrailsAndBadges.design)
  * [controller](sfdc/src/aura/TH_AssignedTrailsAndBadges/TH_AssignedTrailsAndBadgesController.js)
  * [helper](sfdc/src/aura/TH_AssignedTrailsAndBadges/TH_AssignedTrailsAndBadgesHelper.js)
* [TH\_AssignedEntry](sfdc/src/aura/TH_AssignedEntry/TH_AssignedEntry.cmp) - (private component that represents a single badge / trailmix
  * [controller](sfdc/src/aura/TH_AssignedEntry/TH_AssignedEntryController.js)

## Lightning Out

* [TH\_Assignments](sfdc/src/pages/TH_Assignments.page) - Visualforce Page using Lightning Out
   * [TH\_Assigned\_Container](sfdc/src/aura/TH_Assigned_Container/TH_Assigned_Container.app) - Application that defines the Lightning Out Dependencies.

# Install with Salesforce DX

**1.** Install the latest version of the [Trail Tracker app exchange app - by Trailhead](https://appexchange.salesforce.com/appxListingDetail?listingId=a0N3A00000EFpAtUAL)

	sfdx force:package:install --package 04t1Q000001QeImQAK -u testTrailhead -r -w 30

**2.** Then push the code to the scratch org:

	sfdx force:source:push -u testTrailhead

**3.** Assign the permissionSet `TH_TrailheadBadgeAndMixParticipant ` to your current user

For any users that need access to the Lightning out and Lightning pages

	sfdx force:user:permset:assign -u testTrailhead -n TH_TrailheadBadgeAndMixParticipant

**4.** open the org

	sfdx force:org:open -u testTrailhead
	
**5.** Find the current Trailhead Badges and TrailMixes assigned to you, via the 'Trailhead Assignments' tab in the App Launcher.

![Screenshot of App Launcher](docs/images/findTrailheadAssignments.png)


# Install via URL

**1.** Install the latest version of the [Trail Tracker app exchange app - by Trailhead](https://appexchange.salesforce.com/appxListingDetail?listingId=a0N3A00000EFpAtUAL)

	sfdx force:package:install --package 04t1Q000001QeImQAK -u testTrailhead -r -w 30

**2.** Then install this package via the URL

In Production
[https://login.salesforce.com/packaging/installPackage.apexp?p0=04t0b000001DgL7](https://login.salesforce.com/packaging/installPackage.apexp?p0=04t0b000001DgL7)

In Dev Sandbox
[https://test.salesforce.com/packaging/installPackage.apexp?p0=04t0b000001DgL7](https://test.salesforce.com/packaging/installPackage.apexp?p0=04t0b000001DgL7)

Or if already logged into the org, add the following after your salesforce domain (to avoid logging in again)

`/installPackage.apexp?p0=04t0b000001DgL7`

For example, if your Salesforce Home URL is:

https://df18-th-support-pkg-dev-ed.lightning.force.com/lightning/page/home

Then the url would be:

https://df18-th-support-pkg-dev-ed.lightning.force.com/installPackage.apexp?p0=04t0b000001DgL7

![Screenshot of Unlocked Package Install](docs/images/installViaURL.png)

## TODOs:

* Support new request: Support Trails (only TrailMixes and Badges currently supported)

* I fixed the pagination issue in apex, but should be tested more. (Deleting the items from the list was failing, so I implemented a splice instead)

* The pagination can either be done on the server (through offset - like it is now), or all items can be returned and the component paginates.
  * Moving to the browser will make the code simpler to understand.
  * but generally we recommend reducing data sent like it is now.

* The `Both` (both Badges and TrailMixes is the cause of most of the issues on Apex, as the pagination must be done by hand)
  * I think I did the best option to solve the issue, but should be further reviewed.

* Use of custom settings

* We really should cleanup the names of the files and the apex code a bit for clarity - (ex: uB / uC, etc). I took first stab at it.
faster for loading the home screen fast as it won't be touched often.

* migrate the code from the controller of the TH_AssignedEntry to helpers. (I understand it is more in-line, but it is better practice. I'll leave it to your judgement.


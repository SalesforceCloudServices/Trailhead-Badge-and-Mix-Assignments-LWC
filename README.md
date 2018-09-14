# Overview

Provide a list of the current trailhead badges and trailmixes assigned to the current user.

Done as a Home Page Component (found under the Home_Page_Default app builder page)

![Screenshot of Home Page Component](docs/images/2_HomePageComponent.gif)

and a Lightning Out tab (found under `VF Trailhead Assignments` under the app launcher, or [at this link](https://marzbrews-dev-ed.lightning.force.com/lightning/n/VF_Trailhead_Assignments))

![Screenshot of Lightning out](docs/images/1_LightningOutScreenshot.png)

## Components

* [myT_AssignedTrailsAndBadges](mdapi/myT_AssignedTrailsAndBadges.cmp) - the base / home page components
  * supports the following design attributes:
     * Badges or Trailmixes (Badge,TrailMix,Both) - type of entries to show
     * Page Size (Integer) - the number of records to show per page
     * Warning # days until due date (Integer) - Items within this many days are considered "Upcoming"
  * [design file](mdapi/myT_AssignedTrailsAndBadges.design)
  * [controller](mdapi/myT_AssignedTrailsAndBadgesController.js)
  * [helper](mdapi/myT_AssignedTrailsAndBadgesHelper.js)
* [myT_AssignedEntry](mdapi/myT_AssignedEntry.cmp) - (private component that represents a single badge / trailmix
  * [controller](mdapi/myT_AssignedEntryController.js)

## Lightning Out

* [myT_Assignments](mdapi/myT_Assignments.page) - Visualforce Page using Lightning Out
   * [myT_Assigned_Container](mdapi/myT_Assigned_Container.app) - Application that defines the Lightning Out Dependencies.

## TODOs:

* I fixed the pagination issue in apex, but should be tested more. (Deleting the items from the list was failing, so I implemented a splice instead)

* The pagination can either be done on the server (through offset - like it is now), or all items can be returned and the component paginates.
  * Moving to the browser will make the code simpler to understand.
  * but generally we recommend reducing data sent like it is now.

* The `Both` (both Badges and TrailMixes is the cause of most of the issues on Apex, as the pagination must be done by hand)
  * I think I did the best option to solve the issue, but should be further reviewed.

* Use of custom settings

* We really should cleanup the names of the files and the apex code a bit for clarity - (ex: uB / uC, etc). I took first stab at it.
faster for loading the home screen fast as it won't be touched often.

* migrate the code from the controller of the myT_AssignedEntry to helpers. (I understand it is more in-line, but it is better practice. I'll leave it to your judgement.


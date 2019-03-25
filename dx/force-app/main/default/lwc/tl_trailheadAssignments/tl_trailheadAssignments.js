/**
 * Component to list the trailhead assignments for a given user.
 **/
import { LightningElement, track, api, wire } from 'lwc';

export default class Tl_trailheadAssignments extends LightningElement {
  @api badgesOrTrailmixes;
  @api paginationSize;
  @api upcomingEventWindow;

  //-- private attributes
  //-- the icon to use for the sectio
  @track sectionIcon;
  //-- the title to use for the section
  @track sectionTitle;

  connectedCallback(){
    console.log('connected callback started');

    let badgeAssignmentCountStr = '1';
    let trailmixAssignmentCountStr = '2';

    //-- can also be set through a getter/setter
    //-- but done in the constructor because it only needs to be evaluated once...

    this.sectionIcon = this.determineSectionIcon(this.badgesOrTrailmixes);
    this.sectionTitle = this.determineSectionTitle(this.badgesOrTrailmixes, badgeAssignmentCountStr, trailmixAssignmentCountStr);
    console.log('connected callback started');
  }

  /**
   * Determines the icon to show for the section
   * @param {string} badgesOrTrailmixes - (Badge|TrailMix|Both)
   * @visibility private
   * @returns String
   */
  determineSectionIcon(badgesOrTrailmixes){
    let sectionIcon = '';
		if(badgesOrTrailmixes==="Both"){
			sectionIcon = "custom:custom78";
		} else if(badgesOrTrailmixes==="TrailMix"){
			sectionIcon = "custom:custom78";
		} else { //-- assume badges
			sectionIcon = "custom:custom48";
    }
    return sectionIcon;
  }

  /**
   * Determines the title to show for the section
   * @param {string} badgesOrTrailmixes - (Badge|TrailMix|Both)
   * @param {integer} badgeAssignmentCountStr - # of badges assigned
   * @param {integer} trailmixAssignmentCountStr - # of trailmixes assigned
   * @visibility private
   * @returns String
   */
  determineSectionTitle(badgesOrTrailmixes, badgeAssignmentCountStr, trailmixAssignmentCountStr){
    let sectionTitle = '';
    if(badgesOrTrailmixes==="Both"){
      sectionTitle = `Assigned Badges(${badgeAssignmentCountStr}) & Trailmixes(${trailmixAssignmentCountStr})`;
		} else if(badgesOrTrailmixes==="TrailMix"){
      sectionTitle = `Assigned TrailMixes(${trailmixAssignmentCountStr})`;
		} else {//-- assume badges
      sectionTitle = `Assigned Badges(${badgeAssignmentCountStr})`;
    }
    return sectionTitle;
  }
}
/**
 * Component to list the trailhead assignments for a given user.
 **/
import { LightningElement, track, api, wire } from 'lwc';

import getAssignmentCountApex from '@salesforce/apex/TH_Assignments.getAssignmentCount';
import getAssignedTrailEntriesApex from '@salesforce/apex/TH_Assignments.getAssignedTrailEntries';

export default class Tl_trailheadAssignments extends LightningElement {
  //-- properties (see - meta.xml)
  @api badgesOrTrailmixes;
  @api paginationSize;
  @api upcomingEventWindow;

  @track error;

  //-- private attributes
  //-- the icon to use for the sectio
  @track sectionIcon;
  //-- the title to use for the section
  @track sectionTitle;
  //-- current page of results (0) is first, 1 is 2nd, etc.
  currentPage;

  //-- # of badges assigned
  //-- @TODO: remove - not really needed
  @track badgeAssignmentCount;
  //-- # of trailmixes assigned
  //-- @TODO: remove - not really needed
  @track trailmixAssignmentCount;

  //-- collection of the assignment entries
  //-- @TODO: either make a getter/setter or manipulate with next/previous page.
  @track trailheadEntries;
  //-- paginated list of all trailhead entries.
  @track paginatedTrailheadEntries;

  /**
   * Determines the number of trailmixes and badges assigned.
   */
  @wire(getAssignmentCountApex, {whichType:'$badgesOrTrailmixes'})
  captureGetAssignmentCountApex({ error, data }) {
    if (error) {
      //-- @TODO: handle error
      console.error('error occurred customWireHandlerMethodName:getAssignmentCountApex', JSON.stringify(error));
      this.error = error;
    } else if (data) {
      let {numBadgeAssignments, numTrailmixAssignments} = data;
      this.badgeAssignmentCount = numBadgeAssignments;
      this.trailmixAssignmentCount = numTrailmixAssignments;

      this.sectionIcon = this.determineSectionIcon(this.badgesOrTrailmixes);
      this.sectionTitle = this.determineSectionTitle(this.badgesOrTrailmixes, this.badgeAssignmentCount, this.trailmixAssignmentCount);
    }
  }

  /**
   * Determines the trail entries
   */
  @wire(getAssignedTrailEntriesApex, {whichType:'$badgesOrTrailmixes'})
  captureGetAssignedTrailEntries({ error, data }) {
    if (error) {
      //-- @TODO: handle error
      console.error('error occurred captureGetAssignedTrailEntries:getAssignedTrailEntriesApex', JSON.stringify(error));
      this.error = error;
    } else if (data) {
      //-- @TODO: handle data
      //-- continue here when you come back.

      this.resetPagination();
    }
  }

  connectedCallback(){
    console.log('connected callback started');

    /*
    this.badgeAssignmentCount = 1
    this.trailmixAssignmentCount = 2;

    //-- can also be set through a getter/setter
    //-- but done in the constructor because it only needs to be evaluated once...

    this.sectionIcon = this.determineSectionIcon(this.badgesOrTrailmixes);
    this.sectionTitle = this.determineSectionTitle(this.badgesOrTrailmixes, this.badgeAssignmentCount, this.trailmixAssignmentCount);
    */
  }

  /**
   * Defines the current page of the results.
   */
  resetPagination(){
    this.currentPage = 0;
  }

  get hasPrevious() {
    return this.currentPage > 0;
  }
  get hasNext(){
    return this.numAssignments > this.currentPage * this.paginationSize;
  }
  get numAssignments(){
    if (this.trailheadEntries){
      return this.trailheadEntries.length;
    }
    return(0);
  }
  get paginatedTrailheadEntries(){
    if (this.trailheadEntries){
      let currentIndex = this.currentPage * this.paginationSize;
      return this.trailheadEntries.slice(currentIndex, currentIndex + this.paginationSize);
    }
    return [];
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
   * @param {integer} badgeAssignmentCount - # of badges assigned
   * @param {integer} trailmixAssignmentCount - # of trailmixes assigned
   * @visibility private
   * @returns String
   */
  determineSectionTitle(badgesOrTrailmixes, badgeAssignmentCount, trailmixAssignmentCount){
    let sectionTitle = '';
    if(badgesOrTrailmixes==="Both"){
      sectionTitle = `Assigned Badges(${badgeAssignmentCount}) & Trailmixes(${trailmixAssignmentCount})`;
		} else if(badgesOrTrailmixes==="TrailMix"){
      sectionTitle = `Assigned TrailMixes(${trailmixAssignmentCount})`;
		} else {//-- assume badges
      sectionTitle = `Assigned Badges(${badgeAssignmentCount})`;
    }
    return sectionTitle;
  }
}
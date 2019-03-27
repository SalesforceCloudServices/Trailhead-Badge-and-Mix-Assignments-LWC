/**
 * Component to list the trailhead assignments for a given user.
 **/
import { LightningElement, track, api, wire } from 'lwc';

import Paginator from 'c/tl_paginator';

// import getAssignmentCountApex from '@salesforce/apex/TH_Assignments.getAssignmentCount';
import getAssignedTrailEntriesApex from '@salesforce/apex/TH_Assignments.getAssignedTrailEntries';

export default class Tl_trailheadAssignments extends LightningElement {
  //-- properties (see - meta.xml)
  @api badgesOrTrailmixes;
  @api paginationSize;
  @api upcomingEventWindow;
  @api showOnlyOverdue;

  @track error;

  //-- private attributes

  //-- NOTE: the sectionIcon and title COULD be getters/setters
  //-- but they would be continually re-evaluated.
  //-- saving calculations is preferred here as it only gets set on load.

  //-- the icon to use for the section
  @track sectionIcon;
  //-- the title to use for the section
  @track sectionTitle;

  //-- # of badges assigned
  //-- @TODO: remove - not really needed
  @track badgeAssignmentCount;
  //-- # of trailmixes assigned
  //-- @TODO: remove - not really needed
  @track trailmixAssignmentCount;

  //-- paginator
  paginator;

  /**
   * Called when the component is initially created
   */
  connectedCallback(){
    console.log('connected callback started');
    this.paginator = new Paginator([], this.paginationSize);

    this.sectionIcon = this.determineSectionIcon(this.badgesOrTrailmixes);
    this.sectionTitle = this.determineSectionTitle(this.badgesOrTrailmixes,0,0);
  }

  /**
   * Determines the trail entries
   */
  @wire(getAssignedTrailEntriesApex, {rowOffset:0, pageSize:-1, whichEntries:'$badgesOrTrailmixes'})
  captureGetAssignedTrailEntries({ error, data }) {
    if (error) {
      //-- @TODO: handle error
      console.error('error occurred captureGetAssignedTrailEntries:getAssignedTrailEntriesApex', JSON.stringify(error));
      this.error = error;
    } else if (data) {
      console.log('data received');
      let {badgeAssignmentCount, trailmixAssignmentCount} = this.determineAssignmentCounts(data);

      this.badgeAssignmentCount = badgeAssignmentCount;
      this.trailmixAssignmentCount = trailmixAssignmentCount;

      this.paginator.reInitialize(data, this.paginationSize);

      //-- section icon is pre-set, now we only care about the assignments
      this.sectionTitle = this.determineSectionTitle(
        this.badgesOrTrailmixes,
        this.badgeAssignmentCount,
        this.trailmixAssignmentCount
      );
    }
  }

  next(){
    this.paginator.next();
  }
  previous(){
    this.paginator.previous();
  }

  /** Whether the user has no assignments */
  get hasAnyAssignments(){
    return this.badgeAssignmentCount + this.trailmixAssignmentCount > 0;
  }
  /** Total number of assignments @deprecated */
  get totalAssignmentCount(){
    return this.badgeAssignmentCount + this.trailmixAssignmentCount;
  }
  /** whether any pagination buttons should be shown */
  get shouldShowPagination(){
    return this.hasPrevious || this.hasNext;
  }
  /** whether there is a previous page */
  get hasPrevious() {
    return this.paginator.hasPrevious();
  }
  /** whether there is a next page */
  get hasNext(){
    return this.paginator.hasNext();
  }
  /** the records to show in the list */
  get paginatedTrailheadEntries(){
    return this.paginator.paginatedValues;
  }

  //-- methods

  /**
   * Determines the assignment breakdown of a list of assignments
   * @visibility private
   * @param {array} assignmentList 
   * @return {badgeAssignmentCount:integer, trailmixAssignmentCount:integer}
   */
  determineAssignmentCounts(assignmentList){
    const results = {
      badgeAssignmentCount: 0,
      trailmixAssignmentCount: 0
    };

    if (assignmentList){
      assignmentList.forEach(assignment => {
        if (assignment.EntryType === 'TrailMix'){
          results.trailmixAssignmentCount++;
        } else if (assignment.EntryType === 'Badge'){
          results.badgeAssignmentCount++;
        }
      });
    }

    return results;
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
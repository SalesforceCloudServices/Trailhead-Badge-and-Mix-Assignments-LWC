/**
 * Component to list the trailhead assignments for a given user.
 **/
import { LightningElement, track, api, wire } from 'lwc';

import {refreshApex} from '@salesforce/apex';

// import getAssignmentCountApex from '@salesforce/apex/TH_Assignments.getAssignmentCount';
// import getAssignedTrailEntriesApex from '@salesforce/apex/TH_Assignments.getAssignedTrailEntries';
import getAllAssignedTrailEntriesApex from '@salesforce/apex/TH_Assignments.getAllAssignedTrailEntries';

/** the address to send someone to Trailhead */
import TRAILHEAD_LINK_ADDRESS from '@salesforce/label/c.th_trailhead_link_address';
/** the name to show for the link to Trailhead */
import TRAILHEAD_LINK_LABEL from '@salesforce/label/c.th_trailhead_link_label';
import Paginator from 'c/th_paginator';

export default class Tl_trailheadAssignments extends LightningElement {
  //-- properties (see - meta.xml)
  @api badgesOrTrailmixes;
  @api paginationSize;
  @api upcomingEventWindow;
  @api showOnlyOverdue;

  @track error;

  //-- private attributes

  //-- note: the collections are required for refreshApex
  //-- see here for more information
  //-- https://developer.salesforce.com/docs/component-library/documentation/lwc/apex#data_apex__refresh_cache

  //-- collection of all the assignments (used for apexRefresh)
  @track assignedTrailEntries = {};

  //-- paginator that determines which pages, etc.
  @track recordPaginator;

  //-- @TODO: investigate way to directly link to paginator instead
  //-- note that changes are only tracked at the paginator level
  //-- so paginator.hasNext and paginator.hasPrevious within getters / setters
  //-- work initially but won't work afterwards, because paginator doesn't change.

  /** Whether there are any assignments */
  @track hasAnyAssignments;
  // get hasAnyAssignments(){}

  /** whether there is a previous page */
  // @track hasPrevious;
  @api get hasPrevious() {
    return this.recordPaginator.hasPrevious;
  }
  /** whether there is a next page */
  // @track hasNext;
  @api get hasNext(){
    return this.recordPaginator.hasNext;
  }
  //-- "current page" of the assignments
  // @track paginatedTrailEntries = {};
  @api get paginatedTrailEntries(){
    return this.recordPaginator.paginatedValues;
  }

  //-- NOTE: the sectionIcon and title COULD be getters/setters
  //-- but they would be continually re-evaluated.
  //-- saving calculations is preferred here as it only gets set on load.

  //-- the icon to use for the section
  @track sectionIcon;
  //-- the title to use for the section
  @track sectionTitle;

  /**
   * Called when the component is initially created
   */
  connectedCallback(){
    this.sectionIcon = this.determineSectionIcon(this.badgesOrTrailmixes);
    this.sectionTitle = this.determineSectionTitle(this.badgesOrTrailmixes,0,0);

    this.recordPaginator = new Paginator(null, this.paginationSize);
  }

  /**
   * Refresh the current counts
   * <p>Note: this must have access
   * to the exact response from the wire service to work.</p>
   */
  refreshAssignments(){
    refreshApex(this.assignedTrailEntries);
  }

  /** Paginate to the next page */
  next(){
    if (this.hasNext){
      this.recordPaginator = this.recordPaginator.nextPaginator();
      // this.refreshPagination();
    }
  }
  /** Paginate to the previous page */
  previous(){
    if (this.hasPrevious){
      this.recordPaginator = this.recordPaginator.previousPaginator();
      // this.refreshPagination();
    }
  }

  /**
   * Determines the trail entries
   */
  @wire(getAllAssignedTrailEntriesApex, {
    whichType:'$badgesOrTrailmixes'
  })
  captureGetAssignedTrailEntries(results) {
    let { error, data } = results;
    if (error) {
      //-- @TODO: handle error
      console.error('error occurred captureGetAssignedTrailEntries:getAssignedTrailEntriesApex', JSON.stringify(error));
      this.error = error;
    } else if (data) {
      this.assignedTrailEntries = results;

      this.hasAnyAssignments = data.length > 0;

      this.recordPaginator.reInitialize(data, this.paginationSize);
      // this.refreshPagination();

      let {badgeAssignmentCount, trailmixAssignmentCount} = this.determineAssignmentCounts(data);
      //-- section icon is pre-set, now we only care about the assignments
      this.sectionTitle = this.determineSectionTitle(
        this.badgesOrTrailmixes,
        badgeAssignmentCount,
        trailmixAssignmentCount
      );
    }
  }

  
  /** Provide a link to Trailhead using the custom label */
  get trailheadLinkLabel(){
    return TRAILHEAD_LINK_LABEL;
  }
  /** Provide a link to Trailhead using the custom label */
  get trailheadLinkAddress(){
    return TRAILHEAD_LINK_ADDRESS;
  }
  
  /** whether any pagination buttons should be shown */
  get shouldShowPagination(){
    return (
      this.hasNext || this.hasPrevious
    );
  }

  //-- methods

  /**
   * Updates the pagination values.
   * @postcondition - paginatedTrailAssignments are set
   * @postcondition - hasNext is updated
   * @postcondition - hasPrevious is updated
   */
  refreshPagination(){
    // this.paginatedTrailEntries = this.recordPaginator.paginatedValues;
    // this.hasPrevious = this.recordPaginator.hasPrevious();
    // this.hasNext = this.recordPaginator.hasNext();
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
      sectionTitle = `Assigned Badges (${badgeAssignmentCount}) & Trailmixes (${trailmixAssignmentCount})`;
		} else if(badgesOrTrailmixes==="TrailMix"){
      sectionTitle = `Assigned TrailMixes (${trailmixAssignmentCount})`;
		} else {//-- assume badges
      sectionTitle = `Assigned Badges (${badgeAssignmentCount})`;
    }
    return sectionTitle;
  }

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
}
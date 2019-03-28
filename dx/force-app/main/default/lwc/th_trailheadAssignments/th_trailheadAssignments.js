/**
 * Component to list the trailhead assignments for a given user.
 **/
import { LightningElement, track, api, wire } from 'lwc';

import {refreshApex} from '@salesforce/apex';

import getAssignmentCountApex from '@salesforce/apex/TH_Assignments.getAssignmentCount';
import getAssignedTrailEntriesApex from '@salesforce/apex/TH_Assignments.getAssignedTrailEntries';

/** the address to send someone to Trailhead */
import TRAILHEAD_LINK_ADDRESS from '@salesforce/label/c.th_trailhead_link_address';
/** the name to show for the link to Trailhead */
import TRAILHEAD_LINK_LABEL from '@salesforce/label/c.th_trailhead_link_label';

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

  //-- collection of all the assignments
  @track assignedTrailEntries = {};

  //-- total number of all assignments (required for pagination)
  @track assignmentCount = {};

  //-- whether there are any badges assigned
  @track totalAssignments = 0;

  //-- the current page of results we are on
  @track rowOffset = 0;

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
  }

  /**
   * Refresh the current counts
   * <p>Note: this must have access
   * to the exact response from the wire service to work.</p>
   */
  refreshAssignments(){
    refreshApex(this.assignedTrailEntries);
    refreshApex(this.assignmentCount);
  }

  /** Paginate to the next page */
  next(){
    if (this.hasNext){
      this.rowOffset += this.paginationSize;
    }
  }
  /** Paginate to the previous page */
  previous(){
    if (this.hasPrevious){
      this.rowOffset = Math.min(
        this.rowOffset - this.paginationSize,
        0
      );
    }
  }

  /** Determines the number of all trail entries */
  @wire(getAssignmentCountApex, {whichType:'$badgesOrTrailmixes'})
  captureAssignmentCount(response){
    let {error, data} = response;
    if (error){
      //-- @TODO: handle error
      console.error('error occurred captureGetAssignedTrailEntries:getAssignedTrailEntriesApex', JSON.stringify(error));
      this.error = error;
    }
    if (data){
      this.assignmentCount = response;

      this.sectionTitle = this.determineSectionTitle(
        this.badgesOrTrailmixes,
        data.numBadgeAssignments,
        data.numTrailmixAssignments
      );

      //assert data.totalAssignments === data.numBadgeAssignments + data.numTrailmixAssignments
      this.totalAssignments = data.totalAssignments;
    }
  }

  /**
   * Determines the trail entries
   */
  @wire(getAssignedTrailEntriesApex, {
    rowOffset:'$rowOffset',
    pageSize:'$paginationSize',
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
    }
  }

  /**
   * Whether there are any assignments
   */
  get hasAnyAssignments(){
    return this.totalAssignments > 0;
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
    return this.hasPrevious || this.hasNext;
  }
  /** whether there is a previous page */
  @api
  get hasPrevious() {
    return this.rowOffset > 0;
  }
  /** whether there is a next page */
  @api
  get hasNext(){
    let hasNext = false;
    if (this.assignedTrailEntries && this.totalAssignments){
      let endPage = this.rowOffset + this.paginationSize;
      hasNext = endPage < this.totalAssignments;
    }
    return hasNext;
  }

  //-- methods

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
}
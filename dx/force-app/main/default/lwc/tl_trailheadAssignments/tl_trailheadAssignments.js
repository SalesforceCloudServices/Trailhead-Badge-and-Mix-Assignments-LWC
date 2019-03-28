/**
 * Component to list the trailhead assignments for a given user.
 **/
import { LightningElement, track, api, wire } from 'lwc';

import {refreshApex} from '@salesforce/apex';

import Paginator from 'c/tl_paginator';

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

  //-- collection of all the assignments
  @track assignedTrailEntries;

  //-- whether there are any badges assigned
  @track hasAnyAssignments = false;

  //-- the current page of results we are on
  @track currentPage = 0;

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
    console.log('connected callback started');

    // this.currentPage = 0;

    this.sectionIcon = this.determineSectionIcon(this.badgesOrTrailmixes);
    this.sectionTitle = this.determineSectionTitle(this.badgesOrTrailmixes,0,0);
  }

  /** Determines the number of all trail entries */
  @wire(getAssignmentCountApex, {whichType:'$badgesOrTrailmixes'})
  captureAssignmentCount({error, data}){
    if (error){
      //-- @TODO: handle error
      console.error('error occurred captureGetAssignedTrailEntries:getAssignedTrailEntriesApex', JSON.stringify(error));
      this.error = error;
    }
    if (data){
      console.log('assignment count came in');
      let {
        numBadgeAssignments,
        numTrailmixAssignments
      } = data;

      this.sectionTitle = this.determineSectionTitle(
        this.badgesOrTrailmixes,
        numBadgeAssignments,
        numTrailmixAssignments
      );

      // this.totalAssignments = numBadgeAssignments + numTrailmixAssignments;
      this.hasAnyAssignments = numBadgeAssignments + numTrailmixAssignments > 0;
    }
  }

  /**
   * Determines the trail entries
   */
  @wire(getAssignedTrailEntriesApex, {
    rowOffset:'$currentPage',
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
      console.log('data received');
      this.assignedTrailEntries = results;

      //-- reset to page 0
      this.currentPage = 0;
    }
  }

  //-- refresh wire
  refreshAssignments(){
    refreshApex(this.assignedTrailEntries);
  }

  get trailheadLinkLabel(){
    return TRAILHEAD_LINK_LABEL;
  }
  get trailheadLinkAddress(){
    return TRAILHEAD_LINK_ADDRESS;
  }

  next(){
    if (this.hasNext()){
      this.currentPage += 1;
    }
  }
  previous(){
    if (this.hasPrevious()){
      this.currentPage -= 1;
    }
  }
  
  /** whether any pagination buttons should be shown */
  get shouldShowPagination(){
    return this.hasPrevious || this.hasNext;
  }
  /** whether there is a previous page */
  get hasPrevious() {
    return this.currentPage > 0;
  }
  /** whether there is a next page */
  get hasNext(){
    let endPage = this.currentPage * this.paginationSize + this.paginationSize;
    return endPage < this.assignedTrailEntries.length;
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
      sectionTitle = `Assigned Badges(${badgeAssignmentCount}) & Trailmixes(${trailmixAssignmentCount})`;
		} else if(badgesOrTrailmixes==="TrailMix"){
      sectionTitle = `Assigned TrailMixes(${trailmixAssignmentCount})`;
		} else {//-- assume badges
      sectionTitle = `Assigned Badges(${badgeAssignmentCount})`;
    }
    return sectionTitle;
  }
}
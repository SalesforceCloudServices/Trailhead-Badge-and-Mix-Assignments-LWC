//-- include custom javascript types for tooltip / vscode intellisense
// require('../th_trailheadAssignments/__types__/CustomTypes')

import { LightningElement, track, api } from 'lwc';

// import getRecommendedEntries from '@salesforce/apex/TH_Contextual_Badge_Recommend.getRecommendedEntries';
import getAllRecommendTrailEntriesApex from '@salesforce/apex/TH_Recommendations.getRecommendedEntries';
import Paginator from 'c/th_paginator';

/** the address to send someone to Trailhead or myTrailhead */
import TRAILHEAD_LINK_ADDRESS from '@salesforce/label/c.th_trailhead_link_address';
/** the name to show for the link to Trailhead or myTrailhea */
import TRAILHEAD_LINK_LABEL from '@salesforce/label/c.th_trailhead_link_label';

//-- types of assignments to show
import TYPE_BADGE from '@salesforce/label/c.th_TrailheadTypeBadge';
import TYPE_TRAILMIX from '@salesforce/label/c.th_TrailheadTypeTrailmix';
import TYPE_BOTH from '@salesforce/label/c.th_TrailheadTypeBoth';

//-- icons to show based on type of items to show
const ICON_BADGE = 'custom:custom48';
const ICON_TRAILMIX = 'custom:custom78';
const ICON_BOTH = 'custom:custom78';

/**
 * Component to list the trailhead recommendations for a given user and record.
 **/
export default class Tl_trailheadAssignments extends LightningElement {
  //-- properties (see - meta.xml)
  /** @type {string} - record identifier */
  @api recordId;
  /** @type {string} - API Name of the current object */
  @api objectApiName;
  /** @type {number} - Number of records per page in results */
  @api paginationSize;
  /** @type {number} - Events occuring within this many days are considered upcoming */
  @api upcomingEventWindow;

  /** @type {date} - last known modified date of the record **/
  recordLastModifiedDate;

  //-- private attributes

  /** @type {Error} - the last error encountered (for debugging) */
  @track error;

  //-- @TODO: investigate way to directly link to paginator instead
  //-- note that changes are only tracked at the paginator level
  //-- so paginator.hasNext and paginator.hasPrevious within getters / setters
  //-- work initially but won't work afterwards, because paginator doesn't change.

  /** @type {Paginator} - Pagingator that determines the pages and records per page */
  @track recordPaginator;

  /** @type {boolean} - whether there is a previous page */
  // @track hasPrevious;
  @api get hasPrevious() {
    return this.recordPaginator.hasPrevious;
  }
  /** @type {boolean} - whether there is a next page */
  // @track hasNext;
  @api get hasNext(){
    return this.recordPaginator.hasNext;
  }
  
  /** @type {AssignmentEntry[]} - 'current page' of the assignments **/
  // @track paginatedTrailEntries = {};
  @api get paginatedTrailEntries(){
    return this.recordPaginator.paginatedValues;
  }

  /** @type {boolean} - Whether to show the Add button on entries of the list. */
  @api btnAddEligible;

  /** @type {boolean} - Whether to show the Share button on entries of the list. */
  @api btnShareEligible;

  //-- NOTE: the following COULD be getters/setters
  //-- but they would be continually re-evaluated.
  //-- instead of getting calculated only on data load, and cached thereafter.

  /** @type {boolean} - Whether there are any recommendations */
  @track hasAnyRecommends;
  /** @type {string} - the icon to use for the section **/
  @track sectionIcon;
  /** @type {string} - the title to use for the section **/
  @track sectionTitle;



  //-- getter setters
 
  /** Provide a link to Trailhead using the custom label */
  @api
  get trailheadLinkLabel(){
    return TRAILHEAD_LINK_LABEL;
  }
  /** Provide a link to Trailhead using the custom label */
  @api
  get trailheadLinkAddress(){
    return TRAILHEAD_LINK_ADDRESS;
  }
  
  /** whether any pagination buttons should be shown */
  @api
  get shouldShowPagination(){
    return (
      this.hasNext || this.hasPrevious
    );
  }

  /**
   * Determines the icon to show for the section
   * @param {string} badgesOrTrailmixes - (Badge|TrailMix|Both)
   * @visibility private
   * @returns String
   */
  @api
  determineSectionIcon(badgesOrTrailmixes){
    let sectionIcon = '';
    if(badgesOrTrailmixes===TYPE_BOTH){
      sectionIcon = ICON_BOTH;
    } else if(badgesOrTrailmixes===TYPE_TRAILMIX){
      sectionIcon = ICON_TRAILMIX;
    } else if(badgesOrTrailmixes===TYPE_BADGE){
      sectionIcon = ICON_BADGE;
    } else { //-- assume TYPE_BADGE
      sectionIcon = ICON_BADGE;
    }
    return sectionIcon;
  }



  //-- methods

  /**
   * Called when the component is initially created
   */
  connectedCallback(){
    //-- get current recommendations
    this.refreshRecommends();

    this.recordPaginator = new Paginator(null, this.paginationSize);
  }

  /**
   * Refresh the current counts
   * <p>Note: this must have access
   * to the exact response from the wire service to work.</p>
   */
  @api
  refreshRecommends(){
    this.captureGetRecommendTrailEntries(this.recordId);
  }

  /** Paginate to the next page */
  @api
  next(){
    if (this.hasNext){
      this.recordPaginator = this.recordPaginator.nextPaginator();
    }
  }
  /** Paginate to the previous page */
  @api
  previous(){
    if (this.hasPrevious){
      this.recordPaginator = this.recordPaginator.previousPaginator();
    }
  }

  /**
   * Determines the trail entries
   * @param {Id} recordId - the id of the record to find recommendations for (or null to get all recommendations)
   */
  captureGetRecommendTrailEntries(recordId){
    getAllRecommendTrailEntriesApex({recordId:recordId})
      .then(data => {
        this.hasAnyRecommends = data.length > 0;
        this.recordPaginator = new Paginator(data, this.paginationSize); 
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('error occurred captureGetRecommendTrailEntries:getRecommendTrailEntriesApex', JSON.stringify(error));
        this.error = error;
      });
  }

  /**
   * Called when the Lightning data service loads the record (or detects a change)
   * @param {CustomEvent} event - event from the lightning data service
   */
  handleLdsLoad(event){
    try {
      const recordLastModified = event.detail.records[this.recordId].lastModifiedDate;

      //-- set to the last modified date if not previously known
      if (!this.recordLastModifiedDate){
        this.recordLastModifiedDate = recordLastModified;
      }

      if(this.isLastModifiedDifferent(this.recordLastModifiedDate, recordLastModified)){
        // console.log('record change detected');
        this.recordLastModifiedDate = recordLastModified;
        this.refreshRecommends();
      }
    } catch(err){
      // eslint-disable-next-line no-console
      console.error(`error occurred on contextual recommend while loading the lightning data service:${this.recordId}`, JSON.stringify(err));
    }
  }

  /**
   * Determines if the last modified date has changed from the one last known
   * @param {string} lastKnownModifiedDate - last known modified date of a record
   * @param {string} lastModifiedDate - current last modified date
   * @returns {boolean} - whether the modified dates are known and are different (true) if null or both the same (false)
   */
  isLastModifiedDifferent(lastKnownModifiedDate, lastModifiedDate){
    if (!lastKnownModifiedDate || !lastModifiedDate){
      return false;
    }
    
    return (lastKnownModifiedDate !== lastModifiedDate);
  }

  /**
   * Called if the Lightning Data Service has an error in pulling in the record
   */
  handleLdsError(){
    // eslint-disable-next-line no-console
    console.error(`Lightning data service encountered an error when loading record:${this.recordId}`);
  }

  //-- pass the events from the internal components
  /**
   * Pass an event 
   * @param {LwcEvent} event - Event dispatched from a contained component
   */
  passEvent(event){
    // this.dispatchEvent(event);
    const eventClone = new CustomEvent(event.type, {detail:event.detail});
    this.dispatchEvent(eventClone);
  }
}
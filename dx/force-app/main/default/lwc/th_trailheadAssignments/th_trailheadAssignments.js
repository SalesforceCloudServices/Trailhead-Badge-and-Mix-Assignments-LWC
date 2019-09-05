//-- include custom javascript types for tooltip / vscode intellisense
// require('./__types__/CustomTypes')


import { LightningElement, track, api, wire } from 'lwc';

//-- pubsub to support enrolling in one component visually notifies the other components to refresh
import { registerListener as registerPubSubListener, unregisterAllListeners as unregisterAllPubSubListeners } from 'c/th_pubsub';
//-- support page reference within the pubsub
import { CurrentPageReference } from 'lightning/navigation';

//-- allow the wire to refresh the request with the latest values
import {refreshApex} from '@salesforce/apex';

// import getAssignmentCountApex from '@salesforce/apex/TH_Assignments.getAssignmentCount';
// import getAssignedTrailEntriesApex from '@salesforce/apex/TH_Assignments.getAssignedTrailEntries';
import getAllAssignedTrailEntriesApex from '@salesforce/apex/TH_Assignments.getAllAssignedTrailEntries';

/** the address to send someone to Trailhead */
import TRAILHEAD_LINK_ADDRESS from '@salesforce/label/c.th_trailhead_link_address';
/** the name to show for the link to Trailhead */
import TRAILHEAD_LINK_LABEL from '@salesforce/label/c.th_trailhead_link_label';
import Paginator from 'c/th_paginator';

//-- types of assignments to show
import TYPE_BADGE from '@salesforce/label/c.th_TrailheadTypeBadge';
import TYPE_TRAILMIX from '@salesforce/label/c.th_TrailheadTypeTrailmix';
import TYPE_BOTH from '@salesforce/label/c.th_TrailheadTypeBoth';



//-- constantts

//-- icons to show based on type of items to show
const ICON_BADGE = 'custom:custom48';
const ICON_TRAILMIX = 'custom:custom78';
const ICON_BOTH = 'custom:custom78';

//-- types of filters to support
const SHOW_ALL = 'All';
const SHOW_OVERDUE_ONLY = 'Overdue';
const SHOW_OVERDUE_AND_UPCOMING = 'Overdue+Upcoming';

//-- due dates filters
const FILTER_DATE_ALL = 355; //-- assumes it is in the next year
const FILTER_DATE_OVERDUE = 0;
// const FILTER_DATE_OVERDUE_AND_UPCOMING = 0; -- NA - based on due date of record

/** The event to dispatch when a new enrollment has been requested */
const EVENT_ENROLLMENT = 'enrollment';

/**
 * Component to list the trailhead assignments for a given user.
 **/
export default class Tl_trailheadAssignments extends LightningElement {
  
  /** @type {PageReference} track the current page for pubsub page reference checks */
  @wire(CurrentPageReference) pageRef;
  
  //-- properties (see - meta.xml)
  /** @type {string} - Should we include badges or trailmixes or both */
  @api badgesOrTrailmixes;
  /** @type {number} - Number of records per page in results */
  @api paginationSize;
  /** @type {number} - Events occurring within this many days are considered upcoming */
  @api upcomingEventWindow;
  /** @type {string} - Which types of assignments to show (ex: All, Overdue, Overdue+Upcoming) */
  @api dueDateFilter;

  /** @type {boolean} Whether to show the Share button on entries of the list. */
  @api btnShareEligible;

  /** @type {Error} - the last error encountered (for debugging) */
  @track error;

  //-- private attributes

  //-- note: the collections are required for refreshApex
  //-- see here for more information
  //-- https://developer.salesforce.com/docs/component-library/documentation/lwc/apex#data_apex__refresh_cache

  /** @type {AssignmentEntry[]} - collection of all the assignments (used for apexRefresh) **/
  @track assignedTrailEntries = {};

  //-- @TODO: investigate way to directly link to paginator instead
  //-- note that changes are only tracked at the paginator level
  //-- so paginator.hasNext and paginator.hasPrevious within getters / setters
  //-- work initially but won't work afterwards, because paginator doesn't change.

  /** @type {Paginator} - Paginator that determines which pages etc. **/
  @track recordPaginator;



  //-- NOTE: the following COULD be getters/setters
  //-- but they would be continually re-evaluated.
  //-- instead of getting calculated only on data load, and cached thereafter.

  /** @type {boolean} - Whether there are any assignments (true) or not (false) **/
  @track hasAnyAssignments;
  /** @type {string} - The icon to use for the section **/
  @track sectionIcon;
  /** @type {string} - The Title to use for this section **/
  @track sectionTitle;


  
  //-- wires

  /**
   * Determines the trail entries
   */
  @wire(getAllAssignedTrailEntriesApex, {
    whichType:'$badgesOrTrailmixes'
  })
  captureGetAssignedTrailEntries(results) {
    let { error, data } = results;
    if (error) {
      // eslint-disable-next-line no-console
      console.error('error occurred captureGetAssignedTrailEntries:getAssignedTrailEntriesApex', JSON.stringify(error));
      this.error = error;
    } else if (data) {
      this.assignedTrailEntries = results;

      //let dueDateFilter = 'All';
      //let dueDateFilter = 'Overdue';
      let filteredRecords = this.filterDueDate(data, this.dueDateFilter);

      this.hasAnyAssignments = filteredRecords.length > 0;

      this.recordPaginator = new Paginator(filteredRecords, this.paginationSize);

      let {badgeAssignmentCount, trailmixAssignmentCount} = this.determineAssignmentCounts(filteredRecords);

      //-- section icon is pre-set, now we only care about the assignments
      this.sectionTitle = this.determineSectionTitle(
        this.badgesOrTrailmixes,
        badgeAssignmentCount,
        trailmixAssignmentCount
      );
    }
  }



  //-- methods

  /**
   * Called when the component is initially created
   */
  connectedCallback(){
    this.sectionIcon = this.determineSectionIcon(this.badgesOrTrailmixes);
    this.sectionTitle = this.determineSectionTitle(this.badgesOrTrailmixes,0,0);

    this.recordPaginator = new Paginator(null, this.paginationSize);

    registerPubSubListener(EVENT_ENROLLMENT, this.refreshAssignments, this);
  }

  /**
   * Called when the component is removed from the page
   */
  disconnectedCallback(){
    //-- unsubscribe from listeners
    unregisterAllPubSubListeners(this);
  }

  /**
   * Refresh the current counts
   * <p>Note: this must have access
   * to the exact response from the wire service to work.</p>
   */
  @api
  refreshAssignments(){
    refreshApex(this.assignedTrailEntries);
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
   * Filters the list of assignments based on the filter selected.
   * @private
   * @param {array} listOfRecords - collection of assignments
   * @param {String} dueDateFilter - type of filter to apply
   */
  @api
  filterDueDate(listOfRecords, dueDateFilter){
    let dueDateNum = FILTER_DATE_ALL;

    if (dueDateFilter === SHOW_ALL){
      // dueDateNum = FILTER_DATE_ALL;
    } else if (dueDateFilter === SHOW_OVERDUE_ONLY){
      dueDateNum = FILTER_DATE_OVERDUE;
    } else if (dueDateFilter === SHOW_OVERDUE_AND_UPCOMING){
      dueDateNum = this.upcomingEventWindow;
    }
    return listOfRecords.filter(record => {
      return record.NumDaysUntilDue < dueDateNum;
    });
  }



  //-- getters / setters

  /**
   * whether there is a previous page
   * @returns {boolean}
   **/
  @api get hasPrevious() {
    return this.recordPaginator.hasPrevious;
  }
  // @track hasPrevious;

  /**
   * whether there is a next page
   * @returns {boolean}
   **/
  @api get hasNext(){
    return this.recordPaginator.hasNext;
  }
  // @track hasNext;

  /**
   * The 'current page' of the assignments.
   * @returns {AssignmentEntry[]}
   */
  @api get paginatedTrailEntries(){
    return this.recordPaginator.paginatedValues;
  }
  // @track paginatedTrailEntries = {};
  
  /**
   * Provide a link to Trailhead using the custom label
   * @type {string}
   */
  @api
  get trailheadLinkLabel(){
    return TRAILHEAD_LINK_LABEL;
  }
  /**
   * Provide a link to Trailhead using the custom label
   * @type {string}
   **/
  @api
  get trailheadLinkAddress(){
    return TRAILHEAD_LINK_ADDRESS;
  }
  
  /**
   * whether any pagination buttons should be shown
   * @type {boolean}
   */
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
   * @returns {string}
   */
  @api
  determineSectionIcon(badgesOrTrailmixes){
    let sectionIcon = '';
    if(badgesOrTrailmixes===TYPE_BOTH){
      sectionIcon = ICON_BOTH;
    } else if(badgesOrTrailmixes===TYPE_TRAILMIX){
      sectionIcon = ICON_TRAILMIX;
    } else { //-- assume TYPE_BADGE
      sectionIcon = ICON_BADGE;
    }
    return sectionIcon;
  }

  /**
   * Determines the title to show for the section
   * @private
   * @param {string} badgesOrTrailmixes - (Badge|TrailMix|Both)
   * @param {integer} badgeAssignmentCount - # of badges assigned
   * @param {integer} trailmixAssignmentCount - # of trailmixes assigned
   * @returns {string}
   */
  @api
  determineSectionTitle(badgesOrTrailmixes, badgeAssignmentCount, trailmixAssignmentCount){
    let sectionTitle = '';
    if(badgesOrTrailmixes===TYPE_TRAILMIX){
      sectionTitle = `Assigned Trailmixes (${trailmixAssignmentCount})`;
    } else if(badgesOrTrailmixes===TYPE_BADGE){
      sectionTitle = `Assigned Badges (${badgeAssignmentCount})`;
    } else {//-- assume TYPE_BADGE
      sectionTitle = `Assigned Badges (${badgeAssignmentCount}) & Trailmixes (${trailmixAssignmentCount})`;
    }
    return sectionTitle;
  }

  /**
   * Determines the assignment breakdown of a list of assignments
   * @private
   * @param {array} assignmentList 
   * @return {BadgeAssignmentCount}
   */
  @api
  determineAssignmentCounts(assignmentList){
    const results = {
      badgeAssignmentCount: 0,
      trailmixAssignmentCount: 0
    };

    if (assignmentList){
      assignmentList.forEach(assignment => {
        if (assignment.EntryType === TYPE_TRAILMIX){
          results.trailmixAssignmentCount++;
        } else if (assignment.EntryType === TYPE_BADGE){
          results.badgeAssignmentCount++;
        }
      });
    }

    return results;
  }
}
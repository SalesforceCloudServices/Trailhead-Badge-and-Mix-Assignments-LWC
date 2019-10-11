import { LightningElement, track, api } from 'lwc';

// import getRecommendedEntries from '@salesforce/apex/TH_Contextual_Badge_Recommend.getRecommendedEntries';
import getAllTrailEntriesApex from '@salesforce/apex/TH_Report_to_TEs.getReportEntries';
import Paginator from 'c/th_paginator';

/** the address to send someone to Trailhead or myTrailhead */
import TRAILHEAD_LINK_ADDRESS from '@salesforce/label/c.th_trailhead_link_address';
/** the name to show for the link to Trailhead or myTrailhea */
import TRAILHEAD_LINK_LABEL from '@salesforce/label/c.th_trailhead_link_label';

//-- types of assignments to show
import TYPE_BADGE from '@salesforce/label/c.th_TrailheadTypeBadge';
import TYPE_TRAILMIX from '@salesforce/label/c.th_TrailheadTypeTrailmix';
import TYPE_BOTH from '@salesforce/label/c.th_TrailheadTypeBoth';

export default class Th_ReportDisplay extends LightningElement {
/** @type {number} - Number of records per page in results */
@api paginationSize;
/** @type {number} - Events occuring within this many days are considered upcoming */
@api upcomingEventWindow;
/** @type {String} - Badge Developer Report Name */
@api badgeRepDevName;
/** @type {String} - Trailmix Developer Report Name */
@api trailmixRepDevName;
/** @type {String} - Compoment Display Title */
@api compTitle;
/** @type {Error} - the last error encountered (for debugging) */
@track error;
/** @type {Paginator} - Pagingator that determines the pages and records per page */
@track recordPaginator;
/** @type {boolean} - Whether there are any recommendations */
@track hasAnyTEs;
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
    this.captureGetTrailEntries(this.badgeRepDevName,this.trailmixRepDevName);
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
   * 
   */
  captureGetTrailEntries(badgeReportName, trailmixReportName){
    getAllTrailEntriesApex({badgeReportName:badgeReportName, trailmixReportName:trailmixReportName})
      .then(data => {
        this.hasAnyTEs = data.length > 0;
        this.recordPaginator = new Paginator(data, this.paginationSize); 
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('error occurred captureGetRecommendTrailEntries:getRecommendTrailEntriesApex', JSON.stringify(error));
        this.error = error;
      });
  }

  


}
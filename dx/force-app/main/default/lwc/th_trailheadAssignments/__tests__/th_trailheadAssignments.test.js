/** JEST Test for th_trailheadAssignments/__tests__/th_trailheadAssignments **/
import { createElement } from 'lwc';
import th_trailheadAssignments from 'c/th_trailheadAssignments';

import {registerLdsTestWireAdapter} from '@salesforce/wire-service-jest-util';
import getAllAssignedTrailEntriesApex from '@salesforce/apex/TH_Assignments.getAllAssignedTrailEntries';
const mockGetAllAssignedTrailEntries = registerLdsTestWireAdapter(getAllAssignedTrailEntriesApex);

const allAssignmentsData = require('./data/getAllAssignedTrailEntries.json');

describe('c-th_trailheadAssignments', () => {

  //-- boilerplate DOM reset
  afterEach(() => {
    while (document.body.firstChild){
      document.body.removeChild(document.body.firstChild);
    }
  });

  describe('can initiate correctly', () => {
    it('with the wire mock', () => {
      const element = createElement('c-th_trailheadAssignments', { is:th_trailheadAssignments });
      let elementSettings = {
        badgesOrTrailmixes : 'Both',
        paginationSize: 4,
        upcomingEventWindow: 7,
        dueDateFilter: 'All'
      };
      Object.assign(element, elementSettings);
      document.body.appendChild(element);

      //-- make sure we loaded the right set of data
      expect(allAssignmentsData.length).toBe(8);

      mockGetAllAssignedTrailEntries.emit(allAssignmentsData);

      let paginatedValues = element.paginatedTrailEntries;
      expect(paginatedValues.length).toBe(elementSettings.paginationSize);
      expect(paginatedValues).toEqual(expect.arrayContaining([
        expect.objectContaining({Id:allAssignmentsData[0].Id})
      ]));
      expect(paginatedValues).toEqual(expect.arrayContaining([
        expect.objectContaining({Id:allAssignmentsData[3].Id})
      ]));
    });

    it('has pagination setup correctly', () => {
      const element = createElement('c-th_trailheadAssignments', { is:th_trailheadAssignments });
      let elementSettings = {
        badgesOrTrailmixes : 'Both',
        paginationSize: 4,
        upcomingEventWindow: 7,
        dueDateFilter: 'All'
      };
      Object.assign(element, elementSettings);
      document.body.appendChild(element);

      //-- make sure we loaded the right set of data
      expect(allAssignmentsData.length).toBe(8);

      mockGetAllAssignedTrailEntries.emit(allAssignmentsData);

      //-- because we have assignments sent, we should have assignments.
      // expect(element.hasAnyAssignments).toBe(true);

      //-- we are on the first page so should not have anything previous
      expect(element.hasPrevious).toBe(false);

      //-- because there should be 
      expect(element.hasNext).toBe(true);

      // return PromiseRejectionEvent.resolve().then(() => {});
    });

    it('Filters for Upcoming+Overdue', () => {
      const element = createElement('c-th_trailheadAssignments', { is:th_trailheadAssignments });
      let elementSettings = {
        badgesOrTrailmixes : 'Both',
        paginationSize: 4,
        upcomingEventWindow: 7,
        dueDateFilter: 'Overdue+Upcoming'
      };
      Object.assign(element, elementSettings);
      document.body.appendChild(element);

      //-- make sure we loaded the right set of data
      expect(allAssignmentsData.length).toBe(8);

      mockGetAllAssignedTrailEntries.emit(allAssignmentsData);

      let paginatedValues = element.paginatedTrailEntries;
      expect(paginatedValues.length).toBe(4);

      //-- we are on the first page so should not have anything previous
      expect(element.hasPrevious).toBe(false);

      //-- because there should be 
      expect(element.hasNext).toBe(false);

      // return PromiseRejectionEvent.resolve().then(() => {});
    });

    it('Filters for Overdue-Only', () => {
      const element = createElement('c-th_trailheadAssignments', { is:th_trailheadAssignments });
      let elementSettings = {
        badgesOrTrailmixes : 'Both',
        paginationSize: 4,
        upcomingEventWindow: 7,
        dueDateFilter: 'Overdue'
      };
      Object.assign(element, elementSettings);
      document.body.appendChild(element);

      //-- make sure we loaded the right set of data
      expect(allAssignmentsData.length).toBe(8);

      mockGetAllAssignedTrailEntries.emit(allAssignmentsData);

      let paginatedValues = element.paginatedTrailEntries;
      expect(paginatedValues.length).toBe(3);

      //-- we are on the first page so should not have anything previous
      expect(element.hasPrevious).toBe(false);

      //-- because there should be 
      expect(element.hasNext).toBe(false);

      // return PromiseRejectionEvent.resolve().then(() => {});
    });

    it('and exposes custom settings correctly', () => {
      const element = createElement('c-th_trailheadAssignments', { is:th_trailheadAssignments });
      let elementSettings = {
        badgesOrTrailmixes : 'Both',
        paginationSize: 4,
        upcomingEventWindow: 7,
        dueDateFilter: 'All'
      };
      Object.assign(element, elementSettings);
      document.body.appendChild(element);

      expect(element.trailheadLinkLabel).not.toBeNull();
      expect(element.trailheadLinkAddress).not.toBeNull();
    });
  });

  describe('can determine the correct assignment counts', () => {
    it('can count badges', () => {
      const element = createElement('c-th_trailheadAssignments', { is:th_trailheadAssignments });
      let elementSettings = {
        badgesOrTrailmixes : 'Both',
        paginationSize: 4,
        upcomingEventWindow: 7,
        dueDateFilter: 'All'
      };
      Object.assign(element, elementSettings);
      document.body.appendChild(element);

      //-- make sure we loaded the right set of data
      expect(allAssignmentsData.length).toBe(8);

      mockGetAllAssignedTrailEntries.emit(allAssignmentsData);

      const assignmentCounts = element.determineAssignmentCounts(allAssignmentsData);
      expect(assignmentCounts).not.toBeNull();
      expect(assignmentCounts.badgeAssignmentCount).toBe(6);
      expect(assignmentCounts.trailmixAssignmentCount).toBe(2);
    });
  });

});

/** JEST Test for th_paginator/__tests__/th_paginator **/
// import { createElement } from 'lwc';
import Paginator from 'c/th_paginator';

describe('c-th_paginator', () => {

  //-- boilerplate DOM reset
  afterEach(() => {
    while (document.body.firstChild){
      document.body.removeChild(document.body.firstChild);
    }
  });

  describe('initializes correctly', () => {
    it('basic 20 collection initializes correctly', () => {
      const collection = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,18,19];
      const recordsPerPage = 10;
      const paginator = new Paginator(collection, recordsPerPage);
      //-- because we initialize with the collection, the collection length should be the same.
      expect(paginator.collection.length).toBe(collection.length);
      //-- because we just initilized with 20 items and page size of 10, we should have a next page.
      expect(paginator.hasNext).toBe(true);
      //-- because we just started there should be no previous
      expect(paginator.hasPrevious).toBe(false);
      //-- pageSize from the paginator must match what we initialized
      expect(paginator.recordsPerPage).toBe(recordsPerPage);
      //-- there should be 2 pages
      expect(paginator.numPages).toBe(2);
      
      const paginatedValues = paginator.paginatedValues;
      //-- there should be 10 paginated values returned
      expect(paginatedValues.length).toBe(recordsPerPage);
      expect(paginatedValues).toContain(0);
      expect(paginatedValues).toContain(5);
      expect(paginatedValues).toContain(9);
      expect(paginatedValues).not.toContain(10);
    });

    it('basic 14 collection initializes correctly', () => {
      const collection = [0,1,2,3,4,5,6,7,8,9,10,11,12,13];
      const recordsPerPage = 10;
      const paginator = new Paginator(collection, recordsPerPage);
      //-- because we initialize with the collection, the collection length should be the same.
      expect(paginator.collection.length).toBe(collection.length);
      //-- because we just initilized with 20 items and page size of 10, we should have a next page.
      expect(paginator.hasNext).toBe(true);
      //-- because we just started there should be no previous
      expect(paginator.hasPrevious).toBe(false);
      //-- pageSize from the paginator must match what we initialized
      expect(paginator.recordsPerPage).toBe(recordsPerPage);
      //-- there should be 2 pages
      expect(paginator.numPages).toBe(2);
      
      const paginatedValues = paginator.paginatedValues;
      //-- there should be 10 paginated values returned
      expect(paginatedValues.length).toBe(recordsPerPage);
      expect(paginatedValues).toContain(0);
      expect(paginatedValues).toContain(5);
      expect(paginatedValues).toContain(9);
      expect(paginatedValues).not.toContain(10);
    });
  });

  describe('can move between pages', () => {
    it('for a 14 collection list with pagination of 10', () => {
      const collection = [0,1,2,3,4,5,6,7,8,9,10,11,12,13];
      const recordsPerPage = 10;
      const paginator = new Paginator(collection, recordsPerPage);

      let numPages = paginator.numPages;
      expect(numPages).toBe(2);

      let previous = paginator.hasPrevious;
      //-- because we just started there must not be a previous
      expect(previous).toBe(false);
      let next = paginator.hasNext;
      //-- because we just started there must be a next
      expect(next).toBe(true);

      next = paginator.next();
      //-- we established there is a next, so moving next should be true
      expect(next).toBe(true);

      let paginatedValues = paginator.paginatedValues;
      expect(paginatedValues).not.toBe(null);
      expect(paginatedValues).toContain(10);
      expect(paginatedValues).toContain(13);
      expect(paginatedValues).not.toContain(0);
      expect(paginatedValues).not.toContain(9);
      
      next = paginator.hasNext;
      //-- because we are on the last page, there should not be a next
      expect(next).toBe(false);
      previous = paginator.hasPrevious;
      //-- because we are on the last page, there should be a previous page
      expect(previous).toBe(true);

      next = paginator.next();
      //-- we can't move next if on the last page
      expect(next).toBe(false);

      //-- even though we moved next, we should not have moved the collection
      paginatedValues = paginator.paginatedValues;
      expect(paginatedValues).toContain(10);
      expect(paginatedValues).toContain(13);
      expect(paginatedValues).not.toContain(0);
      expect(paginatedValues).not.toContain(9);

      previous = paginator.previous();
      //-- we established we are on the last page, so we can move back
      expect(previous).toBe(true);

      next = paginator.hasNext;
      //-- because we are on the first page again, there should be a next
      expect(next).toBe(true);
      previous = paginator.hasPrevious;
      //-- because we are on the first page again, there must not be a previous
      expect(previous).toBe(false);
    });
  });

  describe('can clone correctly for LWC', () => {
    it('from a simple clone call', () => {
      const collection = [0,1,2,3,4,5,6,7,8,9,10,11,12,13];
      const recordsPerPage = 10;
      const paginator = new Paginator(collection, recordsPerPage);

      expect(paginator.collection.length).toBe(collection.length);

      //-- we should be able to go to the next page
      expect(paginator.hasNext).toBe(true);
      expect(paginator.next()).toBe(true);

      const clonedPaginator = paginator.clone();
      expect(paginator).not.toBe(clonedPaginator);
      
      let paginatedValues = paginator.paginatedValues;
      expect(paginatedValues).not.toBe(null);
      expect(paginatedValues).toContain(10);
      expect(paginatedValues).toContain(13);
      expect(paginatedValues).not.toContain(0);
      expect(paginatedValues).not.toContain(9);

      expect(clonedPaginator.collection.length).toBe(collection.length);
      expect(clonedPaginator.pageNumber).toBe(paginator.pageNumber);
      expect(clonedPaginator.hasNext).toBe(paginator.hasNext);
      expect(clonedPaginator.hasPrevious).toBe(paginator.hasPrevious);
    });

    it('paginates to a new object when going to the next page', () => {
      const collection = [0,1,2,3,4,5,6,7,8,9,10,11,12,13];
      const recordsPerPage = 10;
      const paginator = new Paginator(collection, recordsPerPage);

      expect(paginator.collection.length).toBe(collection.length);

      expect(paginator.pageNumber).toBe(0);

      const clonedPaginator = paginator.nextPaginator();
      //expect(clonedPaginator.pageNumber).toBe(paginator.pageNumber);

      //-- we should be able to go to the next page
      expect(paginator.hasNext).toBe(true);
      expect(paginator.next()).toBe(true);
      
      expect(clonedPaginator).not.toBe(null);
      expect(clonedPaginator).not.toBe(paginator);

      expect(paginator.pageNumber).toBe(1);
      expect(clonedPaginator.pageNumber).toBe(1);
      
      expect(clonedPaginator.collection.length).toBe(collection.length);
      expect(clonedPaginator.pageNumber).toBe(paginator.pageNumber);
      expect(clonedPaginator.hasNext).toBe(paginator.hasNext);
      expect(clonedPaginator.hasPrevious).toBe(paginator.hasPrevious);
    });

    it('paginates to a new object when going to the previous page', () => {
      const collection = [0,1,2,3,4,5,6,7,8,9,10,11,12,13];
      const recordsPerPage = 10;
      const paginator = new Paginator(collection, recordsPerPage);

      expect(paginator.collection.length).toBe(collection.length);

      paginator.next();

      expect(paginator.pageNumber).toBe(1);

      const clonedPaginator = paginator.previousPaginator();
      
      //-- we should be able to go to the next page
      expect(paginator.hasPrevious).toBe(true);
      expect(paginator.previous()).toBe(true);
      
      expect(clonedPaginator).not.toBe(null);
      expect(clonedPaginator).not.toBe(paginator);

      expect(paginator.pageNumber).toBe(0);
      expect(clonedPaginator.pageNumber).toBe(0);
      
      expect(clonedPaginator.collection.length).toBe(collection.length);
      expect(clonedPaginator.pageNumber).toBe(paginator.pageNumber);
      expect(clonedPaginator.hasNext).toBe(paginator.hasNext);
      expect(clonedPaginator.hasPrevious).toBe(paginator.hasPrevious);
    });
  });
});
/** JEST Test for tl_paginator/__tests__/tl_paginator **/
import { createElement } from 'lwc';
import Paginator from 'c/tl_paginator';

describe('c-tl_paginator', () => {

  //-- boilerplate DOM reset
  afterEach(() => {
    while (document.body.firstChild){
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('basic 20 collection initializes correctly', () => {
    const collection = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,18,19];
    const recordsPerPage = 10;
    const paginator = new Paginator(collection, recordsPerPage);
    //-- because we initialize with the collection, the collection length should be the same.
    expect(paginator.collection.length).toBe(collection.length);
    //-- because we just initilized with 20 items and page size of 10, we should have a next page.
    expect(paginator.hasNext()).toBe(true);
    //-- because we just started there should be no previous
    expect(paginator.hasPrevious()).toBe(false);
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
    expect(paginator.hasNext()).toBe(true);
    //-- because we just started there should be no previous
    expect(paginator.hasPrevious()).toBe(false);
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

  it('next page for a 14 collection', () => {
    const collection = [0,1,2,3,4,5,6,7,8,9,10,11,12,13];
    const recordsPerPage = 10;
    const paginator = new Paginator(collection, recordsPerPage);

    let numPages = paginator.numPages;
    expect(numPages).toBe(2);

    let previous = paginator.hasPrevious();
    //-- because we just started there must not be a previous
    expect(previous).toBe(false);
    let next = paginator.hasNext();
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
    
    next = paginator.hasNext();
    //-- because we are on the last page, there should not be a next
    expect(next).toBe(false);
    previous = paginator.hasPrevious();
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

    next = paginator.hasNext();
    //-- because we are on the first page again, there should be a next
    expect(next).toBe(true);
    previous = paginator.hasPrevious();
    //-- because we are on the first page again, there must not be a previous
    expect(previous).toBe(false);

  });

});
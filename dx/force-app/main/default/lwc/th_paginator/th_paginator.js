/**
 * A basic component that paginates an array.
 */
export default class Paginator {
  /**
   * Initializes the paginator
   * @param {array} collection - an array to iterate over
   */
  constructor(collection, pageSize){
    this._collection = [];
    this._pageNumber = 0;

    this.reInitialize(collection, pageSize);
  }

  /**
   * Initializes the paginator
   * @param {array} collection - collection of records to iterate over
   * @param {integer} pageSize - the number of records to show per page.
   */
  reInitialize(collection, pageSize){
    this.recordsPerPage = pageSize;
    this.collection = collection;
  }

  /**
   * Collection of all records we will paginate within.
   */
  set collection(val){
    if (!val || (typeof val.length) === 'undefined'){
      val = [];
    }
    this._collection = val;

    this.pageNumber = 0;
  }
  get collection(){
    return this._collection;
  }

  /**
   * Number of records per page.
   * (Cannot be below 1)
   */
  set recordsPerPage(val){
    if (val < 1){
      val = 1;
    }
    this._recordsPerPage = val;
  }
  get recordsPerPage(){
    return this._recordsPerPage;
  }

  /**
   * Zero based page index
   * (cannot be below 0)
   */
  set pageNumber(val){
    if (val < 0){
      val = 0;
    } else if (this._offsetIndex )
    this._pageNumber = val;
  }
  get pageNumber(){
    return this._pageNumber;
  }

  /**
   * Determines the last viable page
   * @returns {integer}
   */
  get numPages(){
    return Math.ceil(this._collection.length / this._recordsPerPage);
  }

  /**
   * Gets the records for the current page.
   * (Based on the current page)
   */
  get paginatedValues(){
    //-- assumes the collection is never null
    return this._collection.slice(this._offsetIndex, this._offsetIndex + this._recordsPerPage);
  }

  /**
   * Determines if there is a next page
   * @returns {boolean}
   */
  hasPrevious(){
    return this._pageNumber > 0;
  }

  /**
   * Determines if there is a next page
   * @returns {boolean}
   */
  hasNext(){
    return this._offsetIndex + this._recordsPerPage < this._collection.length;
  }

  /**
   * Moves to the previous page
   * @returns (array) - records of the page
   */
  previous(){
    if (!this.hasPrevious()){
      return false;
    }
    this._pageNumber = this._pageNumber-1;
    return true;
  }

  next(){
    if (!this.hasNext()){
      return false;
    }
    this._pageNumber = this._pageNumber+1;
    return true;
  }

  //-- private

  /**
   * The offset of the starting item of the current page
   * @visibility private
   */
  get _offsetIndex(){
    return this._pageNumber * this._recordsPerPage;
  }
}

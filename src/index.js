'use strict';

/**
 * Represents an index of all posts.
 * @constructor
 * @return {Index}
 */
var Index = function() {
  this.index    = [];
  this.isSorted = true;
  this.pubDate  = new Date();
  return this;
};

/**
 * Remove all elements from index
 * @return {Index} [description]
 */
Index.prototype.clear = function() {
  this.isSorted = false;
  this.index = [];
  return this;
};

/**
 * Add a single post to index.
 * @param  {Post}  post [description]
 * @return {Index}      [description]
 */
Index.prototype.push = function(post) {
  this.isSorted = false;
  this.index.push(post);
  return this;
};

/**
 * Add multiple posts to index.
 * @param  {Array} posts [description]
 * @return {Index}       [description]
 */
Index.prototype.pushArray = function(posts) {
  this.isSorted = false;
  this.index = posts;
  return this;
};

/**
 * Sort all items by `meta.Created`
 * @return {Index} [description]
 */
Index.prototype.sortIndex = function() {
  this.index.sort(function(a,b){
    if (a.meta.Created.timestamp < b.meta.Created.timestamp) {
      return 1;
    } else if (a.meta.Created.timestamp > b.meta.Created.timestamp) {
      return -1;
    }
    return 0;
  });
  this.isSorted = true;
  return this;
};

/**
 * Remove all items form index which have a future timestamp.
 * @return {Number} of items removed
 */
Index.prototype.removeFutureItems = function() {
  if (!this.isSorted) {
    this.sortIndex();
  }
  var now   = Math.round(new Date().getTime() / 1000);
  var count = 0, i;
  for(i = 0; i < this.index.length; i++) {
    if (this.index[i].meta.Created.timestamp > now) {
      count++;
    } else {
      break;
    }
  }
  if (count) {
    this.index.splice(0,count);
  }
  return count;
};

/**
 * [makeNextPrev description]
 * @return {Index} [description]
 */
Index.prototype.makeNextPrev = function() {
  if (!this.isSorted) {
    this.sortIndex();
  }
  var i;
  for(i = 0; i < this.index.length; i++) {
    if (i > 0 && this.index[i-1]) {
      this.index[i].prev = this.index[i-1].meta;
    }
    if (i < this.index.length -1 && this.index[i+1]) {
      this.index[i].next = this.index[i+1].meta;
    }
  }
  return this;
};

/**
 * Get all posts, sorted by date.
 * @param  {Number} i Only return i results. If left empty, all results will be returned.
 * @return {Array}    [description]
 */
Index.prototype.getPosts = function(i) {
  if (!this.isSorted) {
    this.sortIndex();
  }
  return i ? this.index.slice(0,i) : this.index;
};

/**
 * [getTags description]
 * @return {Array} [description]
 */
Index.prototype.getTags = function() {
  if (!this.isSorted) {
    this.sortIndex();
  }
  var tags = {};
  this.index.forEach(function(post){
    if (post.meta.Tags) {
      post.meta.Tags.forEach(function(tag){
        if (!tags[tag.id]) {
          tags[tag.id] = tag;
          tags[tag.id].index = new Index();
        }
        tags[tag.id].index.push(post);
      });
    }
  });
  return tags;
};

/**
 * [getAuthors description]
 * @return {Array} [description]
 */
Index.prototype.getAuthors = function() {
  if (!this.isSorted) {
    this.sortIndex();
  }
  var authors = {};
  this.index.forEach(function(post){
    if (post.meta.AuthorName) {
      if (!authors[post.meta.AuthorName]) {
        authors[post.meta.AuthorName] = {
          name:   post.meta.AuthorName,
          urlObj: post.meta.AuthorUrlObj,
          index:  new Index()
        };
      }
      authors[post.meta.AuthorName].index.push(post);
    }
  });
  return authors;
};

/**
 * [getGeoArticles description]
 * @return {Array}      [description]
 */
Index.prototype.getGeoArticles = function () {
  //return new Index().pushArray(
    return this.index.filter(function(post) {
      return (post.meta.Latitude || post.meta.Longitude);
    });
  //);
};

/**
 * Get whole index, split up into separate pages.
 * @param  {Number}  itemsPerPage [description]
 * @param  {Boolean} reverse      [description]
 * @return {Array}                [description]
 */
Index.prototype.getPagedPosts = function(itemsPerPage, reverse) {
  if (!this.isSorted) {
    this.sortIndex();
  }
  if (!itemsPerPage) {itemsPerPage = 10;}
  var pages = [], page = 0, newIndex = this.index, currentSlice = [];
  if (reverse) {
    newIndex = newIndex.reverse();
  }
  do {
    page ++;
    currentSlice = newIndex.slice(itemsPerPage * (page-1),itemsPerPage * page);
    if (reverse) {
      currentSlice = currentSlice.reverse();
    }
    pages.push(currentSlice);
  } while (page * itemsPerPage < this.index.length);
  return pages;
};

/**
 * Get meta data for a single page.
 * @param  {Number}  curPage [description]
 * @param  {Number}  maxPage [description]
 * @param  {Boolean} reverse [description]
 * @param  {String}  path    [description]
 * @return {Object}          [description]
 */
Index.prototype.getPageData = function(curPage, maxPage, reverse, path) {
  path = path || '';
  return {
    currentUrl: this.getPageName(curPage, maxPage, reverse, path),
    nextUrl: this.getPageName(curPage+1, maxPage, reverse, path),
    prevUrl: this.getPageName(curPage-1, maxPage, reverse, path),
    currentPage: (curPage+1),
    nextPage: ((curPage+2 < maxPage) ? curPage+2 : null),
    prevPage: ((curPage > 0) ? curPage : null),
    maxPages: maxPage
  };
};

/**
 * Get filename of current page.
 * @param  {Number}  curPage [description]
 * @param  {Number}  maxPage [description]
 * @param  {Boolean} reverse [description]
 * @param  {String}  path    [description]
 * @return {String}          [description]
 */
Index.prototype.getPageName = function(curPage, maxPage, reverse, path) {
  curPage ++;
  if (curPage <= 0 || curPage > maxPage) {
    return null;
  } else if ((!reverse && curPage === 1) || (reverse && curPage === maxPage)) {
    return path + 'index.html';
  } else {
    return path + 'index-' + curPage + '.html';
  }
};



module.exports = Index;

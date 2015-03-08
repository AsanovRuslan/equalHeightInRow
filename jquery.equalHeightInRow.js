/***
 *
 * jquery.equalHeightInRow v2.0
 * The jQuery plugin for equal height of the elements in the row
 * Asanov Ruslan //github.com/AsanovRuslan
 * Released under the MIT license - http://opensource.org/licenses/MIT

 * EXAMPLE
 * $('.block').equalHeightInRow();
 *
 * Equal height internal child elements
 * $('.block').equalHeightInRow({ child: ['.child1,.child2']});
 *
 ***/

;(function( $ ) {

    var methods = {

        /**
         * Handler load images
         * @param {object} image
         * @param {object} deferred
         * @returns {object} - Deferred object
         */
        imageLoad : function( image, deferred ) {

            var _this = image.get(0);

            image.each(function() {

                if( image.is('img') ) {
                    image.one("load", function() {
                        // Notifies that loading image is completed
                        deferred.notify();
                    });
                    // If image is not loaded
                    if( (!_this.complete) || (typeof _this.naturalWidth !== "undefined" && _this.naturalWidth === 0) ) {
                        return false;
                    } else {
                        image.trigger('load');
                    }
                }

            });

            return deferred;

        },

        /**
         * Handler load row
         * @param {object} row - line items
         * @returns {object} - Deferred object
         */
        rowLoad : function( row ) {

            var rowDeferred = $.Deferred(function() {
                this.count = 0;
            });
            var rowLength = row.length;

            row.each(function() {

                var $this         = $(this);
                var images        = $this.find('img');
                var imagesLength  = images.length;
                var imageDeferred = $.Deferred(function() {
                    this.count = 0;
                });

                imageDeferred.progress(function() {
                    imageDeferred.count++;
                    // If the loading images in a row completed
                    if( imageDeferred.count == imagesLength ) {
                        imageDeferred.resolve();
                    }
                }).always(function() {
                    // Notifies that loading image in block is completed
                    setTimeout(function() {
                        rowDeferred.notify();
                    }, 0)

                });

                // Process each image individually
                images.each(function() {
                    methods.imageLoad($(this), imageDeferred);
                });

            });

            return rowDeferred.progress(function() {
                rowDeferred.count++;
                // Notifies that loading image in row is completed
                if( rowDeferred.count == rowLength ) {
                    rowDeferred.resolve();
                }
            }).promise();

        },

        /**
         * Count elements in a row
         * @param {object} elements
         * @param {boolean} forEachRow
         * @returns {*}
         */
        countElementInRow : function( elements, forEachRow ) {

            var count       = 0;
            var positionTop = elements.eq(0).position().top;

            if( forEachRow ) {
                var countArray = [];

                elements.each(function( index ) {

                    if( $(this).position().top > positionTop ) {
                        positionTop = elements.eq(index).position().top;
                        countArray.push(count);
                        count = 0;
                    }

                    count++;

                });

                // last row
                countArray.push(count);

                // return the number of elements in a row
                return countArray;
            }

            elements.each(function( index ) {
                if( $(this).position().top > positionTop ) {
                    count = index;
                    return false;
                }
            });

            return count;
        },

        /**
         * Get max height
         * @param elements
         * @returns {number}
         */
        getMaxHeight : function( elements ) {

            var height     = 0;
            var eachHeight = 0;

            // Resetting height elements for real values
            elements.css({
                'height'     : '',
                'min-height' : 0
            });

            elements.each(function() {

                eachHeight = $(this).outerHeight();

                if( eachHeight > height ) {
                    height = eachHeight;
                }

            });

            return height;
        },

        /**
         * Set height
         * @param elements
         * @param height
         * @returns {{elements: {object}, height: {number}}}
         */
        setHeight : function( elements, height ) {

            if( elements.eq(0).css('display') == "table-cell" ) {
                elements.css('height', height);
            } else {
                elements.css('min-height', height);
            }

            return {
                elements : elements,
                height   : height
            }

        }

    };

    $.fn.equalHeightInRow = function( options ) {

        var settings = $.extend({

            // Child elements. Example ['.child1','.child2']
            child           : [],

            // Apply for each row
            eachRow         : false,

            // Execute after full page load
            windowLoad      : false,

            // Reset on full page load, callback "onLoad" not call
            windowLoadReset : false,

            // Apply only child
            applyOnlyChild  : false,

            // Set custom parent
            parent          : false,

            //CALLBACKS

            // Before assigning height in the row
            onRowBefore     : function() {},

            // After assigning height in the row
            onRowAfter      : function() {},

            // Before the resize event
            onResizeBefore  : function() {},

            // After the resize event
            onResizeAfter   : function() {},

            // Executes immediately after plugin is fully loaded
            onLoad          : function() {}


        }, options);
        
        var element       = this;
        var wrap          = settings.parent ? $(element).closest(settings.parent) : $(element).parent();
        var pluginLoading = false;


        if( !element.length ) {
            return false;
        }

        function init() {

            // Loop each parent elements
            wrap.each(function() {

                var setup = {
                    thisWrap    : $(this),
                    thisElement : $(this).find(element),
                    rowCount    : 1
                };

                // Amount elements in a row
                setup.amountInRow = methods.countElementInRow(setup.thisElement, settings.eachRow) || 0;

                // If needed calculate for each line
                if( settings.eachRow ) {

                    var count   = 1;
                    var current = 0;
                    var el      = [];

                    setup.thisElement.each(function( index ) {

                        // Add each line item in the array
                        el.push(this);

                        // If you are on the last item in a row 
                        // or if it is the last element in the parent
                        if( count == setup.amountInRow[current] || !setup.thisElement[index + 1] ) {

                            var $el = $(el);

                            settings.onRowBefore($el);

                            methods.rowLoad($el).always(function() {

                                // First, set the height of the child elements
                                for( var i = 0; i < settings.child.length; i++ ) {
                                    methods.setHeight(
                                        $el.find(settings.child[i]), 
                                        methods.getMaxHeight($el.find(settings.child[i]))
                                    );
                                }

                                // Sets the height the element itself
                                if( !settings.applyOnlyChild ) {
                                    methods.setHeight($el, methods.getMaxHeight($el));
                                }


                                settings.onRowAfter($el);

                            });

                            // Clear the array elements in the jump to a new line
                            el = [];
                            count = 0;
                            current++;

                        }

                        count++;

                    });


                    return true;

                } else {

                    // Amount row in a parent
                    setup.rowCount = Math.ceil(setup.thisElement.length / setup.amountInRow);


                    // If the amount of rows > 1
                    if( setup.rowCount > 1 ) {

                        var el = [];

                        setup.thisElement.each(function( index ) {

                            // Add each line item in the array
                            el.push(this);

                            // If you are on the last item in a row
                            // or if it is the last element in the parent
                            if( (index + 1) % setup.amountInRow == 0 || !setup.thisElement[index + 1] ) {

                                var $el = $(el);

                                settings.onRowBefore($el);

                                methods.rowLoad($el).always(function() {

                                    // First, set the height of the child elements
                                    for( var i = 0; i < settings.child.length; i++ ) {
                                        methods.setHeight(
                                            $el.find(settings.child[i]), 
                                            methods.getMaxHeight($el.find(settings.child[i]))
                                        );
                                    }

                                    // Sets the height the element itself
                                    if( !settings.applyOnlyChild ) {
                                        methods.setHeight($el, methods.getMaxHeight($el));
                                    }

                                    settings.onRowAfter($el);

                                });

                                // Clear the array elements in the jump to a new line
                                el = [];

                            }

                        });

                        return true;

                    } else if( setup.rowCount == 1 ) { // If the amount of rows == 1

                        settings.onRowBefore(setup.thisElement);

                        methods.rowLoad($el).always(function() {

                            // First, set the height of the child elements
                            for( var i = 0; i < settings.child.length; i++ ) {
                                methods.setHeight(
                                    setup.thisWrap.find(settings.child[i]), 
                                    methods.getMaxHeight(setup.thisWrap.find(settings.child[i]))
                                );
                            }

                            // Sets the height the element itself
                            methods.setHeight(
                                setup.thisElement, 
                                methods.getMaxHeight(setup.thisWrap.find(setup.thisElement))
                            );

                            settings.onRowAfter(setup.thisElement);

                        });

                    }

                }


            });

            // That did not work when you restart
            if( !pluginLoading ) {
                settings.onLoad(element);
                pluginLoading = true;
            }

        }

        if( settings.windowLoad ) {
            $(window).on('load', init);
        } else {
            
            init();
            
            if( settings.windowLoadReset ) {
                $(window).on('load', init);
            }
            
        }
        
        // Restarting when resize
        $(window).on('resize orientationchange', function() {
            settings.onResizeBefore(element);
            init();
            settings.onResizeAfter(element);

        });

        return element;

    };

})(jQuery);

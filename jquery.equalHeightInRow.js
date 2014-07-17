/***
*
* jquery.equalHeightInRow v1.0
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

;(function ( $ ) {

    var method = {

        // Count elements in a row
        countElementInRow: function ( wrap, element ) {
            return Math.floor(wrap.width() / wrap.find(element).eq(0).outerWidth(true));
            
        },

        // Get max height of the element
        getMaxHeight: function ( element ) {

            var height = 0;

            // Resetting height elements for real values
            element.css({
                'height': '',
                'min-height': 0
            });

            element.each(function() {

                if ( $(this).height() > height ) {
                    height = $(this).height();
                };

            });

            return height;
        },

        // Set height
        setHeight: function ( element, height ) {

            if ( element.eq(0).css('display') == "table-cell" ) {
                element.css('height', height);
            } else {
                element.css('min-height', height);
            };

            return {
                element: element,
                height: height
            }
            
        }

    };

    $.fn.equalHeightInRow = function ( options ) {

        var settings = $.extend({

            // Child elements. Example ['.child1','.child2']
            child: [],

            // Execute after full page load
            windowLoad: false,

            // Reset on full page load, callback "onLoad" not call
            windowLoadReset: false,

            //CALLBACKS

            // Before assigning height in the row
            onRowBefore: function () {},

            // After assigning height in the row
            onRowAfter: function () {},

            // Before the resize event
            onResizeBefore: function () {},

            // After the resize event
            onResizeAfter: function () {},
            
            // Executes immediately after plugin is fully loaded
            onLoad: function () {}


        }, options);

        var element = this;
        var wrap = $(element).parent();
        var pluginLoader = false;


        if ( !element.length ) {
            return false;
        };

        function init () {

            // Loop each parent elements
            wrap.each(function() {

                var setup = {
                    thisWrap : $(this),
                    thisElement : $(this).find(element),
                    rowCount : 1

                };

                // Amount elements in a row
                setup.amountInRow = method.countElementInRow(setup.thisWrap, element) || 0;

                // Amount row in a parent
                setup.rowCount = Math.ceil(setup.thisElement.length/setup.amountInRow);

                // If the amount of rows > 1
                if ( setup.rowCount > 1 ) {

                    var el = [];

                    setup.thisElement.each(function( index ) {

                        // Add each line item in the array
                        el.push(this);

                        // If you are on the last item in a row 
                        // or if it is the last element in the parent
                        if ( (index+1)%setup.amountInRow == 0 || !setup.thisElement[index+1] ) {

                            var $el = $(el)

                            settings.onRowBefore( $el );

                            // First, set the height of the child elements
                            for ( var i = 0; i < settings.child.length; i++ ) {
                                method.setHeight( 
                                    $el.find(settings.child[i]), 
                                    method.getMaxHeight( $el.find(settings.child[i]) )
                                );
                            }

                            // Sets the height the element itself
                            method.setHeight( 
                                $el, 
                                method.getMaxHeight( $el )
                            );

                            settings.onRowAfter( $el );

                            // Clear the array elements in the transition to a new line
                            el = [];

                        };
                        
                    });

                };

                // If the amount of rows == 1
                if ( setup.rowCount == 1 ) {

                    settings.onRowBefore( setup.thisElement );

                    // First, set the height of the child elements
                    for ( var i = 0; i < settings.child.length; i++ ) {
                        method.setHeight( 
                            setup.thisWrap.find(settings.child[i]), 
                            method.getMaxHeight( setup.thisWrap.find(settings.child[i]) )
                        );
                    }

                    // Sets the height the element itself
                    method.setHeight(
                        setup.thisElement,
                        method.getMaxHeight( setup.thisWrap.find(setup.thisElement))
                    );

                    settings.onRowAfter( setup.thisElement );

                };
                
                
            });
            
            // That did not work when you restart
            if ( !pluginLoader ) {

                settings.onLoad( element );
                pluginLoader = true;

            };

        };

        if ( settings.windowLoad ) {

            $(window).on('load', init);

        } else {

            init();

            if ( settings.windowLoadReset ) {
                $(window).on('load', init);
            };

        };




        // Restarting when resize
        $(window).on('resize', function() {
            
            settings.onResizeBefore( element );
            init();
            settings.onResizeAfter( element );
            
        });
        

        return element;

    };
    
})( jQuery );
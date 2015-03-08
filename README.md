# Equal height in the row
### About
    The jQuery plugin for equal height of the elements in the row
    
### Features

- match the heights of elements anywhere on the page
- match the heights of child elements
- the number of elements in a row may be different
- responsive, automatically updates on window resize
- callback events
- handles images
- tested in IE8+, Chrome, Safari, Firefox, Mobile browsers

### Example
```
$('.block').equalHeightInRow();
```

### Full example
```
    $('.block').equalHeightInRow({
        child           : ['.child1','.child2'],
        eachRow         : true,
        windowLoad      : true,
        windowLoadReset : true,
        applyOnlyChild  : true,
        parent          : '.wrapper',
        onRowBefore     : function( elements ) {},
        onRowAfter      : function( elements ) {},
        onResizeBefore  : function( elements ) {},
        onResizeAfter   : function( elements ) {},
        onLoad          : function( elements ) {}
    });
```
    
    

### Options
**child** Equal height internal child elements
```
default: []
child: ['.child1','.child2']
```

**eachRow** Apply for each row individually 
```
default: false
eachRow: true
```

**windowLoad** Execute after full page load
```
default: false
windowLoad: true
```

**windowLoadReset** Reset on full page load, callback "onLoad" not call
```
default: false
windowLoadReset: true
```

**applyOnlyChild** Apply only child
```
default: false
applyOnlyChild: true
```

**parent** Set custom parent
```
default: false
parent: '.wrapper'
```
    
### Events

**onRowBefore** Before assigning height in the row
```
default: function(){}
onRowBefore: function( elements ){ // your code here }
arguments:
  elements: elements in row
```

**onRowAfter** After assigning height in the row
```
default: function(){}
onRowAfter: function( elements ){ // your code here }
arguments:
  elements: elements in row
```

**onResizeBefore** Before the resize event
```
default: function(){}
onResizeBefore: function( elements ){ // your code here }
arguments:
  elements: all elements in wrapper
```

**onResizeAfter** After the resize event
```
default: function(){}
onResizeAfter: function( elements ){ // your code here }
arguments:
  elements: all elements in wrapper
```

**onLoad** Executes immediately after plugin is fully loaded
```
default: function(){}
onLoad: function( elements ){ // your code here }
arguments:
  elements: all elements in wrapper
```

#### Released under the MIT license - http://opensource.org/licenses/MIT

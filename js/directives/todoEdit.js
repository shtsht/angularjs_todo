/*global todomvc */
'use strict';

/**
 * Directive that executes an expression when the element it is applied to gets
 * an `escape` keydown event.
 */
todomvc.directive('todoEdit', function () {
        var ESCAPE_KEY = 27;
        return function (scope, elem, attrs) {
                elem.bind('keydown', function (event) {
                         console.log("a key is pressed");
                        if (event.keyCode === ESCAPE_KEY) {
                            console.log("key \"Escape key\" is pressed");
                             // attr.todoEscape gets "hoge" in <div todoEscape="hoge">
                            // $apply executes given expression just like eval.
                            // see also http://docs.angularjs.org/api/ng.$rootScope.Scope
                                scope.$apply(attrs.todoEscape);
                        }
                });
        };
});


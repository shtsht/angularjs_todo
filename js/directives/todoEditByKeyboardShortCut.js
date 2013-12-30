/*global todomvc */
'use strict';

/**
 * Directive that executes an expression when the element it is applied to gets
 * an `escape` keydown event.
 */
todomvc.directive('todoEdit', function () {
        var ZERO_KEY = 48;
        return function (scope, elem, attrs) {
                elem.bind('keydown', function (event) {
                        if (event.keyCode === ZERO_KEY) {
                            console.log("hoge");
                             // attr.todoEscape gets "hoge" in <div todoEscape="hoge">
                            // $apply executes given expression just like eval.
                            // see also http://docs.angularjs.org/api/ng.$rootScope.Scope
                                scope.$apply(attrs.todoEscape);
                        }
                });
        };
});


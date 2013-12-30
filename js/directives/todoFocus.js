/*global todomvc */
'use strict';

/**
 * Directive that places focus on the element it is applied to when the expression it binds to evaluates to true
 */
todomvc.directive('todoFocus', function todoFocus($timeout) {
        return function (scope, elem, attrs) {
            // attr.todoFocus gets "hoge" in <div todoFocus="hoge">
                scope.$watch(attrs.todoFocus, function (newVal) {
                        if (newVal) {
                                $timeout(function () {
                                        elem[0].focus();
                                }, 0, false);
                        }
                });
        };
});

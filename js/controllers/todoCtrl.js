/*global todomvc, angular */
'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 *
 * 'todoStorage' is in "function TodoCtrl()" is automatically injected by Angular.js
 *
 */
todomvc.controller('TodoCtrl', function TodoCtrl($scope, $location, todoStorage, keyboardManager, filterFilter) {


                       /**
                        * initialization
                        */
        var todos = $scope.todos = todoStorage.get();
        $scope.newTodo = '';
        $scope.editedTodo = null;


                       /**
                        * set listener for adding new todo.                        *
                        * $watch(watchExpression, listener, objectEquality)
                        * Registers a listener callback to be executed whenever the watchExpression changes.
                        * objectEquality:Compare object for equality rather than for reference.
                        * see also http://docs.angularjs.org/api/ng.$rootScope.Scope#methods_$watch
                        */
        $scope.$watch('todos', function (newValue, oldValue) {
                $scope.remainingCount = filterFilter(todos, { completed: false }).length;
                $scope.completedCount = todos.length - $scope.remainingCount;
                $scope.allChecked = !$scope.remainingCount;
                if (newValue !== oldValue) { // This prevents unneeded calls to the local storage
                        todoStorage.put(todos);
                }
        }, true);


                       /**
                        * $location is the same as window.location.
                        * getting user's current url.
                        * add "#/" to path.
                        * active todos in "index.html#/active"
                        */
        if ($location.path() === '') {
                $location.path('/');
        }
        $scope.location = $location;

        $scope.$watch('location.path()', function (path) {
                $scope.statusFilter = (path === '/active') ?
                        { completed: false } : (path === '/completed') ?
                        { completed: true } : null;
        });


                       /**
                        * functions for adding, editing, done, and so on.
                        *
                        */


                       // adding todo. get new todo from $scope.newTodo and push it to todos
        $scope.addTodo = function () {
                var newTodo = $scope.newTodo.trim();// trim() remove whitespace from both sides of a string
                if (!newTodo.length) {
                        return;
                }

                todos.push({
                        title: newTodo,
                        completed: false,
                        focused: (todos.length == 0)? true : false
                });

                $scope.newTodo = '';
        };

                       // editing todo. put passed todo to $scope.editedTodo(NOTE: using not "editing" but "edited". it seems "being edited" )
                       // and restore passed original todo to $scope.originalTodo.
        $scope.editTodo = function (todo) {
                $scope.editedTodo = todo;
                // Clone the original todo to restore it on demand.
                // angular.extend(dst, src) extends the destination object dst by copying all of the properties from the src object(s) to dst. You can specify multiple src objects.
                $scope.originalTodo = angular.extend({}, todo);
        };

                       // done editing. empty $scope.editedTodo
        $scope.doneEditing = function (todo) {
                $scope.editedTodo = null;
                todo.title = todo.title.trim();

                if (!todo.title) {
                        $scope.removeTodo(todo);
                }
        };

                       // revert editing by using resotered original todos
        $scope.revertEditing = function (todo) {
                todos[todos.indexOf(todo)] = $scope.originalTodo;
                $scope.doneEditing($scope.originalTodo);
        };

                       // remove todo in todos(array) by array operation "splice"
        $scope.removeTodo = function (todo) {
                todos.splice(todos.indexOf(todo), 1);
        };

        $scope.clearCompletedTodos = function () {
                $scope.todos = todos = todos.filter(function (val) {
                        return !val.completed;
                });
        };

        $scope.markAll = function (completed) {
                todos.forEach(function (todo) {
                        todo.completed = completed;
                });
        };

        $scope.hello = function () {
            console.log("hoge");
        };


                       /**
                        * for keyboard shortcut
                        */
        keyboardManager.bind('j', function() {
                                 var focusedIndex = getFocusedTodosIndex();

                                 todos[focusedIndex].focused = false;

                                 var nextFocusedIndex = (focusedIndex + 1) % todos.length;

                                 todos[nextFocusedIndex].focused = true;


        });

        keyboardManager.bind('k', function() {
                                 var focusedIndex = getFocusedTodosIndex();

                                 todos[focusedIndex].focused = false;

                                 var nextFocusedIndex = (focusedIndex == 0)? todos.length - 1 : (focusedIndex - 1);

                                 todos[nextFocusedIndex].focused = true;
        });

        keyboardManager.bind('e', function() {

                $scope.editedTodo = todos[getFocusedTodosIndex()];
                $scope.originalTodo = angular.extend({}, todo);

        });


                       /**
                        * helpers
                        *
                        *
                        */
                       function getFocusedTodosIndex(){
                           var ret = 0;


                           todos.forEach(function (todo, index, todos) {
                                             if(todo.focused == true){
                                               ret = index;
                                             }
                                         });
                           return ret;

                       }



});

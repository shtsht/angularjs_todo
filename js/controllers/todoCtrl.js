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
        $scope.killedTodo = null;
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
       $scope.addTodo = function (posi, parentId, generation, title) {

                var newTodo = (typeof title == "undefined")? $scope.newTodo.trim() : title;// trim() remove whitespace from both sides of a string
                if (!newTodo.length) {
                        return;
                }

           var id = uuid();
           var newTodoObject = {
                        id: id,
                        title: newTodo,
                        completed: false,
                        focused: (todos.length == 0)? true : false,
                        parentId: (typeof parentId == "undefined")? null : parentId,
                        generation: (typeof generation == "undefined")? 0 : generation
                };

           if (typeof posi == "undefined"){
                todos.reverse();
                todos.push(newTodoObject);
                todos.reverse();
           }else{
               todos.splice(posi, 0, newTodoObject);
           }

           $scope.newTodo = '';

           return id;
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
            todos.splice(todos.indexOf(todo), 1);// remove todo itself

            // remove children of todo and remove all of the descendant
            var indexesOfChildren = getChildrenIndexesByParentID($scope.todos, todo.id);
            removeTodoByIdsWithDescendants($scope.todos, indexesOfChildren);

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
                       // TODO: [issue] j/k is not working (move todos array. should be move in active todos) on active page view
        keyboardManager.bind('j', function() {
                                 var focusedIndex = getFocusedTodosIndex();

                                 todos[focusedIndex].focused = false;

                                 var nextFocusedIndex = (focusedIndex + 1) % todos.length;

                                 todos[nextFocusedIndex].focused = true;

        }, { 'inputDisabled':true }  );

        keyboardManager.bind('k', function() {

                                 var focusedIndex = getFocusedTodosIndex();

                                 todos[focusedIndex].focused = false;

                                 var nextFocusedIndex = (focusedIndex == 0)? todos.length - 1 : (focusedIndex - 1);

                                 todos[nextFocusedIndex].focused = true;
        }, { 'inputDisabled':true }  );


        keyboardManager.bind('e', function() {

                $scope.editedTodo = todos[getFocusedTodosIndex()];
                $scope.originalTodo = angular.extend({}, todos[getFocusedTodosIndex()]);

        }, { 'inputDisabled':true }  );

        keyboardManager.bind('c', function() {

                var focusedTodo = todos[getFocusedTodosIndex()];
                focusedTodo.completed = !focusedTodo.completed;

        }, { 'inputDisabled':true }  );


                       //TODO: infinit loop if child has deleted parent
        keyboardManager.bind('s', function() {
                 initFocused();

                 var todosCopy = Array.apply(null,$scope.todos);

                 var parentTodos = todosCopy.filter(function(elem){
                                                  return (elem.parentId == null);
                                              }
                                             );

                 var childTodos = todosCopy.filter(function(elem){
                                                  return (elem.parentId != null);
                                              }
                                             );

                 parentTodos.sort(function(a, b) {
                                      return a.completed - b.completed;
                            });

                                 childTodos.reverse();

                                 while(childTodos.length != 0){

                                     var len = childTodos.length;
                                     var i = 0;

                                     while(len--){

                                         var parentIndex = getIndexByID(parentTodos, childTodos[i].parentId);

                                         if(parentIndex == null){
                                             i++;
                                             continue;
                                         }

                                         parentTodos.splice(parentIndex + 1, 0, childTodos[i]);
                                         childTodos.splice(i, 1);

                                     };

                                 }

                                 $scope.todos = parentTodos;

                                 //TODO: store data in this order. todoStorage.put($scope.todos) doesn't work


        }, { 'inputDisabled':true }  );


        keyboardManager.bind('a', function() {

                var focusedIndex = getFocusedTodosIndex();
                var parentGeneration = todos[focusedIndex].generation;
                var prefix = Array(parentGeneration + 2).join('-');

                $scope.addTodo(focusedIndex + 1, todos[focusedIndex].id, todos[focusedIndex].generation + 1, prefix);

                todos[focusedIndex].focused = false;
                todos[focusedIndex + 1].focused = true;

                $scope.editedTodo = todos[getFocusedTodosIndex()];
                $scope.originalTodo = angular.extend({}, todos[getFocusedTodosIndex()]);

        }, { 'inputDisabled':true }  );

                       // TODO: n to focus on new todo form.
        keyboardManager.bind('n', function() {

        }, { 'inputDisabled':true }  );

                       // TODO: d to delete focused todo
        keyboardManager.bind('d', function() {

        }, { 'inputDisabled':true }  );

                       // TODO: k to kill todo (show killed todo in other region)
        keyboardManager.bind('ctrl+k', function() {
                                 var focusedIndex = getFocusedTodosIndex();
                                 $scope.todos.splice(focusedIndex, 1);
        }, { 'inputDisabled':true }  );


                       // TODO: y to yank todo
        keyboardManager.bind('y', function() {

        }, { 'inputDisabled':true }  );


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

                       function initFocused(){

                           if(todos.length == 0) return;

                           todos.forEach(function (todo, index, todos) {
                                             if(todo.focused == true){
                                               todo.focused = false;
                                             }
                                         });

                           todos[0].focused = true;

                       }


                       function uuid(){
                           var S4 = function() {
                               return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
                           };
                           return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4() +S4());
                       }


                       function getIndexByID(todos, id){
                           var indexOfTodo = null;

                           todos.forEach(function (elem, index, array) {
                                             if(elem.id == id){
                                                 indexOfTodo = index;
                                             }
                                         });

                           return indexOfTodo;
                       }

                       function getChildrenIndexesByParentID(todos, parentId){
                           var indexes = [];

                           todos.forEach(function (elem, index, array) {
                                             if(elem.parentId == parentId){
                                                 indexes.push(elem.id);
                                             }
                                         });

                           return indexes;
                       }

                       function removeTodoByIdsWithDescendants(todos, ids){

                           ids.forEach(function(id){
                                           var indexesOfChildren = getChildrenIndexesByParentID(todos, id);
                                           todos.splice(id, 1);
                                           removeTodoByIdsWithDescendants(todos, indexesOfChildren);
                                       });

                       };







});

"use strict";
Object.defineProperties(exports, {
  namespace: {get: function() {
      return namespace;
    }},
  newContext: {get: function() {
      return newContext;
    }},
  __esModule: {value: true}
});
var $__lodash__,
    $__introspect_45_typed__;
'use strict';
var _ = ($__lodash__ = require("lodash"), $__lodash__ && $__lodash__.__esModule && $__lodash__ || {default: $__lodash__}).default;
var $__1 = ($__introspect_45_typed__ = require("introspect-typed"), $__introspect_45_typed__ && $__introspect_45_typed__.__esModule && $__introspect_45_typed__ || {default: $__introspect_45_typed__}),
    overload = $__1.overload,
    Matcher = $__1.Matcher,
    Either = $__1.Either;
var newContext = function() {
  var RootNs,
      nsPathToParts,
      nsStack,
      currentNs,
      namespace;
  var nsNameMatch = (function(s) {
    return s.match(/^[a-z][A-Za-z0-9_]+$/);
  });
  var isNamespace;
  var Namespace = function() {};
  var makeNs = function(parent, name) {
    if (!nsNameMatch(name)) {
      throw new Error('Illegal namespace name: ' + name);
    }
    var ns = new Namespace();
    if (parent) {
      parent[name] = ns;
    }
    return ns;
  };
  RootNs = makeNs(null, 'root');
  isNamespace = (function(v) {
    return v instanceof Namespace;
  });
  nsStack = [RootNs];
  var resetStack = (function() {
    return nsStack = [RootNs];
  });
  currentNs = (function() {
    return _.last(nsStack);
  });
  nsPathToParts = (function(s) {
    return s.split('/');
  });
  var getNsByNameParts = function(parts) {
    if (!parts.length) {
      return RootNs;
    }
    var current;
    if (_.first(parts) === '') {
      current = RootNs;
      parts = _.tail(parts);
    } else {
      current = currentNs();
    }
    parts.forEach((function(p) {
      current = current[p] || makeNs(current, p);
    }));
    return current || RootNs;
  };
  var getNsByName = function(nsName) {
    return getNsByNameParts(nsPathToParts(nsName));
  };
  var getNsBySubspaceParts = function(ns, parts) {
    if (!parts.length) {
      return ns;
    }
    var current = ns;
    if (_.first(parts) === '') {
      current = RootNs;
      parts = _.tail(parts);
    }
    parts.forEach((function(p) {
      current = current[p] || makeNs(current, p);
    }));
    return current || ns;
  };
  var getNsBySubspace = function(ns, path) {
    return getNsBySubspaceParts(ns, nsPathToParts(path));
  };
  var defineMembersFn = function(ns, fn) {
    nsStack.push(ns);
    var members = _.isFunction(fn) ? fn.call(ns, ns) : fn;
    _.each(members, (function(val, key) {
      if (ns.hasOwnProperty(key)) {
        nsStack.pop();
        throw new Error('Already existing member in namespace: ' + key);
      }
      ns[key] = val;
    }));
    nsStack.pop();
    return ns;
  };
  var defineMembersFnForName = function(path, fn) {
    return defineMembersFn(getNsBySubspace(currentNs(), path), fn);
  };
  var FuncObj = new Either(Function, Object);
  namespace = overload().when([], currentNs).when([String], getNsByName).when([Namespace, String], getNsBySubspace).when([Namespace, FuncObj], defineMembersFn).when([String, FuncObj], defineMembersFnForName);
  namespace.root = RootNs;
  namespace.resetStack = resetStack;
  namespace.make = makeNs;
  namespace.isNamespace = isNamespace;
  namespace.newContext = newContext;
  return namespace;
};
var namespace = newContext();
;

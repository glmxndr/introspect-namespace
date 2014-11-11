'use strict';
import _ from 'lodash';
import { overload, Matcher, Either } from 'introspect-typed';

var newContext = function () {

  var RootNs, nsPathToParts, nsStack, currentNs, namespace;

  var nsNameMatch = (s) => s.match(/^[a-z][A-Za-z0-9_]+$/);

  var isNamespace;

  var Namespace = function () {};

  var makeNs = function (parent, name) {
    // Namespaces should only have letters, numbers, and _
    // and start with lowercase letter.
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

  isNamespace = (v) => v instanceof Namespace;

  /**
   * The namespace stack is used to keep track of the currently used namespace.
   * This array is used as a stack (push/pop actions) whenever the namespace
   * function is called with signature [String, Function] or
   * [Namespace, Function].
   * @type {Array}
   */
  nsStack = [RootNs];

  var resetStack = () => nsStack = [RootNs];

  /**
   * Access the current namespace (last in the stack).
   * @type {Namespace}
   */
  currentNs = () => _.last(nsStack);


  nsPathToParts = (s) => s.split('/');


  var getNsByNameParts = function (parts) {
    if (!parts.length) { return RootNs; }
    var current;

    if (_.first(parts) === '') {
      current = RootNs;
      parts = _.tail(parts);
    } else {
      current = currentNs();
    }

    parts.forEach((p) => {
      current = current[p] || makeNs(current, p);
    });
    return current || RootNs;
  };

  /**
   * Return the namespace corresponding to the given name.
   * Create inexisting namespaces.
   */
  var getNsByName = function (nsName) {
    return getNsByNameParts(nsPathToParts(nsName));
  };


  var getNsBySubspaceParts = function (ns, parts) {
    if (!parts.length) { return ns; }
    var current = ns;
    if (_.first(parts) === '') {
      current = RootNs;
      parts = _.tail(parts);
    }
    parts.forEach((p) => {
      current = current[p] || makeNs(current, p);
    });
    return current || ns;
  };

  var getNsBySubspace = function (ns, path) {
    return getNsBySubspaceParts(ns, nsPathToParts(path));
  };

  var defineMembersFn = function (ns, fn) {
    nsStack.push(ns);
    var members = _.isFunction(fn) ? fn.call(ns, ns) : fn;
    _.each(members, (val, key) => {
      if (ns.hasOwnProperty(key)) {
        nsStack.pop();
        throw new Error('Already existing member in namespace: ' + key);
      }
      ns[key] = val;
    });
    nsStack.pop();
    return ns;
  };

  var defineMembersFnForName = function (path, fn) {
      return defineMembersFn(getNsBySubspace(currentNs(), path), fn);
  };

  var FuncObj = new Either(Function, Object);

  namespace = overload()
    .when([],
      currentNs)
    .when([String],
      getNsByName)
    .when([Namespace, String],
      getNsBySubspace)
    .when([Namespace, FuncObj],
      defineMembersFn)
    .when([String, FuncObj],
      defineMembersFnForName);

  namespace.root = RootNs;
  namespace.resetStack = resetStack;
  namespace.make = makeNs;
  namespace.isNamespace = isNamespace;
  namespace.newContext = newContext;

  return namespace;

};

var namespace = newContext();

export { namespace, newContext };

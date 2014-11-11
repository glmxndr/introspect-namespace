/*global describe, it*/
'use strict';

var expect = require('chai').expect;

var lib = require('../');
var namespace = lib.namespace;
var newContext = namespace.newContext;
var rootNs = namespace.root;

describe ('namespace', function () {

  describe ('newContext', function () {
    it ('should be a function', function () {
      expect(newContext).to.be.a('function');
    });
    it ('should return a new namespace context when called', function () {
      var namespace = newContext();
      expect(namespace).to.be.a('function');
      expect(namespace.root).to.be.an('object');
      expect(namespace()).to.be.equal(namespace.root);
    });
  });

  it ('is a function', function () {
    expect(lib.namespace).to.be.a('function');
  });

  describe ('called with signature []', function () {
    it ('should return the root namespace ', function () {
      expect(lib.namespace()).to.be.equal(lib.namespace.root);
    });
  });

  var namespace = newContext();
  var rootNs = namespace();
  var someNs, somePathNs, someOtherPathNs;

  describe ('called with signature [String]', function () {
    it ('should create the namespace if it does not exist', function () {
      var ns = namespace('/some/path');
      somePathNs = ns;
      someNs = rootNs.some;
      expect(ns).to.be.an('object');
      expect(rootNs.some.path).to.be.equal(ns);
    });
    it ('should get the correct namespace if it does exist', function () {
      var ns = namespace('/some/path');
      expect(ns).to.be.equal(somePathNs);
      ns = namespace('/some');
      expect(ns).to.be.equal(someNs);
    });
    it ('should get namespace members if defined', function () {
      var ns = namespace('/some/path');
      ns.testValue = 23;
      expect(namespace('/some/path/testValue')).to.be.equal(23);
    });
  });

  describe ('called with signature [Namespace, String]', function () {
    it ('should get already existing path (1 level)', function () {
      var ns = namespace(someNs, 'path');
      expect(ns).to.be.equal(rootNs.some.path);
    });
    it ('should create the namespace if it does not exist', function () {
      var ns = someOtherPathNs = namespace(someNs, 'other/path');
      expect(ns).to.be.equal(rootNs.some.other.path);
    });
    it ('should get the correct namespace if it does exist', function () {
      var ns = namespace(someNs, 'other/path');
      expect(ns).to.be.equal(someOtherPathNs);
      var someOtherNs = namespace('/some/other');
      expect(namespace(someOtherNs, 'path')).to.be.equal(someOtherPathNs);
    });
  });

  describe ('called with signature [Namespace, Function]', function () {
    it ('should provide the correct context in the function', function () {
      namespace(someNs, function (ns) {
        expect(ns).to.be.equal(someNs);
        expect(this).to.be.equal(someNs);
      });
    });
    it ('should correctly nest and modify the namespace stack', function () {
      expect(namespace()).to.be.equal(rootNs);
      namespace(someNs, function (ns) {
        expect(namespace()).to.be.equal(someNs);
        namespace(somePathNs, function (ns) {
          expect(namespace()).to.be.equal(somePathNs);
        });
        expect(namespace()).to.be.equal(someNs);
      });
      expect(namespace()).to.be.equal(rootNs);
    });
    it ('should define members for the given namespace', function () {
      namespace(someNs, function (ns) {
        return { a: 1, b: 2 };
      });
      expect(someNs.a).to.be.equal(1);
      expect(someNs.b).to.be.equal(2);
      // Unchanging existing namespaces
      expect(someNs.path).to.be.equal(somePathNs);


      namespace(namespace('/some/nstest'), {
        c: 401,
        d: 502
      });
      expect(rootNs.some.nstest.c).to.be.equal(401);
      expect(rootNs.some.nstest.d).to.be.equal(502);

    });
    it ('should throw when trying to overwrite existing members of the namespace', function () {
      var throwingFn = function () {
        namespace(someNs, function (ns) {
          return { other: 0 };
        });
      };
      expect(throwingFn).to.throw(Error);
    });
  });


  describe ('called with signature [String, Function/Object]', function () {
    it ('should provide the correct context in the function', function () {
      namespace('some', function (ns) {
        expect(ns).to.be.equal(someNs);
        expect(this).to.be.equal(someNs);
      });
    });
    it ('should correctly nest and modify the namespace stack', function () {
      expect(namespace()).to.be.equal(rootNs);
      namespace('/some', function (ns) {
        expect(namespace()).to.be.equal(someNs);
        namespace('other/path', function (ns) {
          expect(namespace()).to.be.equal(someOtherPathNs);
        });
        // Using '/' at the beginning to use absolute path
        namespace('/path/newly/created', function (ns) {
          expect(namespace()).to.be.equal(rootNs.path.newly.created);
        });
        expect(namespace()).to.be.equal(someNs);
      });
      expect(namespace()).to.be.equal(rootNs);
    });
    it ('should define members for the given namespace', function () {
      namespace('/some', function (ns) {
        return { c: 1, d: 2 };
      });

      expect(someNs.c).to.be.equal(1);
      expect(someNs.d).to.be.equal(2);
      // Unchanging existing namespaces
      expect(someNs.path).to.be.equal(somePathNs);

      namespace('/some/strtest', {
        c: 101,
        d: 102
      });
      expect(rootNs.some.strtest.c).to.be.equal(101);
      expect(rootNs.some.strtest.d).to.be.equal(102);

    });
    it ('should throw when trying to overwrite existing members of the namespace', function () {
      var throwingFn = function () {
        namespace('/some', function (ns) {
          return { other: 0 };
        });
      };
      expect(throwingFn).to.throw(Error);
    });
  });

  describe ('isNamespace', function () {
    var isNs = lib.namespace.isNamespace;
    it ('should be a function', function () {
      expect(isNs).to.be.a('function');
    });
    it ('should validate only for namespaces of the same context', function () {
      var ns = lib.namespace('test/ns');
      expect(isNs(ns)).to.be.true;
      expect(isNs(lib.namespace.root)).to.be.true;
      // Namespace of other contexts are not recognized
      [someNs, {}, null, 0, [], expect, 'string'].forEach(function (v) {
        expect(isNs(v)).to.be.false;
      });
    });
  });

});

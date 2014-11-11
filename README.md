# introspect-namespace

Provides rudimentary namespacing DSL.

<!-- toc -->

* [Install](#install)
* [API](#api)
  * [`newContext()`: Create a new namespacing context](#newcontext-create-a-new-namespacing-context)
  * [`namespace.root`: Get the context's root namespace](#namespaceroot-get-the-contexts-root-namespace)
  * [`namespace.isNamespace`: Namespace checking predicate](#namespaceisnamespace-namespace-checking-predicate)
  * [`namespace()`: Get the current namespace](#namespace-get-the-current-namespace)
  * [`namespace(String)`: Get/Create a namespace](#namespacestring-getcreate-a-namespace)
  * [`namespace(String, Function)`: Assign namespace members](#namespacestring-function-assign-namespace-members)
  * [`namespace(String, Object)`: Assign namespace members](#namespacestring-object-assign-namespace-members)

<!-- toc stop -->

## Install

    npm install introspect-namespace

## API

### `newContext()`: Create a new namespacing context

```javascript
  var namespace = require('introspect-namespace').newContext();
```

```javascript
  var namespace = require('introspect-namespace').namespace.newContext();
```

Returns a new namespace function, with the same attributes as the default
one. The namespaces defined with this method are all completely independent.

### `namespace.root`: Get the context's root namespace

The root namespace is also the default namespace.

### `namespace.isNamespace`: Namespace checking predicate

```javascript
  var isNs = namespace.isNamespace;
  var ns = namespace('test/ns');
  expect(isNs(ns)).to.be.true;
  expect(isNs(namespace.root)).to.be.true;
```

This function returns `false` for namespaces defined in a different context.

### `namespace()`: Get the current namespace

Calls to `namespace(String, Function)` modify a stack of namespaces.

In order to get the currently used namespace, call `namespace()`.

By default, it will return `namespace.root`.

### `namespace(String)`: Get/Create a namespace

Create inexisting namespaces:

```javascript
    var namespace = newContext();
    var rootNs = namespace.root;
    var ns = namespace('/some/path');
    expect(rootNs.some.path).to.be.equal(ns);
```

Fetching existing namespaces:

```javascript
    ns = namespace('/some/path');
    expect(ns).to.be.equal(rootNs.some.path);
    ns = namespace('/some');
    expect(ns).to.be.equal(rootNs.some);
```

Even fetching namespace member values:

```javascript
    ns = namespace('/some/path');
    ns.testValue = 23;
    expect(namespace('/some/path/testValue')).to.be.equal(23);
```

### `namespace(String, Function)`: Assign namespace members

Allows to define members for the namespaces in nested functions.

```javascript
  var namespace = newContext();
  var rootNs = namespace.root;
  var someNs = namespace('/some');

  expect(namespace()).to.be.equal(rootNs);
  
  namespace('some', function (ns) {
    expect(namespace()).to.be.equal(someNs);

    namespace('other/path', function (ns) {
      // Return members to be added to the namespace
      return {
        member1: 'value1',
        member2: 'value2'
      };
    });
    
    expect(namespace('/some/other/path/member1')).to.be.equal('value1');

    // Using '/' at the beginning to use absolute path
    namespace('/path/newly/created', function (ns) {
      return {
        member1: 'value1',
        member2: 'value2'
      };
    });
    
    expect(namespace()).to.be.equal(someNs);
  });
  
  expect(namespace()).to.be.equal(rootNs);
```

Trying to add already existing members throws an Error.

### `namespace(String, Object)`: Assign namespace members

Add members directly:

```javascript
  var namespace = newContext();
  var rootNs = namespace.root;
  namespace('/some/strtest', {
    c: 101,
    d: 102
  });
  expect(rootNs.some.strtest.c).to.be.equal(101);
  expect(rootNs.some.strtest.d).to.be.equal(102);
```
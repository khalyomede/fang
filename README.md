# Fang

Parallelized task runner. Inspired from [Gulp.js](https://gulpjs.com)

![npm](https://img.shields.io/npm/v/@khalyomede/fang.svg) ![NPM](https://img.shields.io/npm/l/@khalyomede/fang.svg) 

[![Coverage Status](https://coveralls.io/repos/github/khalyomede/fang/badge.svg?branch=master)](https://coveralls.io/github/khalyomede/fang?branch=master) ![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/@khalyomede/fang.svg)

![Fang logo of a tiger in black and white](https://cdn4.iconfinder.com/data/icons/vectortown-endangered-species/32/Tiger-256.png)

## Summary

- [Installation](#installation)
- [Usage](#usage)
- [Official plugins](#official-plugins)
- [Community plugins](#community-plugins)
- [Fang API](#fang-api)
- [CLI-API](#cli-api)
- [Plugin development guidelines](#plugin-development-guidelines)

## Installation

With npm

```bash
npm install --global @khalyomede/fang@0.*
```

With yarn

```bash
yarn global add @khalyomede/fang@0.*
```

## Usage

- [Compressing your assets](#compressing-your-assets)
- [Restrict the number of core to use](#restrict-the-number-of-core-to-use)
- [Moving the fang task file in another place](#moving-the-fang-task-in-another-place)
- [Create your fang plugin](#create-your-fang-plugin)
- [Create a plugin inside-a-task-file](#create-a-plugin-inside-a-task-file)

### Compressing your assets

In this example, we will compress (e.g. uglifying) our HTML, Javascript and CSS files.

1. Create a `fang.js` file on your root directory.
2. Add your tasks on your fang file.

_fang.js_
```javascript
const fang = require('@khalyomede/fang');
const htmlMinifier = require('@khalyomede/fang-html-minifier');
const uglify = require('@khalyomede/fang-uglify-es');
const cleanCss = require('@khalyomede/fang-clean-css');

const html = () => fang.from('src/**/*.html')
  .do(htmlMinifier())
  .save('dist');

const css = () => fang.from('src/css/**/*.css')
  .do(cleanCss())
  .save('dist/css');

const js = () => fang.from('src/js/**/*.js')
  .do(uglify())
  .save('dist/js');

const build = [html, js, css];

export.modules = { build }
```
3. On your `package.json`, create a shortcut for your build command.

_package.json_
```javascript
{
  ...,
  "scripts": {
    "build": "fang build"
  }
}
```
4. On your root directory, run the following command.

```bash
npm run build
```
### Restrict the number of core to use

In this example, you will see how you can reduce the number of core used by fang, with the `--max-core` option. By default, fang will use the maximum of core available.

```bash
fang --max-core 2 build
```

### Moving the fang task file in another place

_in progress_

### Create your fang plugin

In this example, you will be able to use a vendor library like `sass`, or `pug` to make it support fang.

1. Create a project and initialize it with git and npm (or yarn).
2. In your main file (could be `index.js`, or `main.js`), enter this starter code.

_lib/main.js_
```javascript
const fangBabel = options => fang => {
  fang.files.map(file => {
    // your logic here

    return file;
  });

  return fang;
};

module.exports = fangBabel;
```
3. Add your logic, in our case we will support babel.

_lib/main.js_
```javascript
const babel = require('@babel/core');

const fangBabel = options => fang => {
  fang.files.map(file => {
    const transpiled = babel.transformSync(file.content.toString(), options).code;

    file.content = Buffer.from(transpiled);

    return file;
  });

  return fang;
};

module.exports = fangBabel;
```

As you can see, the files are stored in a form of a Buffer. So you will need to use a `.toString()` to get back the raw content, and use `Buffer.from(string)` to put it back on the `file.content`. 

You are free to do whatever process you need, since you stick with this architecture.

4. Publish, and use it.

_fang.js_
```javascript
const fang = require('@khalyomede/fang');
const babel = require('@you/fang-babel');

const js = () => fang.from('src/js/**/*.js')
  .do(babel())
  .save('dist/js');

const build = [js];

export.modules = { build };
```

```bash
fang build
```

### Create a plugin inside a task file

In this example, we will create a plugin on the fly. This is useful if you do not find a fang plugin that fits your need, but still want to use it in your tasks.

```javascript
// fang.js
const fang = require('@khalyomede/fang');
const minify = require('html-minifier').minify;

// Inline fang plugin
const htmlMinifier = options => fang => {
  fang.pluginName = 'fang-html-minifier';

  fang.files.forEach(file => {
    const result = minify(file.content.toString());

    file.content = Buffer.from(result);

    return file;
  });

  return fang;
};

const html = () => fang.from('src/**/*.html')
  .do(htmlMinifier())
  .save('dist');

const build = [html];

module.exports = { build };
```

## Official plugins

- [browserify](https://www.npmjs.com/package/@khalyomede/fang-browserify)
- [pug](https://www.npmjs.com/package/@khalyomede/fang-pug)

## Community plugins

None.

## Fang API

- properties
  - [baseDirectory](#baseDirectory)
  - [files](#files)
  - [options](#options)
    - []()
- methods
  - [from](#from)
  - [do](#do)
  - [save](#save)
- types
  - [File](#file)

### baseDirectory

Contains the base directory for each files catched by the glob. The glob is the path you specified when using [`Fang.from()`](#from).

**type** string

```javascript
Fang.baseDirectory: string;
```

### files

Contains the files passed during the task process.

**type** [`Array<File>`](#file)

```javascript
Fang.files: array<object>;
Fang.files[0].path: string;
Fang.files[0].content: Buffer;
```

### options

**type** object

The options specified on the command line. 

```javascript
Fang.options.debug: boolean; // dsplays additional information on console or not.
Fang.options.maxCore: number; // The number of core to use.
Fang.options.tasksPath: string; // The path to the fang tasks configuration file.
Fang.options.taskName: string; // The name of the task being ran.
```

### from

Set the files to use by the processes. The path supports [globs](https://www.npmjs.com/package/glob).

```javascript
Fang.from(path: string): Fang
```

**variables**

- `path`: `string` - The glob to scope the desired files.

**throws**

Nothing.

### do

Perform a task of the files.

```javascript
Fang.do(callable: Function): Fang
```

**variables**

- `callable`: `Function` - The function that will transform the files contents.

**throws**

Nothing.

### save

Save all the files to their respective paths.

```javascript
Fang.save(): void
```

**variables**

None.

**throws**

Nothing.

### File

Represents a file, its path and its content.

**type** `object`

```javascript
interface File {
    path: string;
    content: Buffer;
}
```

## CLI API

- arguments
  - [task](#task)
- options
  - [--debug](#debug)
  - [--help](#help)
  - [--list](#list)
  - [--max-core](#max-core)
  - [--version](#version)

### task

**type** string

The task name. It corresponds to one of the variables that you exported in your task file. 

```bash
fang build
fang production
fang images
```

For example, if your task file contains:

```javascript
// ...

module.exports = { build, img };
```

It means you have access to 2 tasks: `build` and `img`.

### help

Prints an help manual.

```bash
fang --help
fang -h
```

### debug

The plugins that implement well this option will display more information on console.

```bash
fang --debug
fang -d
```

### list

Get a list of runnable tasks.

```bash
fang --list
fang -l
```

### max-core

**type** integer

The number of core to use for the task. By default, fang will use as much cores as possible (e.g. the maximum). 

```bash
fang --max-core 4 build
fang -c 4 build
```

Fang will perform one sub task per cores. For example, if your computer dispose of 8 cores, and you are running a task that contains 4 sub tasks, only 4 cores will be used, one core for each tasK.

However, if your task is composed of 12 sub tasks, only 8 tasks can be ran simultaneously, and the 4 remaining tasks will "wait their turn" until one sub task finishes its process and frees a core, and so on until no more sub task need to be processed (the end of the task).

### version

Prints the version of fang.

```bash
fang --version
fang -v
```

## Plugin development guidelines

You are not forced to follow those guidelines. They exist only to improve normalization of the plugins to offer the same experience for the end developer.

- **Do not do a lot of work inside a plugin**

Fang plugins should only be a bridge between a package and Fang. If you need to perform a lot of process inside your plugin, you are more likely to create a dedicated package first, and then use this package inside fang.

- **Keep the same name convention between a package name and your plugin name**

For example, if you are using `html-minifier`, your plugin name will become `fang-hml-minifier`. 
Another example, if you are using `codeclimate`, your plugin name will become `fang-codeclimate`.
Last example, if you are using `templateCompiler`, your plugin name will become `fang-templateCompiler`.

In a general manner, just keep `packagename` naming convention in `require('packagename')`.

- **Prompt debug information at the right time**

Use `fang.options.debug` to determine if the user wants you to print additional debug informations. You can take advantage of this information to also enable debug mode in packages that supports it.

```javascript
// src/main.js
const { minify } = require('html-minifier');
const { basename } = require('path');

const fangHtmlMinifier = options => fang => {
  fang.pluginName = 'fang-html-minifier';

  fang.files.forEach(file => {
    const fileName = basename(file.path);

    // Here for example
    if (fang.options.debug) {
      fang.info(`compressing ${fileName}...`);
    }

    const result = minify(file.content.toString());

    file.content = Buffer.from(result);
    
    // And here for example as well
    if (fang.options.debug) {
      fang.info(`compressed ${fileName}`);
    }

    return file;
  });

  return fang;
};

module.exports = fangHtmlMinifier;
```

- **Do not require Fang as a dependency**

You do not have to require fang on your plugin. When the end developer will use `.do(yourplugin())`, we will take care of providing a fang instance to your plugin.

However, feel free to require it as a dev dependency to test your plugin in real condition with a task file.

- **Use deasync for asynchronous processes**

When the end developer use `.do(yourplugin())`, we expect the process inside your plugin to be synchronous. But we understand that might not be feasable for all the packages.

To make an asynchronous package run sychronously, you can use [deasync](https://www.npmjs.com/package/deasync). Here is an example with [browserify](https://www.npmjs.com/package/browserify), which does not supports synchronicity.

```javascript
// src/main.js
const browserify = require('browserify');
const deasync = require('deasync');

const fangBrowserify = options => fang => {
  fang.files.forEach(file => {
    var done = false;
    browserify(file.path).bundle((error, buffer) => {
      if (error) {
        throw error;
      }

      file.content = buffer;

      done = true;
    });

    // This is where deasync is blocking the program until browserify finishes
    deasync.loopWhile(() => !done);

    return file;
  });
};

module.exports = fangBrowserify;
```
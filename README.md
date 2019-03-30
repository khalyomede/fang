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

### Compressing your assets

In this example, we will compress (e.g. uglifying) our HTML, Javascript and CSS files.

1. Create a `fang.js` file on your root directory.
2. Add your tasks on your fang file.

_fang.js_
```javascript
const fang = require('fang');
const htmlMinifier = require('fang-html-minifier');
const uglify = require('fang-uglify-es');
const cleanCss = require('fang-clean-css');

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
const fang = require('fang');
const babel = require('fang-babel');

const js = () => fang.from('src/js/**/*.js')
  .do(babel())
  .save('dist/js');

const build = [js];

export.modules = { build };
```

```bash
fang build
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

The options specified on the command line. 

```javascript
Fang.options.debug: boolean; // dsplays additional information on console or not.
Fang.options.maxCore: number; // The number of core to use.
Fang.options.tasksPath: string; // The path to the fang tasks configuration file.
Fang.options.taskName: string; // The name of the task being ran.
```

**type** object

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
  - [--list](#list)
  - [--max-core](#max-core)

### task

**type** string

The task name. It corresponds to one of the variables that you exported in your task file. 

For example, if your task file contains:

```javascript
// ...

module.exports = { build, img };
```

It means you have access to 2 tasks: `build` and `img`.

### debug

The plugins that implement well this option will display more information on console.

### list

Get a list of runnable tasks.

```bash
fang --list
fang -l
```

### max-core

**type** integer

The number of core to use for the task. By default, fang will use as much cores as possible (e.g. the maximum). 

Fang will perform one sub task per cores. For example, if your computer dispose of 8 cores, and you are running a task that contains 4 sub tasks, only 4 cores will be used, one core for each tasK.

However, if your task is composed of 12 sub tasks, only 8 tasks can be ran simultaneously, and the 4 remaining tasks will "wait their turn" until one sub task finishes its process and frees a core, and so on until no more sub task need to be processed (the end of the task).

```bash
fang --max-core 4 build
fang -c 4 build
```
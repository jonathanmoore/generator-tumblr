'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');


var TumblrGenerator = module.exports = function TumblrGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  // setup the test-framework property, Gruntfile template will need this
  this.testFramework = options['test-framework'] || 'mocha';
  this.coffee = options.coffee;

  // for hooks to resolve on mocha by default
  options['test-framework'] = this.testFramework;

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor('test-framework', {
    as: 'app',
    options: {
      options: {
        'skip-message': options['skip-install-message'],
        'skip-install': options['skip-install']
      }
    }
  });

  this.options = options;

  // check if --requirejs option provided or if require is setup
  if (typeof this.env.options.requirejs === 'undefined') {
    this.option('requirejs');

    this.options.requirejs = this.includeRequireJS();

    this.env.options.requirejs = this.options.requirejs;
  }

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(TumblrGenerator, yeoman.generators.Base);

TumblrGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // have Yeoman greet the user.
  console.log(this.yeoman);

  var prompts = [{
    type: 'confirm',
    name: 'autoprefixer',
    message: 'Would you like to use autoprefixer?',
    default: true
  }];

  this.prompt(prompts, function (props) {
    this.autoprefixer = props.autoprefixer;

    cb();
  }.bind(this));
};

TumblrGenerator.prototype.app = function app() {
  this.mkdir('app');
  this.mkdir('app/templates');

  this.template('_package.json', 'package.json');
  this.template('_bower.json', 'bower.json');
  this.template('_Gruntfile.js', 'Gruntfile.js');
};

TumblrGenerator.prototype.projectfiles = function projectfiles() {
  this.copy('editorconfig', '.editorconfig');
  this.copy('jshintrc', '.jshintrc');
};


/*
 * Check whether the App is a RequireJS app or not
 *
 * @return boolean
 */
TumblrGenerator.prototype.includeRequireJS = function includeRequireJS() {
  if (typeof this.env.options.requirejs !== 'undefined') {
    return this.env.options.requirejs;
  }

  var ext = this.env.options.coffee ? '.coffee' : '.js';
  var filepath = path.join(process.cwd(), 'app/scripts/main' + ext);

  try {
    this.env.options.requirejs = (/require\.config/).test(this.read(filepath));
    return this.env.options.requirejs;
  } catch (e) {
    return false;
  }
};

'use strict';
/* jshint expr:true */

var chai = require('chai');
chai.should();

var Generator = require('./mock-generator');
var generator;

var ui = require('../../app/src/ui.js');

describe('gulp-angular generator ui script', function () {

  before(function() {
    ui(Generator);
  });

  beforeEach(function() {
    generator = new Generator();
  });

  describe('add right files depending choices', function () {
    it('should add only navbar and index.scss for no router and no ui', function() {
      generator.props = {
        router: { module: null },
        ui: { key: 'none' },
        cssPreprocessor: { key: 'none', extension: 'css' }
      };
      generator.files = [];
      generator.uiFiles();
      generator.files[0].src.should.be.equal('src/app/components/navbar/__none-navbar.html');
      generator.files[1].src.should.be.equal('src/app/_none/__none-index.css');
      generator.files[2].src.should.be.equal('src/app/components/malarkey/__malarkey.css');
      generator.files[3].src.should.be.equal('src/app/components/navbar/__navbar.css');
      generator.files.length.should.be.equal(4);
    });

    it('should add 6 files when all options', function() {
      generator.props = {
        router: { module: 'ngRoute' },
        ui: { key: 'bootstrap' },
        cssPreprocessor: { key: 'notnone', extension: 'scss' }
      };
      generator.files = [];
      generator.uiFiles();
      generator.files[0].src.should.be.equal('src/app/components/navbar/__bootstrap-navbar.html');
      generator.files[1].src.should.be.equal('src/app/main/__bootstrap.html');
      generator.files[2].src.should.be.equal('src/app/_bootstrap/__bootstrap-index.scss');
      generator.files[3].src.should.be.equal('src/app/components/malarkey/__malarkey.scss');
      generator.files[4].src.should.be.equal('src/app/components/navbar/__navbar.scss');
      generator.files.length.should.be.equal(5);
    });
  });

  describe('select wiredep exclusions depending the choices', function () {
    it('should exclude bootstrap if angular-boostrap and scss', function() {
      generator.props = {
        jQuery: { key: 'jquery1' },
        ui: { key: 'bootstrap' },
        bootstrapComponents: { key: 'angular-bootstrap' },
        cssPreprocessor: { extension: 'scss' }
      };
      generator.computeWiredepExclusions();
      generator.wiredepExclusions[0].should.be.equal('/bootstrap\.js$/');
      generator.wiredepExclusions[1].should.be.equal('/bootstrap-sass-official\\/.*\\.js/');
      generator.wiredepExclusions[2].should.be.equal('/bootstrap\\.css/');
    });

    it('should exclude only bootstrap.js if angular-boostrap and less', function() {
      generator.props = {
        jQuery: { key: 'jquery1' },
        ui: { key: 'bootstrap' },
        bootstrapComponents: { key: 'angular-bootstrap' },
        cssPreprocessor: { extension: 'less' }
      };
      generator.computeWiredepExclusions();
      generator.wiredepExclusions[0].should.be.equal('/bootstrap\.js$/');
      generator.wiredepExclusions[1].should.be.equal('/bootstrap\\.css/');
    });

    it('should exclude foundation if foundation and sass', function() {
      generator.props = {
        jQuery: { key: 'jquery1' },
        ui: { key: 'foundation' },
        foundationComponents: { key: 'angular-foundation' },
        cssPreprocessor: { extension: 'scss' }
      };
      generator.computeWiredepExclusions();
      generator.wiredepExclusions[0].should.be.equal('/foundation\\.js/');
      generator.wiredepExclusions[1].should.be.equal('/foundation\\.css/');
    });

    it('should exclude foundation if foundation and not sass', function() {
      generator.props = {
        jQuery: { key: 'jquery1' },
        ui: { key: 'foundation' },
        foundationComponents: { key: 'angular-foundation' },
        cssPreprocessor: { extension: 'notscss' }
      };
      generator.computeWiredepExclusions();
      generator.wiredepExclusions[0].should.be.equal('/foundation\\.js/');
    });

    it('should exclude nothing if no ui', function() {
      generator.props = {
        jQuery: { key: 'jquery1' },
        ui: { key: 'none' }
      };
      generator.computeWiredepExclusions();
      generator.wiredepExclusions.length.should.be.equal(0);
    });

    it('should exclude nothing if bootstrap but nothing else', function() {
      generator.props = {
        jQuery: { key: 'jquery1' },
        ui: { key: 'bootstrap' },
        bootstrapComponents: { key: 'official' },
        cssPreprocessor: { key: 'none' }
      };
      generator.computeWiredepExclusions();
      generator.wiredepExclusions.length.should.be.equal(0);
    });

    it('should exclude nothing if foundation but nothing else', function() {
      generator.props = {
        jQuery: { key: 'jquery1' },
        ui: { key: 'foundation' },
        foundationComponents: { key: 'official' },
        cssPreprocessor: { key: 'none' }
      };
      generator.computeWiredepExclusions();
      generator.wiredepExclusions.length.should.be.equal(0);
    });

    it('should exclude jQuery if select "None"', function() {
      generator.props = {
        jQuery: { key: 'none' },
        ui: { key: 'foundation' },
        foundationComponents: { key: 'official' },
        cssPreprocessor: { key: 'none' }
      };
      generator.computeWiredepExclusions();
      generator.wiredepExclusions[0].should.be.equal('/jquery/');
    });
  });

});

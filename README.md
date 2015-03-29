# condensation

Package, reuse and share particles for CloudFormation projects

[![NPM](https://nodei.co/npm/condensation.png)](https://nodei.co/npm/condensation/)

[![Build Status](https://travis-ci.org/SungardAS/condensation.svg?branch=develop)](https://travis-ci.org/SungardAS/condensation?branch=develop)
[![Code Climate](https://codeclimate.com/github/SungardAS/condensation/badges/gpa.svg?branch=develop)](https://codeclimate.com/github/SungardAS/condensation?branch=develop)
[![Coverage Status](https://coveralls.io/repos/SungardAS/condensation/badge.svg?branch=develop)](https://coveralls.io/r/SungardAS/condensation?branch=develop)
[![Dependency Status](https://david-dm.org/SungardAS/condensation.svg?branch=develop)](https://david-dm.org/SungardAS/condensation?branch=develop)


## Summary

Condensation is a [gulp](http://gulpjs.com) task generator that helps
compile, package and upload [AWS CloudFormation](http://aws.amazon.com/cloudformation/)
templates and supporting assets.

Any file with the extension `.hbs` will be compiled with
[Handlebars.js](http://http://handlebarsjs.com/) to support
partials, helpers and variable replacement.

## Features

* Write reusable CloudFormation snippits that can be included as
  partials
* Package and upload templates and assets to multiple buckets across
  regions with one command.
* References other templates within a distribution with
  [AWS::CloudFormation::Stack](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-stack.html)
and the `templateS3Url` helper
* Upload scripts, configuration files and other assets alongside
  CloudFormation templates.
* Use particles from other condensation compatible projects.

## Why?

CloudFormation templates are great for creating, updating and deleting
AWS resources.  Reusing parts of templates, referencing other
templates with `AWS::CloudFormation::Stack` and deploying cloud-init
scripts can be difficult to manage.

* Often sections such as AMI [mappings](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/mappings-section-structure.html)
  are re-used by many templates.  Handlebars partials provide a way to
  write the mapping once and reuse it without copying from template to
  template.
* It is common to set up resources, such as a VPC, with nearly
  identical attributes and structure for different applications and
  services.  Condensation allows that definition to become a independent
  stack that can be referenced by other templates that are part of the
  same package.
* To bootstrap instances it is beneficial to have scripts and configuration
  files deployed in a known location and verisoned with the template
  they are associated with.
* When using `AWS::CloudFormation::Authentication` to download assets from
  S3 buckets all resources must be in the same region.  Condensation
  makes it easy to deploy the same templates and assets to multiple
  regions and ensure the referencing URLs are correct.

Stacks (templates) can be deployed to a bucket
where each stack is able to reference one another.  That pattern can
repeated using difference confgurations for the same templates
to support development, production and multi-region buckets.

Example:

    "TemplateURL": "{{{templateS3Url 'vpc.template' }}}"
    ...
    "TemplateURL": "{{{templateS3Url 'subnet.template' }}}"

Will become:

    "TemplateURL": "https://s3-us-west-1.amazonaws.com/MYBUCKETv1/infra_core/vpc.template"
    ...
    "TemplateURL": "https://s3-us-west-1.amazonaws.com/MYBUCKETv1/infra_core/subnet.template"

With the help of Handlebars the URL will always reference a template deployed within the same
bucket.


## Use

Quick Start Examples: [condensation-examples](https://github.com/SungardAS/condensation-examples)

### Create a project

    > npm init

#### Install [gulp](http://gulpjs.com/)

    > npm install -g gulp
    > npm install gulp --save

#### Install condensation

    > npm install condensation --save

#### Add condensation to gulpfile.js

    var gulp = require('gulp');

    var config = {
      s3: [
        {
          aws: {
            region: 'us-east-1',
            bucket: 'MY-FAVORITE-BUCKET',
          },
          validate: true,
          create: true
        }
      ],
      dist: 'dist'
    };

    // Add necessary gulp tasks to build, compile and validate
    // CloudFormation templates
    require('condensation').buildTasks(gulp,config);

### Project Structure

    my-project
    |
    -- guplfile.js
    |
    -- README.md
    |
    --particles
      |
      --assets
      |
      -- cftemplates
      |
      -- helpers
      |
      -- partials

Condensation loads particles through core helper methods.
The core helper methods are able to load particles from the local project
as well as any condensation compatible project added as a npm
dependency.

All helpers follow the same pattern:

    {{{<CORE-HELPER> [module:<MODULE>] <PATH_TO_PARTICLE> [OPTIONS...]}}}


#### Lazy Loading

Particles will only be included in the final distribution if they are
referenced from a `hbs` file.


#### assets

Files to be uploaded to S3 that are used to supplement CloudFormation
templates.  Files can include boostrap scripts, packaged install files
or configuration files.

Any file with a `.hbs` extension will be
compiled with handlebars and saved to S3 without the `.hbs` extension.

Asset URLs can be built with the `assetS3Url` helper:

    {{{assetS3Url 'my-asset'}}}

    {{{assetS3Url 'module:<MODULE>' 'module-asset'}}}

Example Output:

    "https://s3-us-west-1.amazonaws.com/BUCKET/assets/my-asset"

    "https://s3-us-west-1.amazonaws.com/BUCKET/node_modules/MODULE/particles/assets/module-asset"

To include assets that are not directly referenced from a template
use the `requireAssets` helper.  It will ensure a glob of assets are
included in the distribution.

    {{{requireAssets '/**'}}

    {{{requireAssets 'module:<MODULE>' '/**'}}}

#### cftemplates

CloudFormation templates that will be uploaded to S3.

Any file with a `.hbs` extension will be compiled with
handlebars and saved to S3 without the `.hbs` extension.

Template URLs can be built with the `assetS3Url` helper:

    {{{templateS3Url 'my.template'}}}

    {{{templateS3Url 'module:<MODULE>' 'module.template'}}}

Example Output:

    "https://s3-us-west-1.amazonaws.com/BUCKET/cftemplates/my.template"

    "https://s3-us-west-1.amazonaws.com/BUCKET/node_modules/MODULE/particles/cftemplates/module.template"

#### partials

Contents of files here will be loaded as partials that can be used in
`assets` and `cftemplates`.

These files will not be packaged or uploaded to S3.

Partils can be loaded with the `partial` helper:

    {{{partial 'my-partial'}}}

    {{{partial 'module' 'module-partial'}}}

#### helpers

Node modules that export a function that is built as a
Handlebars [block helper](http://handlebarsjs.com/block_helpers.html).

Helpers are called with the `helper` helper:

    {{{helper 'my-helper'}}}

    {{{helper 'module:<MODULE>' 'module-helper'}}}

### Tasks

Get a full list of tasks by running `gulp -T`

By default all tasks are prefixed with `condensation:`. This can be
changed with the `taskPrefix` config option.

#### Default

The `default` task is an alias for `build`. It will prepare all files
for deployment to s3. Templates and assets are written to the configured
`dist` directory.

    > gulp condensation:default


#### condensation:s3:list
Will list all the configured s3 bukets and module corresponding ID.

    > gulp condensation:s3:list
    [10:21:47] Using gulpfile ~/condensation-example/gulpfile.js
    [10:21:47] Starting 'condensation:s3:list'...
    0: a.bucket.in.us-east-1
    1: a.bucket.in.us-west-2
    [10:21:47] Finished 'condensation:s3:list' after 153 μs

The IDs can be used to deploy to a single bucket instead of all buckets.

#### condensation:deploy
For the `deploy` task to run AWS credentials must be set as environment
variables: `AWS_SECRET_ACCESS_KEY` and `AWS_ACCESS_KEY_ID`

    > AWS_SECRET_ACCESS_KEY=XXXX AWS_ACCESS_KEY_ID=XXXX gulp deploy

This will upload templates to all cofigured S3 buckets.

#### condensation:deploy:ID
Deploy tempates to a specific S3 bucket.

#### condensation:deploy:LABEL
Deploy tempates to all S3 buckets that contain the label, LABEL.

## Config Options

    var config = {
      // Array of S3 buckets to deploy to
      s3: [
        {
          // AWS specific options
          aws: {
            region: 'us-east-1',
            bucket: 'my.bucket.in.us-east-1',
          },

          // Run CloudFormation validation during the build task for this bucket
          validate: true,

          // Create this bucket if it does not already exist
          create: true

          // Prefix all objects (allows for multiple deploymets to the same bucket
          prefix: '',

          labels: ['east']
        },
      ],
      // The prefix to add to all generated gulp tasks (default: 'condensation')
      // An empty string will remove the prefix
      //     - condensation:deploy will become deploy
      taskPrefix: '',

      // Directory that contains the `particles` directory.
      // Used for test scripts, should not be changed if sharing templates
      root: './',

      // Where the build task will put the distribution
      dist: 'dist'
    };


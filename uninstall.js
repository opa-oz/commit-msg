'use strict';

var fs = require('fs');
var path = require('path');
var exists = fs.existsSync || path.existsSync;
var root = path.resolve(__dirname, '..', '..');
var git = path.resolve(root, '.git');

/**
 * Resolve git directory for submodules
 */
if (exists(git) && fs.lstatSync(git).isFile()) {
    var gitinfo = fs.readFileSync(git).toString();
    var gitdirmatch = /gitdir: (.+)/.exec(gitinfo);
    var gitdir = gitdirmatch.length === 2 ? gitdirmatch[1] : null;

    if (gitdir !== null) {
        git = path.resolve(root, gitdir);
    }
}

/**
 * Location of commit-msg hook, if it exists
 */
var commitMsg = path.resolve(git, 'hooks', 'commit-msg');

/**
 * Bail out if we don't have commit-msg file, it might be removed manually.
 */
if (!exists(commitMsg)) return;

/**
 * If we don't have an old file, we should just remove the commit-msg hook. But
 * if we do have an old commitMsg file we want to restore that.
 */
if (!exists(commitMsg + '.old')) {
    fs.unlinkSync(commitMsg);
} else {
    fs.writeFileSync(commitMsg, fs.readFileSync(commitMsg + '.old'));
    fs.chmodSync(commitMsg, '755');
    fs.unlinkSync(commitMsg + '.old');
}

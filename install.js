'use strict';

var fs = require('fs');
var path = require('path');
var os = require('os');
var exists = fs.existsSync || path.existsSync;

var PREFIX = 'commit-msg:';
console.log(PREFIX + ' ' + __dirname);
if (~__dirname.indexOf('/lib/node_modules')) {
    console.log(PREFIX + " Could not be install global");
    return 0;
}

var root = path.resolve(__dirname, '..', '..');
var packageJson = path.resolve(root, 'package.json');
var packageJsonContent = '';

try {
    console.log(PREFIX);
    console.log(PREFIX + ' Try to read package.json');
    console.log(PREFIX);
    packageJsonContent = fs.readFileSync(packageJson);

    if (packageJsonContent) {
        packageJsonContent = JSON.parse(packageJsonContent);
    }

    console.log(PREFIX);
    console.log(PREFIX + ' Successfully read package.json');
    console.log(PREFIX);
} catch (e) {
    console.error(PREFIX);
    console.error(PREFIX + ' Failed to read package.json file');
    console.error(PREFIX + ' ' + e.message);
    console.error(PREFIX);
}

var git = getGitFolderPath(root);
var hooks = path.resolve(git, 'hooks');
var commitMsg = path.resolve(hooks, 'commit-msg');

var regex = '(([a-z]+-[0-9]+:|merge).{6,})';
var errorMsg = 'Your commit message must match the pattern <task_namespace>-<#task>: <text>’, or to be a merge message';

if (packageJsonContent && packageJsonContent['commit-msg']) {
    var commitMsgObj = packageJsonContent['commit-msg'];

    if (commitMsgObj['regex']) {
        regex = commitMsgObj['regex'];
    }

    if (commitMsgObj['error-message']) {
        errorMsg = commitMsgObj['error-message'];
    }
}

/**
 * Bail out if we don't have an `.git` directory as the hooks will not get
 * triggered. If we do have directory create a hooks folder if it doesn't exist.
 */
if (!git) {
    console.log(PREFIX);
    console.log(PREFIX + 'Not found any .git folder for installing commit-msg hook');
    console.log(PREFIX);
    return;
}

/**
 * Resolve git directory for submodules
 */
if (exists(git) && fs.lstatSync(git).isFile()) {
    var gitinfo = fs.readFileSync(git).toString();
    var gitdirmatch = /gitdir: (.+)/.exec(gitinfo);
    var gitdir = gitdirmatch.length === 2 ? gitdirmatch[1] : null;

    if (gitdir !== null) {
        git = path.resolve(root, gitdir);
        hooks = path.resolve(git, 'hooks');
        commitMsg = path.resolve(hooks, 'commit-msg');
    }
}

if (!exists(hooks)) fs.mkdirSync(hooks);

/**
 * If there's an existing `commit-msg` hook we want to back it up instead of
 * overriding it and losing it completely as it might contain something
 * important.
 */
if (exists(commitMsg) && !fs.lstatSync(commitMsg).isSymbolicLink()) {
    console.log(PREFIX);
    console.log(PREFIX + ' Detected an existing git commit-msg hook');
    fs.writeFileSync(commitMsg + '.old', fs.readFileSync(commitMsg));
    console.log(PREFIX + ' Old commit-msg hook backuped to commit-msg.old');
    console.log(PREFIX);
}

/**
 * We cannot create a symlink over an existing file so make sure it's gone and
 * finish the installation process.
 */
try {
    fs.unlinkSync(commitMsg);
}
catch (e) {
}

/**
 * Dynamically create commit-msg hook file (os.EOL for cross-OS)
 */
var commitMsgContent = [
    '#!/usr/bin/env bash',

    'commit_regex=\'' + regex + '\'',
    'error_msg="' + errorMsg + '"',

    'if ! grep -iqE "$commit_regex" "$1"; then',
    '   echo "$error_msg" >&2',
    '   exit 1',
    'fi'
].join(os.EOL) + os.EOL;

/**
 * It could be that we do not have rights to this folder which could cause the
 * installation of this module to completely fail. We should just output the
 * error instead destroying the whole npm install process.
 */
try {
    fs.writeFileSync(commitMsg, commitMsgContent);
}
catch (e) {
    console.error(PREFIX);
    console.error(PREFIX + ' Failed to create the hook file in your .git/hooks folder because:');
    console.error(PREFIX + ' ' + e.message);
    console.error(PREFIX + ' The hook was not installed.');
    console.error(PREFIX);
}

try {
    fs.chmodSync(commitMsg, '777');
}
catch (e) {
    console.error(PREFIX);
    console.error(PREFIX + ' chmod 0777 the commit-msg file in your .git/hooks folder because:');
    console.error(PREFIX + ' ' + e.message);
    console.error('PREFIX');
}

// Function to recursively finding .git folder
function getGitFolderPath(currentPath) {
    var git = path.resolve(currentPath, '.git');

    if (!exists(git) || !fs.lstatSync(git).isDirectory()) {
        console.log(PREFIX);
        console.log(PREFIX + ': Not found .git folder in', git);

        var newPath = path.resolve(currentPath, '..');

        // Stop if we on top folder
        if (currentPath === newPath) {
            return null;
        }

        return getGitFolderPath(newPath);
    }

    console.log(PREFIX);
    console.log(PREFIX = ' Found .git folder in', git);
    return git;
}

# commit-msg-regex

[![Version npm][version]](https://www.npmjs.com/package/commit-msg-regex)

[version]: http://img.shields.io/npm/v/commit-msg-regex.svg?style=flat-square

**commit-msg-regex** is a commit-message hook installer for `git`. It will ensure that
your commit messages fit team's pattern. This all conveniently configured in your `package.json`.

But don't worry, you can still force a commit by telling `git` to skip the
`commit-msg` hooks by simply committing using `--no-verify`.

### Installation

It's advised to install the **commit-msg-regex** module as a `devDependencies` in your
`package.json` as you only need this for development purposes. To install the
module simply run:

```
npm install --save-dev commit-msg-regex
```

When this module is installed it will override
the existing `commit-msg` file in your `.git/hooks` folder. Existing
`commit-msg` hooks will be backed up as `commit-msg.old` in the same repository.

### Configuration

The only thing you need to do is add a `commit-msg` object to your `package.json`
that specifies regex and error message for commit message:

```js
{
  "name": "437464d0899504fb6b7b",
  "version": "0.0.0",
  "description": "ERROR: No README.md file found!",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: I SHOULD FAIL LOLOLOLOLOL \" && exit 1",
    "foo": "echo \"fooo\" && exit 0",
    "bar": "echo \"bar\" && exit 0"
  },
  "commit-mgs": {
    "regex": "([a-z]{5})",
    "error-message": "Need more then 5 symbols"
  }
}
```

### Branch naming
Commit doesn't work in branches with name, started from `hotfix/`. And totally doesn't work in `master` and `develop`

**commit-msg-regex** based on OpenSource project - Observing. Learn more:

https://github.com/observing/pre-commit

To learn more about the scripts, please read the official `npm` documentation:

https://npmjs.org/doc/scripts.html

And to learn more about git hooks read:

http://githooks.com

### License

MIT

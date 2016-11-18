# MAMP

Manage your MAMP server from your node app or the CLI.
Contains a CLI to start a MAMP server from the command line and a nodejs library to manage in your own scripts.

## CLI

Install this library globally:

```bash
$ npm install -g mamp
```

Start a MAMP server by using this globally installed command:

```bash
$ mamp .
```

This will start MAMP in your current directory, and will keep running while the script is running. To stop MAMP, just press CTRL + C or close the terminal window.

You can specify a different document root as an argument for the CLI:

```bash
$ mamp ~/Documents/htdocs
```

Another option is running Apache on a different port, by specifying -p or --port:

```bash
$ mamp . -p 9000
```

See all available options by running the command with --help:

```bash
$ mamp --help
```

## Node Library

Another option is to start / stop the MAMP server from your own scripts:

```javascript
var path = require('path'),
  mamp = require('mamp'),
  mampServer = mamp();

mampServer.start({
  documentRoot: path.resolve(__dirname, 'public')
});
```

Be aware: you will need to stop the mamp server yourself when using it in your own scripts:

```javascript
mampServer.stop();
```

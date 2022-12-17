# Pure Script

## Software Requirements:

- Nodejs (Tested on versions 16 and 19).
- Npm (This usually comes bundled with Nodejs).

## How to change the script to point to your page?
Opening the `index.js` file with any text editor, at the top there is a constant variable with the URL to Kostas' website, simply change it to your website, but be careful to leave the slashes and extra URL parameters in place, the script counts on them.

## Running the program
Run the following commands on a terminal:
- npm install //Installs the needed dependencies
- node index.js > publications.txt // Or just `node index.js`, if you don't want the output saved to a file.

This will take the output of `index.js` and pipe it into a text file which you can then copy and paste from if you need. This was tested on a bash terminal on a Linux and Windows system.

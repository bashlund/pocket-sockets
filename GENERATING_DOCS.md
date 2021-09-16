For each and every file under the _./src_ directory, run an isolated export command line as follows:
```
./node_modules/.bin/typedoc --entryDocument Home.md --hideBreadcrumbs true --hideInPageTOC true --cleanOutputDir false ./src/$FILE_NAME_HERE.ts
```

Remove the modules index file, then copy the results over to the wiki repository:
```
rm ./docs/modules.md
cp -r ./docs/* ../pocket-sockets.wiki/.
```

Updating the wiki repository:
```
cd ../pocket-sockets.wiki
git add .
git commit -S -m "Updating documentation to reflect latest code"
git push origin master
```

#!/usr/bin/env sh

if [ -n "$(git status --porcelain)" ];then
  echo "Changes found => pushing"
  WARFRAME_BUILD="$(cat ./data/version)"
  git config user.name "Titania CI"
  git config user.email "titaniaci@sleepylux.xyz"
  git add .
  git commit -m "📝 Update(items) for Warframe Version $WARFRAME_BUILD"
  git remote rm origin
  git remote add origin "https://$ACCESS_TOKEN@github.com/TitaniaProject/warframe-relic-data"
  git push -u origin master
  echo "Sucessfully updated Items to Warframe version $WARFRAME_BUILD"
else
  echo "No changes found => Finished."
fi
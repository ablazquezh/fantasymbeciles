#!/bin/bash

find public/static/teams/fifa19 -type f -print0 | while IFS= read -r -d '' file; do
  nfcname=$(echo "$file" | iconv -f utf-8-mac -t utf-8)
  if [ "$file" != "$nfcname" ]; then
    mv "$file" "$nfcname"
  fi
done

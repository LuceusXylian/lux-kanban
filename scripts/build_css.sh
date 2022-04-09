#!/bin/bash

# shitty workaround for the fact that the css files are not in the same way imported as scss files
#cp ./node_modules/dragular/dist/dragular.css ./node_modules/dragular/dist/dragular.scss
node-sass lux-kanban.scss dist/lux-kanban.css

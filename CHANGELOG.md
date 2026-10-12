# table-rollup

## 1.1.0

### Minor Changes

- 706de62: Add a "Find rows" box to the view bar. The box keeps only the rows whose cells or source note name hold the text, and the summary row adds up the rows that are left. The find text is saved with the view in the base file.

## 1.0.4

### Patch Changes

- efdff8f: Correct the GitHub Sponsors payment, check and token storage text in the README.

## 1.0.3

### Patch Changes

- b09257c: After a plugin update or reload with a base open, the view now runs the new plugin code. Before, Bases kept the old view, so Pro and the commands did not reach it until the tab was opened again.

## 1.0.2

### Patch Changes

- facd515: The time stamp in the name of an exported file now comes from the plain JavaScript Date, not from moment. The name format stays the same (YYYY-MM-DD HHmm). This removes the type warnings that the community directory scanner reports for moment calls.

## 1.0.1

### Patch Changes

- 059af6c: Pro stays on when you have paid $15 in total to theluckystrike on GitHub Sponsors. A lifetime buyer who later starts and cancels a monthly sponsorship no longer loses Pro.

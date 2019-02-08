# export-answerhub-data
Export Answerhub Question data using the REST API

## Usage
Usage: app [options] <host> <username> <password> [start] [end]

Options:
  -V, --version               output the version number
  -t, --topics <topics>       A comma separated list of topics to filter questions by. If multiple topics are supplied, the question must be ALL topics to be returned.
  -s, --space <space>         Filter by questions belonging to a certain space.
  -p, --page-size <pageSize>  The page size to use for each request. Lower it if the tool seems to fail or be slow. (default: 15)
  -f, --file-type [format]    Export the data in a particular format
  -h, --help                  output usage information

[start] and [end] represent date range filters.
They must be provided in ISO-8061 format.
Examples:
  2008-09-15
  2008-09-15T15:53:00
  2008-09-15T15:53:00+05:00
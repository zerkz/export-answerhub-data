# export-answerhub-data
[![CircleCI](https://circleci.com/gh/zerkz/export-answerhub-data/tree/master.svg?style=svg)](https://circleci.com/gh/zerkz/export-answerhub-data/tree/master)
[![codecov](https://codecov.io/gh/zerkz/export-answerhub-data/branch/master/graph/badge.svg)](https://codecov.io/gh/zerkz/export-answerhub-data)
![david-deps](https://img.shields.io/david/zerkz/export-answerhub-data.svg)

Export question data from [Answerhub](https://devada.com/answerhub/) using this CLI! 

Can generate data reports in CSV or JSON format! 

Filter by space, topics, and question creation date!

## Install

`npm install -g export-answerhub-data`

## CLI How To
```
Usage: export-answerhub-data [options] <host> <username> <password> [start] [end]

Options:
  -V, --version               output the version number
  -t, --topics <topics>       A comma separated list of topics to filter questions by. If multiple topics are supplied, the question must be ALL topics to be returned.
  -s, --space <space>         Filter by questions belonging to a certain space. 
  -p, --page-size <pageSize>  The page size to use for each request. Lower it if the tool seems to fail or be slow. (default: 15)
  -f, --file-type <format>    Export the data in a particular format (default is csv). 
  	 Formats available: csv,json
  -h, --help                  output usage information

[start] and [end] represent date range filters.
They must be provided in ISO-8061 format.
Examples:
  2008-09-15
  2008-09-15T15:53:00
  2008-09-15T15:53:00+05:00
```

### Example
`export-answerhub-data -f json -p 30 apidocs.cloud.answerhub.com answerhub test123`

The above to will write question data in JSON format from the Answehub Demo API, using a page size of 30. 


## FAQ
**The tool doesn't seem to be working or is crashing!**

In my experience, an Answerhub API server can be fickle and unstable. I've seen the server return 500 if you send too many requests at once, or just from bad data that happened to be in the requested page. 

For this, try lowering the **concurrency** option (`-c`) and/or the **page size** (`-p`). Setting your page size to 1 will ensure you get the most data, but it will take longer. 

**My Answerhub installation has a data export, why would I use this?**

Again, in my experience, the data export is not always available depending upon what version of you are on. For example, data export is available in 1.8, but whenever I upgraded to 1.9, it disappeared. This is also just easier, especially for a developer!

## Issues
If you are having problems or believe you found a bug, please [make an issue](https://github.com/zerkz/export-answerhub-data/issues/new). Do not include sensitive details such as your Answerhub credentials.

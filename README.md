# Running:
This project runs via Docker-compose.
<br />
```
docker-compose build
docker-compose up
```

Alternatively, you can use regular start, but make sure you have Redis locally (or modify it via .env file).
```
npm start
```

# Testing:
The project runs tests via Mocha and displays code-coverage using Istanbul NYC.

# Next steps:
We will need to compare the result of the API in order to find which packages and dependencies are vulnerable.
We can use the tree structure to traverse and mark the vulnerable packages (and packages that have vulnerable children).
<br />
We can also use the flat-hash of vulnerable packages to avoid tree-traversion.

# Improvements & Comments:
I have decided to use Redis for caching, since it has sofisticated eviction strategies, meaning we can offload the decision-making process to Redis.
<br />
Better and more efficient algorithms caching can be put into place to traverse the dependencies: space complexity can be improved if we avoid saving whole JSONs on Redis.
<br />
Better sorting and version choosing can be done in the Version querying service of NPM (instead of just 'sort' and 'filter'. we can cache results, cache versions and invalidate the cache every now and then).


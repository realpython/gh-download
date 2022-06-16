
If testing on localhost port 5500

http://127.0.0.1:5500/index.html?url=https%3A%2F%2Fgithub.com%2Frealpython%2Fmaterials%2Ftree%2Fmaster%2Fpython-yaml
http://127.0.0.1:5500/index.html?url=https%3A%2F%2Fgithub.com%2Frealpython%2Fmaterials%2Ftree%2F7010df1c142cefe717be3ccb406b914b7cd5677e%2Fweb-scraping-bs4
http://127.0.0.1:5500/index.html?url=https%3A%2F%2Fgithub.com%2Frealpython%2Fmaterials%2Fblob%2Fmaster%2Fpython-eval-mathrepl%2Fmathrepl.py
http://127.0.0.1:5500/index.html?url=https%3A%2F%2Fgithub.com%2Frealpython%2Fmaterials%2Fblob%2Fd10ccf9e4451c1dbe99d9d3d06ea794bcb90188f%2Fpython-eval-mathrepl%2Fmathrepl.py
http://127.0.0.1:5500/index.html?url=https%3A%2F%2Fgithub.com%2Frealpython%2Fdockerizing-django%2Ftree%2Fd3dc0dd9d2450f51c75337083edcdd4597f4ec1d

should download what is at each of these:

https://github.com/realpython/materials/tree/master/python-yaml
https://github.com/realpython/materials/tree/7010df1c142cefe717be3ccb406b914b7cd5677e/web-scraping-bs4
https://github.com/realpython/materials/blob/master/python-eval-mathrepl/mathrepl.py
https://github.com/realpython/materials/blob/d10ccf9e4451c1dbe99d9d3d06ea794bcb90188f/python-eval-mathrepl/mathrepl.py
https://github.com/realpython/dockerizing-django/tree/d3dc0dd9d2450f51c75337083edcdd4597f4ec1d

These types of url should be invalid:

http://127.0.0.1:5500/index.html?url=https%3A%2F%2Fgithub.com%2Frahmonov%2Falcazar
http://127.0.0.1:5500/index.html?url=https%3A%2F%2Fgithub.com%2Frealpython%2Fdockerizing-django%2Farchive%2Fmaster.zip

No 'url' key:
http://127.0.0.1:5500/index.html?https%3A%2F%2Fgithub.com%2Frealpython%2Fmaterials%2Ftree%2Fmaster%2Fpython-yaml

Invalid url:
http://127.0.0.1:5500/index.html?url=htt%2Frealpython%2Fmaterials%2Ftree%2Fmaster%2Fpython-yaml

404:
http://127.0.0.1:5500/index.html?url=https%3A%2F%2Fgithub.com%2FrealpythoONONONn%2Fmaterials%2Ftree%2Fmaster%2Fpython-yaml